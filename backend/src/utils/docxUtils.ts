import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import os from 'os';

export const fillDocxAndConvertToPdf = async (
  templateName: string,
  data: Record<string, any>
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      // 1. Read the template
      const templatePath = path.join(__dirname, '..', 'docx_templates', `${templateName}.docx`);
      if (!fs.existsSync(templatePath)) {
        return reject(new Error(`DOCX Template not found for: ${templateName}`));
      }
      const content = fs.readFileSync(templatePath, 'binary');

      // 2. Unzip and run docxtemplater
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{~', end: '~}' }
      });

      // Provide data for templating
      doc.render(data);

      // 3. Generate the output document
      const buf = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
      });

      // 4. Save to temporary file
      const tempId = Math.random().toString(36).substring(7);
      const tempDocxPath = path.join(os.tmpdir(), `temp_${tempId}.docx`);
      const tempPdfPath = path.join(os.tmpdir(), `temp_${tempId}.pdf`);
      
      fs.writeFileSync(tempDocxPath, buf);

      // 5. Convert to PDF using docx2pdf (Requires MS Word on Windows)
      exec(`docx2pdf "${tempDocxPath}" "${tempPdfPath}"`, (error) => {
        if (error) {
          console.error("Error converting docx to pdf:", error);
          // Cleanup temp docx
          if (fs.existsSync(tempDocxPath)) fs.unlinkSync(tempDocxPath);
          return reject(new Error('PDF conversion failed via docx2pdf'));
        }

        // 6. Read the PDF and return buffer
        if (!fs.existsSync(tempPdfPath)) {
          if (fs.existsSync(tempDocxPath)) fs.unlinkSync(tempDocxPath);
          return reject(new Error('PDF file was not created'));
        }
        
        const pdfBuffer = fs.readFileSync(tempPdfPath);
        
        // Cleanup temp files
        fs.unlinkSync(tempDocxPath);
        fs.unlinkSync(tempPdfPath);

        resolve(pdfBuffer);
      });
    } catch (err) {
      reject(err);
    }
  });
};
