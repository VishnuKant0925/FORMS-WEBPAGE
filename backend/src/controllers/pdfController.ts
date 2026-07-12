import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import puppeteer, { type Browser } from 'puppeteer';
import Submission from '../models/Submission';
import { AuthRequest } from '../middleware/auth';
import { fillDocxAndConvertToPdf } from '../utils/docxUtils';

// ─── Allowed form field names (ReDoS prevention allowlist) ─
const ALLOWED_FORM_FIELDS = new Set([
  // casual_leave_nrsc
  'applicantName','designationGrade','employeeCode','groundForLeave','numberOfDays',
  'fromDate','toDate','halfDay','leaveStation','clAvailedCurrentYear','applicationDate',
  // earned_leave
  'divisionSection','basicPay','hraConveyanceAllowance','leaveRulesApplicable','leaveType',
  'sundaysHolidaysPrefixSuffix','dateOfReturnFromLastLeave','ltcProposal','ltcBlockYear','leaveAddress',
  // casual_leave_rrsc
  'natureOfLeave','prefixing','suffixing','purpose','addressDuringLeave','interveningClosedHolidays','clTakenSoFar',
  'clCheck', 'splClCheck', 'compOffCheck',
  // trainee_biodata
  'studentName','fatherHusbandName','nationality','dateOfBirth',
  'presentAddress','presentContactNumber','presentEmail',
  'permanentAddress','permanentContactNumber','permanentEmail',
  'institutionCollegeName','affiliatedUniversity','disciplineSemesterYear',
  'hodGuideName','hodGuideAddress','hodGuideContactEmail',
  'projectTitle','projectGuide','projectPeriod',
  'entryPassDate','lockerIssued','lockerKeyNumber','lockerKeyDepositDate',
  'doc_bacsRegistration', 'doc_collegeLetter', 'doc_characterCertificate', 'doc_passportPhoto', 'doc_aadhaarCard', 'doc_otherIdCopy', 'doc_collegeIdCopy',
  // shared — signature + submission timestamp (added by all forms on final submit)
  'employeeSignature', 'traineeSignature',
  'submittedAt', 'submittedDate', 'submittedTime',
]);

/** Fields whose value is a base64 image — rendered as <img> in the PDF */
const IMAGE_FIELDS = new Set(['employeeSignature', 'traineeSignature']);

// ─── Font Map ─────────────────────────────────────────────
const FONT_MAP: Record<string, string> = {
  hi: 'NotoSansDevanagari-Regular.ttf',
  mr: 'NotoSansDevanagari-Regular.ttf',
  bn: 'NotoSansBengali-Regular.ttf',
  gu: 'NotoSansGujarati-Regular.ttf',
  ta: 'NotoSansTamil-Regular.ttf',
  te: 'NotoSansTelugu-Regular.ttf',
  kn: 'NotoSansKannada-Regular.ttf',
  ml: 'NotoSansMalayalam-Regular.ttf',
  pa: 'NotoSansGurmukhi-Regular.ttf',
  or: 'NotoSansOriya-Regular.ttf',
};

// ─── Puppeteer Singleton with Health Check ────────────────
let _browser: Browser | null = null;

const getBrowser = async (): Promise<Browser> => {
  // Re-launch if disconnected or never started
  if (!_browser || !_browser.isConnected()) {
    if (_browser) {
      try { await _browser.close(); } catch { /* ignore close errors */ }
    }
    _browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--font-render-hinting=none',  // sharper Indic rendering
      ],
      ...(process.env.PUPPETEER_EXECUTABLE_PATH
        ? { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH }
        : {}),
    });
    console.log('[pdf] Puppeteer browser launched');
  }
  return _browser;
};

