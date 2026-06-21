'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslitStore } from '@/store/useTranslitStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { formService } from '@/services/formService';
import FormHeader from './FormHeader';
import FormToolbar from './FormToolbar';
import TransliterateField from './TransliterateField';
import SignatureUpload from './SignatureUpload';
import FormPreview from './FormPreview';
import { useRouter } from 'next/navigation';

const EarnedLeaveSchema = z.object({
  applicantName: z.string().min(2, 'Name must be at least 2 characters'),
  designationGrade: z.string().min(2, 'Designation / Grade is required'),
  divisionSection: z.string().min(2, 'Division / Section is required'),
  employeeCode: z.string().min(3, 'Employee code is required'),
  basicPay: z.string().min(1, 'Basic pay is required'),
  hraConveyanceAllowance: z.string().default(''),
  leaveRulesApplicable: z.string().min(2, 'Leave rules applicable is required'),
  leaveType: z.string().min(2, 'Type of leave is required'),
  numberOfDays: z.string().min(1, 'Number of days is required'),
  fromDate: z.string().min(1, 'From date is required'),
  toDate: z.string().min(1, 'To date is required'),
  sundaysHolidaysPrefixSuffix: z.string().default(''),
  groundForLeave: z.string().min(5, 'Ground / Reason for leave is required'),
  dateOfReturnFromLastLeave: z.string().default(''),
  ltcProposal: z.enum(['yes', 'no']).default('no'),
  ltcBlockYear: z.string().default(''),
  leaveAddress: z.string().min(5, 'Leave address is required'),
  applicationDate: z.string().min(1, 'Application date is required'),
});

type EarnedLeaveInputs = z.infer<typeof EarnedLeaveSchema>;

interface EarnedLeaveFormProps {
  initialData?: Record<string, any>;
  draftId?: string;
}

