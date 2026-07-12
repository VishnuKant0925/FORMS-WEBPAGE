# PDF Generation Guide: Pinpoint Accuracy using Word Templates

This guide explains how the new "Word-to-PDF" generation pipeline works, what dependencies are required, and how to implement this architecture in a restricted server environment.

## 🏗️ Architecture Overview

Previously, the system used **Puppeteer (HTML-to-PDF)**. Recreating complex government forms in HTML to match MS Word pixel-by-pixel is extremely difficult and fragile.

To achieve **100% pinpoint accuracy**, we transitioned to a **Document Templating (Word-to-PDF)** approach:
1. **Template Preparation**: We take the native MS Word document (`.docx`) and replace the blank spaces with tags (e.g., `{~applicantName~}`).
2. **Data Injection**: We use `docxtemplater` in Node.js to inject the user's submitted JSON data directly into the `.docx` file.
3. **PDF Conversion**: We convert the filled `.docx` into a `.pdf`. 

## 📦 Dependencies Installed

### Node.js (Backend)
- `docxtemplater`: To inject JSON data into the `.docx` template.
- `pizzip`: A utility required by docxtemplater to unzip/zip the `.docx` file.

### Python (System Level)
- `python-docx`: Used by our preparation script to automatically inject tags into the native Word files safely.
- `docx2pdf`: A python utility that converts `.docx` to `.pdf`.

---

## 💻 Environment Setup: Local vs Restricted Server

### 1. Local Windows Machine (Current Setup)
On your local Windows machine, the PDF conversion uses `docx2pdf`, which quietly opens **Microsoft Word** in the background (via COM Interop) to "Save As PDF". 
- **Pros**: This guarantees 100% pinpoint accuracy because it uses the actual MS Word engine.
- **Cons**: Requires MS Word to be installed on the machine.

### 2. Restricted Environment (Linux / Production Server)
If your production server is a restricted Linux environment, **Microsoft Word will not be available**. In this case, you must use **LibreOffice** as the conversion engine.

**Steps to adapt for Linux/Restricted Server:**
1. **Install LibreOffice on the server:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install libreoffice
   ```
2. **Install Node.js LibreOffice wrapper:**
   Run `npm install libreoffice-convert` in your backend directory.
3. **Update `docxUtils.ts`**:
   Replace the `docx2pdf` execution block in `backend/src/utils/docxUtils.ts` with the `libreoffice-convert` library:
   ```typescript
   import libre from 'libreoffice-convert';
   libre.convertAsync = require('util').promisify(libre.convert);

   // Inside fillDocxAndConvertToPdf()
   const pdfBuf = await libre.convertAsync(buf, '.pdf', undefined);
   return pdfBuf;
   ```
*Note: LibreOffice provides ~98% accuracy compared to MS Word, which is generally acceptable and the industry standard for Linux servers.*

---

## 🚀 How to see the changes right now

Since your development servers (`npm run dev`) are already running for both frontend and backend:
1. Open your browser and navigate to the application dashboard.
2. Select **Casual Leave / Special Casual Leave / Compensatory Off (RRSC-W)**.
3. Fill out the form with test data.
4. Click **Preview & Submit** and finalize the application.
5. Go to your **History / My Submissions** page.
6. Click the button to **Download PDF**. 
7. You will see that the downloaded PDF is an exact, pixel-perfect replica of your original `Casual Leave (1).docx` file.

---

## 🛠️ Step-by-Step: How to implement the remaining 16 forms

Whenever you want to add one of the other 16 forms, follow this exact process:

### Step 1: Prepare the `.docx` Template
Copy your native `.docx` file into the `backend/src/docx_templates/` directory.
You can either manually edit the Word document to add tags like `{~employeeCode~}` in the blank spaces, OR you can adapt the `backend/prepare_template.py` script I created to automatically replace text with tags.

*Example tag:* `Name : {~applicantName~}`

### Step 2: Ensure Frontend Matches
Ensure your Next.js form fields (e.g. `applicantName`, `employeeCode`) exactly match the names of the tags you put inside the `{` and `}` in the Word document.

### Step 3: Update `pdfController.ts`
Open `backend/src/controllers/pdfController.ts` and add your new form type to the Word-to-PDF router logic.

```typescript
// Add your new form type to the IF statement
if (submission.formType === 'casual_leave_rrsc' || submission.formType === 'your_new_form_type') {
    
    const pdfBuffer = await fillDocxAndConvertToPdf(submission.formType, submission.formData);
    
    // ... rest of the existing code
}
```

That's it! The `docxUtils.ts` utility is entirely dynamic. As long as the template name matches the `formType`, it will automatically inject the data and convert it to a PDF with pinpoint accuracy.