// ─── Inject font CSS into HTML ────────────────────────────
const injectFont = (html: string, language: string): string => {
  const fontFile = FONT_MAP[language] ?? FONT_MAP['hi'];
  const fontPath = path.join(__dirname, '..', 'fonts', fontFile);
  if (!fs.existsSync(fontPath)) return html;

  const fontBase64 = fs.readFileSync(fontPath).toString('base64');
  const fontCss = `
    @font-face {
      font-family: 'NotoIndic';
      src: url(data:font/truetype;base64,${fontBase64}) format('truetype');
      font-display: block;
    }
    body, * { font-family: 'NotoIndic', 'Noto Sans', Arial, sans-serif !important; }
  `;
  return html.replace(/<\/head>/i, `<style>${fontCss}</style></head>`);
};

// ─── Fill template placeholders (safe, allowlist-based) ───
const fillTemplate = (html: string, formData: Record<string, unknown>): string => {
  for (const [key, value] of Object.entries(formData)) {
    // Only process known field names to prevent ReDoS
    if (!ALLOWED_FORM_FIELDS.has(key)) continue;
    const placeholder = `{{${key}}}`;

    let safeValue: string;
    if (IMAGE_FIELDS.has(key) && typeof value === 'string' && value.startsWith('data:image')) {
      // Render as an <img> tag so the signature appears in the PDF
      safeValue = `<img src="${value}" alt="Signature" style="max-height:48px;max-width:160px;object-fit:contain;display:block;" />`;
    } else {
      safeValue = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
    }
    // Use split/join for literal replacement — no regex, zero ReDoS risk
    html = html.split(placeholder).join(safeValue);
  }
  // Clear any remaining unfilled placeholders
  return html.replace(/\{\{[^}]+\}\}/g, '—');
};

// ─── PDF Generation ───────────────────────────────────────
export const generatePdf = async (req: AuthRequest, res: Response): Promise<void> => {
  let page;
  try {
    const filter: Record<string, unknown> = { _id: req.params.submissionId };
    if (req.userRole !== 'admin' && req.userRole !== 'hr' && req.userRole !== 'supervisor') {
      filter.userId = req.userId;
    }
    const submission = await Submission.findOne(filter);
    if (!submission) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    // If this is the casual_leave_rrsc form, use the DOCX templating route for pinpoint accuracy
    if (submission.formType === 'casual_leave_rrsc') {
      const pdfBuffer = await fillDocxAndConvertToPdf(submission.formType, submission.formData as Record<string, unknown>);
      
      const employeeCode = String((submission.formData as Record<string, unknown>).employeeCode ?? 'unknown').replace(/[^a-zA-Z0-9-]/g, '');
      const timestamp    = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename     = `NRSC_${submission.formType}_${employeeCode}_${timestamp}.pdf`;

      res.set({
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length':      String(pdfBuffer.length),
        'Cache-Control':       'no-store',
      });
      res.end(pdfBuffer);
      return;
    }

    // Load HTML template for other forms
    const templatePath = path.join(__dirname, '..', 'templates', `${submission.formType}.html`);
    if (!fs.existsSync(templatePath)) {
      res.status(500).json({ error: `PDF template not yet available for: ${submission.formType}` });
      return;
    }
    let html = fs.readFileSync(templatePath, 'utf-8');

    // Fill + inject font
    html = fillTemplate(html, submission.formData as Record<string, unknown>);
    html = injectFont(html, submission.language);

    // Generate PDF
    const browser = await getBrowser();
    page          = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30_000 });
    const pdfBuffer = await page.pdf({
      format:          'A4',
      printBackground: true,
      margin:          { top: '15mm', right: '12mm', bottom: '15mm', left: '12mm' },
    });
    await page.close();
    page = undefined;

    const employeeCode = String((submission.formData as Record<string, unknown>).employeeCode ?? 'unknown').replace(/[^a-zA-Z0-9-]/g, '');
    const timestamp    = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename     = `NRSC_${submission.formType}_${employeeCode}_${timestamp}.pdf`;

    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length':      String(pdfBuffer.length),
      'Cache-Control':       'no-store',
    });
    res.end(pdfBuffer);
  } catch (err) {
    console.error('[pdf] generation error:', err);
    // Close errored page to prevent resource leak
    if (page) { try { await page.close(); } catch { /* ignore */ } }
    if (!res.headersSent) {
      res.status(500).json({ error: 'PDF generation failed. Please try again.' });
    }
  }
};