export default function EarnedLeaveForm({ initialData, draftId: incomingDraftId }: EarnedLeaveFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { lang: translitLang } = useTranslitStore();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [errorMsg, setErrorMsg]           = useState<string | null>(null);
  const [signature, setSignature]         = useState<string>('');
  const [sigError, setSigError]           = useState<string | null>(null);

  const defaultValues: EarnedLeaveInputs = {
    applicantName: initialData?.applicantName || user?.name || '',
    designationGrade: initialData?.designationGrade || user?.designation || '',
    divisionSection: initialData?.divisionSection || user?.department || '',
    employeeCode: initialData?.employeeCode || user?.employeeCode || '',
    basicPay: initialData?.basicPay || '',
    hraConveyanceAllowance: initialData?.hraConveyanceAllowance || '',
    leaveRulesApplicable: initialData?.leaveRulesApplicable || 'CCS (Leave) Rules 1972',
    leaveType: initialData?.leaveType || 'Earned Leave (अर्जित अवकाश)',
    numberOfDays: initialData?.numberOfDays || '1',
    fromDate: initialData?.fromDate || '',
    toDate: initialData?.toDate || '',
    sundaysHolidaysPrefixSuffix: initialData?.sundaysHolidaysPrefixSuffix || '',
    groundForLeave: initialData?.groundForLeave || '',
    dateOfReturnFromLastLeave: initialData?.dateOfReturnFromLastLeave || '',
    ltcProposal: initialData?.ltcProposal || 'no',
    ltcBlockYear: initialData?.ltcBlockYear || '',
    leaveAddress: initialData?.leaveAddress || '',
    applicationDate: initialData?.applicationDate || new Date().toISOString().split('T')[0],
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<EarnedLeaveInputs>({
    resolver: zodResolver(EarnedLeaveSchema),
    defaultValues,
  });

  useEffect(() => {
    if (incomingDraftId && !initialData) {
      formService.getSubmission(incomingDraftId)
        .then((submission) => {
          if (submission && submission.formData) {
            reset(submission.formData as any);
          }
        })
        .catch((err) => {
          console.error('Failed to load draft:', err);
          setErrorMsg('Failed to load draft data.');
        });
    }
  }, [incomingDraftId, initialData, reset]);

  const formValues = watch();

  // Setup Auto-Save
  const { draftId, saveStatus, lastSaved, save } = useAutoSave(
    'earned_leave',
    isDirty ? formValues : undefined,
    translitLang,
    incomingDraftId || null
  );

  const handleOpenPreview = () => {
    if (!signature) {
      setSigError('Employee signature is required before submission.');
      return;
    }
    setSigError(null);
    setIsPreviewOpen(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const now = new Date();
      const submissionPayload = {
        ...formValues,
        employeeSignature: signature,
        submittedAt:       now.toISOString(),
        submittedDate:     now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }),
        submittedTime:     now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }) + ' IST',
      };
      await formService.submit('earned_leave', translitLang, submissionPayload);
      if (draftId) {
        try {
          await formService.deleteDraft(draftId);
        } catch {
          // ignore
        }
      }
      router.push('/history');
      router.refresh();
    } catch (error: any) {
      console.error('Submission error:', error);
      setErrorMsg(error?.response?.data?.error || 'Failed to submit form. Please try again.');
      setIsPreviewOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <FormToolbar
        saveStatus={saveStatus}
        lastSaved={lastSaved}
        onSave={save}
        isSaving={saveStatus === 'saving'}
      />

      {errorMsg && (
        <div className="p-4 mb-6 text-sm text-[#D32F2F] bg-[#FFEBEE] border-l-4 border-[#D32F2F] rounded">
          {errorMsg}
        </div>
      )}


      {/* Main Form Card */}
      <form onSubmit={handleSubmit(handleOpenPreview)} className="w-full space-y-6">
        <FormHeader
          orgNameHindi="राष्ट्रीय सुदूर संवेदन केंद्र (एनआरएससी), हैदराबाद"
          orgNameEnglish="National Remote Sensing Centre (NRSC), Hyderabad"
          formTitleHindi="छुट्टी / छुट्टी के विस्तार के लिए आवेदन"
          formTitleEnglish="Application for Leave / Extension of Leave"
        />

        {/* Section 1: Employee Information */}
        <div className="form-section-card animate-fade-in">
          <h3 className="form-section-title">Employee Information / कर्मचारी की जानकारी</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Applicant Name */}
              <Controller
                name="applicantName"
                control={control}
                render={({ field }) => (
                  <TransliterateField
                    fieldNumber="1."
                    labelHindi="आवेदक का नाम"
                    labelEnglish="Name of the Applicant"
                    name="applicantName"
                    value={field.value}
                    onChange={(_, val) => field.onChange(val)}
                    required
                    errorMessage={errors.applicantName?.message}
                  />
                )}
              />

              {/* 2. Designation / Grade */}
              <Controller
                name="designationGrade"
                control={control}
                render={({ field }) => (
                  <TransliterateField
                    fieldNumber="2."
                    labelHindi="पदनाम / श्रेणी"
                    labelEnglish="Designation / Grade"
                    name="designationGrade"
                    value={field.value}
                    onChange={(_, val) => field.onChange(val)}
                    required
                    errorMessage={errors.designationGrade?.message}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 3. Division / Section */}
              <Controller
                name="divisionSection"
                control={control}
                render={({ field }) => (
                  <TransliterateField
                    fieldNumber="3."
                    labelHindi="प्रभाग / अनुभाग"
                    labelEnglish="Division / Section"
                    name="divisionSection"
                    value={field.value}
                    onChange={(_, val) => field.onChange(val)}
                    required
                    errorMessage={errors.divisionSection?.message}
                  />
                )}
              />

              {/* 4. Employee Code */}
              <div className="form-field-row">
                <label htmlFor="employeeCode" className="form-label">
                  <span className="field-number">4.</span>
                  <span className="label-hindi hindi" lang="hi">कर्मचारी कोड</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">Employee Code</span>
                  <span className="required-marker">*</span>
                </label>
                <input
                  id="employeeCode"
                  type="text"
                  {...register('employeeCode')}
                  className="form-input"
                  required
                />
                {errors.employeeCode && (
                  <p className="text-xs text-[#D32F2F] mt-1">{errors.employeeCode.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 5. Basic Pay */}
              <div className="form-field-row">
                <label htmlFor="basicPay" className="form-label">
                  <span className="field-number">5.</span>
                  <span className="label-hindi hindi" lang="hi">मूल वेतन</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">Basic Pay</span>
                  <span className="required-marker">*</span>
                </label>
                <input
                  id="basicPay"
                  type="text"
                  {...register('basicPay')}
                  className="form-input"
                  placeholder="e.g. ₹ 56,100"
                  required
                />
                {errors.basicPay && (
                  <p className="text-xs text-[#D32F2F] mt-1">{errors.basicPay.message}</p>
                )}
              </div>

              {/* 6. HRA / Conveyance Allowance */}
              <div className="form-field-row">
                <label htmlFor="hraConveyanceAllowance" className="form-label">
                  <span className="field-number">6.</span>
                  <span className="label-hindi hindi" lang="hi">मकान किराया / परिवहन भत्ता</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">HRA / Conveyance Allowance</span>
                </label>
                <input
                  id="hraConveyanceAllowance"
                  type="text"
                  {...register('hraConveyanceAllowance')}
                  className="form-input"
                  placeholder="e.g. ₹ 13,464"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Leave Details */}
        <div className="form-section-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="form-section-title">Leave Details / अवकाश का विवरण</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 7. Leave Rules Applicable */}
              <div className="form-field-row">
                <label htmlFor="leaveRulesApplicable" className="form-label">
                  <span className="field-number">7.</span>
                  <span className="label-hindi hindi" lang="hi">लागू छुट्टी नियम</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">Leave Rules Applicable</span>
                  <span className="required-marker">*</span>
                </label>
                <input
                  id="leaveRulesApplicable"
                  type="text"
                  {...register('leaveRulesApplicable')}
                  className="form-input"
                  required
                />
                {errors.leaveRulesApplicable && (
                  <p className="text-xs text-[#D32F2F] mt-1">{errors.leaveRulesApplicable.message}</p>
                )}
              </div>

              {/* 8. Type of Leave */}
              <div className="form-field-row">
                <label htmlFor="leaveType" className="form-label">
                  <span className="field-number">8.</span>
                  <span className="label-hindi hindi" lang="hi">छुट्टी का प्रकार</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">Type of Leave</span>
                  <span className="required-marker">*</span>
                </label>
                <select id="leaveType" {...register('leaveType')} className="form-input select-wrapper" style={{ height: '42px', borderRadius: '10px' }} required>
                  <option value="Earned Leave (अर्जित अवकाश)">Earned Leave (EL / अर्जित अवकाश)</option>
                  <option value="Half Pay Leave (अर्ध-वेतन अवकाश)">Half Pay Leave (HPL / अर्ध-वेतन अवकाश)</option>
                  <option value="Commuted Leave (रूपांतरित अवकाश)">Commuted Leave (रूपांतरित अवकाश)</option>
                  <option value="Maternity Leave (मातृत्व अवकाश)">Maternity Leave (मातृत्व अवकाश)</option>
                  <option value="Paternity Leave (पितृत्व अवकाश)">Paternity Leave (पितृत्व अवकाश)</option>
                  <option value="Child Care Leave (बाल देखभाल अवकाश)">Child Care Leave (CCL / बाल देखभाल अवकाश)</option>
                  <option value="Extraordinary Leave (असाधारण अवकाश)">Extraordinary Leave (EOL / असाधारण अवकाश)</option>
                </select>
              </div>
            </div>

            {/* Date range grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* From Date */}
              <div className="form-field-row">
                <label htmlFor="fromDate" className="form-label">
                  <span className="field-number">10a.</span>
                  <span className="label-hindi hindi" lang="hi">छुट्टी की तारीख (से)</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">Leave from Date</span>
                  <span className="required-marker">*</span>
                </label>
                <input
                  id="fromDate"
                  type="date"
                  {...register('fromDate')}
                  className="form-input"
                  required
                />
                {errors.fromDate && (
                  <p className="text-xs text-[#D32F2F] mt-1">{errors.fromDate.message}</p>
                )}
              </div>

              {/* To Date */}
              <div className="form-field-row">
                <label htmlFor="toDate" className="form-label">
                  <span className="field-number">10b.</span>
                  <span className="label-hindi hindi" lang="hi">छुट्टी की तारीख (तक)</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">Leave to Date</span>
                  <span className="required-marker">*</span>
                </label>
                <input
                  id="toDate"
                  type="date"
                  {...register('toDate')}
                  className="form-input"
                  required
                />
                {errors.toDate && (
                  <p className="text-xs text-[#D32F2F] mt-1">{errors.toDate.message}</p>
                )}
              </div>

              {/* Number of Days */}
              <div className="form-field-row">
                <label htmlFor="numberOfDays" className="form-label">
                  <span className="field-number">9.</span>
                  <span className="label-hindi hindi" lang="hi">दिनों की संख्या</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">Number of Days</span>
                  <span className="required-marker">*</span>
                </label>
                <input
                  id="numberOfDays"
                  type="number"
                  min="1"
                  {...register('numberOfDays')}
                  className="form-input"
                  required
                />
                {errors.numberOfDays && (
                  <p className="text-xs text-[#D32F2F] mt-1">{errors.numberOfDays.message}</p>
                )}
              </div>
            </div>

            {/* 11. Prefix/Suffix */}
            <Controller
              name="sundaysHolidaysPrefixSuffix"
              control={control}
              render={({ field }) => (
                <TransliterateField
                  fieldNumber="11."
                  labelHindi="रविवार/छुट्टियाँ (उपसर्ग/प्रत्यय)"
                  labelEnglish="Sundays / Holidays (Prefix / Suffix)"
                  name="sundaysHolidaysPrefixSuffix"
                  value={field.value}
                  onChange={(_, val) => field.onChange(val)}
                  placeholder="e.g. Prefix: none, Suffix: Sunday 21 June"
                  errorMessage={errors.sundaysHolidaysPrefixSuffix?.message}
                />
              )}
            />

            {/* 12. Ground for Leave */}
            <Controller
              name="groundForLeave"
              control={control}
              render={({ field }) => (
                <TransliterateField
                  fieldNumber="12."
                  labelHindi="छुट्टी का कारण"
                  labelEnglish="Ground / Reason for Leave"
                  name="groundForLeave"
                  value={field.value}
                  onChange={(_, val) => field.onChange(val)}
                  multiline
                  rows={2}
                  required
                  errorMessage={errors.groundForLeave?.message}
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 13. Return from last leave */}
              <div className="form-field-row">
                <label htmlFor="dateOfReturnFromLastLeave" className="form-label">
                  <span className="field-number">13.</span>
                  <span className="label-hindi hindi" lang="hi">अंतिम छुट्टी से वापसी की तारीख</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">Date of Return from Last Leave</span>
                </label>
                <input
                  id="dateOfReturnFromLastLeave"
                  type="date"
                  {...register('dateOfReturnFromLastLeave')}
                  className="form-input"
                />
              </div>

              {/* 14. LTC Proposal */}
              <div className="form-field-row">
                <span className="form-label">
                  <span className="field-number">14.</span>
                  <span className="label-hindi hindi" lang="hi">क्या LTC का प्रस्ताव है?</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">Do you propose to avail LTC?</span>
                </span>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                    <input
                      type="radio"
                      value="yes"
                      {...register('ltcProposal')}
                      className="w-4 h-4 text-[#0B3C6D] focus:ring-[#0B3C6D]"
                    />
                    <span>हाँ / Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                    <input
                      type="radio"
                      value="no"
                      {...register('ltcProposal')}
                      className="w-4 h-4 text-[#0B3C6D] focus:ring-[#0B3C6D]"
                    />
                    <span>नहीं / No</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 15. LTC Block Year */}
            {formValues.ltcProposal === 'yes' && (
              <div className="form-field-row animate-fade-in">
                <label htmlFor="ltcBlockYear" className="form-label">
                  <span className="field-number">15.</span>
                  <span className="label-hindi hindi" lang="hi">LTC ब्लॉक वर्ष</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">LTC Block Year</span>
                </label>
                <input
                  id="ltcBlockYear"
                  type="text"
                  {...register('ltcBlockYear')}
                  className="form-input"
                  placeholder="e.g. 2026-2029"
                />
              </div>
            )}

            {/* 16. Leave Address */}
            <Controller
              name="leaveAddress"
              control={control}
              render={({ field }) => (
                <TransliterateField
                  fieldNumber="16."
                  labelHindi="छुट्टी का पता"
                  labelEnglish="Leave Address"
                  name="leaveAddress"
                  value={field.value}
                  onChange={(_, val) => field.onChange(val)}
                  multiline
                  rows={3}
                  required
                  errorMessage={errors.leaveAddress?.message}
                />
              )}
            />

            {/* 17. Application Date */}
            <div className="form-field-row">
              <label htmlFor="applicationDate" className="form-label">
                <span className="field-number">17.</span>
                <span className="label-hindi hindi" lang="hi">आवेदन की तारीख</span>
                <span className="label-separator">/</span>
                <span className="label-english">Date of Application</span>
                <span className="required-marker">*</span>
              </label>
              <input
                id="applicationDate"
                type="date"
                {...register('applicationDate')}
                className="form-input"
                required
              />
              {errors.applicationDate && (
                <p className="text-xs text-[#D32F2F] mt-1">{errors.applicationDate.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Signature & Submission */}
        <div className="form-section-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="form-section-title">Signature & Submission / हस्ताक्षर और प्रस्तुत करना</h3>
          <SignatureUpload
            value={signature}
            onChange={setSignature}
            required
            errorMessage={sigError ?? undefined}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8 pt-6">
          <button
            type="button"
            onClick={async () => {
              await save();
            }}
            className="btn btn-secondary"
            disabled={saveStatus === 'saving'}
            style={{ height: '42px', borderRadius: '10px' }}
          >
            Save Draft
          </button>
          <button
            type="submit"
            className="btn btn-primary animate-hover"
            style={{ height: '42px', borderRadius: '10px' }}
          >
            Preview & Submit
          </button>
        </div>
      </form>

      {/* Form Preview Modal */}
      <FormPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onSubmit={handleFinalSubmit}
        formType="earned_leave"
        formData={formValues}
        language={translitLang}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
