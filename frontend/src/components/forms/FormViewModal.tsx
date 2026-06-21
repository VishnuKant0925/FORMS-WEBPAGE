'use client';

import React from 'react';
import type { FormType, Submission, SubmissionStatus } from '@/types';
import FormHeader from './FormHeader';
import { X, Download, Loader2 } from 'lucide-react';

interface FormViewModalProps {
  submission: Submission;
  onClose: () => void;
  onDownloadPdf: (id: string, formType: FormType) => void;
  isDownloading?: boolean;
}

export default function FormViewModal({
  submission,
  onClose,
  onDownloadPdf,
  isDownloading = false,
}: FormViewModalProps) {
  const { formType, formData, status, hrComment, supervisorComment, language } = submission;

  const getHeaderProps = () => {
    switch (formType) {
      case 'casual_leave_nrsc':
        return {
          orgNameHindi: 'राष्ट्रीय सुदूर संवेदन केंद्र (एनआरएससी), हैदराबाद',
          orgNameEnglish: 'National Remote Sensing Centre (NRSC), Hyderabad',
          formTitleHindi: 'आकस्मिक छुट्टी के लिए आवेदन',
          formTitleEnglish: 'APPLICATION FOR CASUAL LEAVE',
        };
      case 'earned_leave':
        return {
          orgNameHindi: 'राष्ट्रीय सुदूर संवेदन केंद्र (एनआरएससी), हैदराबाद',
          orgNameEnglish: 'National Remote Sensing Centre (NRSC), Hyderabad',
          formTitleHindi: 'छुट्टी / छुट्टी के विस्तार के लिए आवेदन',
          formTitleEnglish: 'APPLICATION FOR LEAVE / EXTENSION OF LEAVE',
        };
      case 'casual_leave_rrsc':
        return {
          orgNameHindi: 'क्षेत्रीय सुदूर संवेदन केंद्र - पश्चिम (आरआरएससी-डब्लू), जोधपुर',
          orgNameEnglish: 'Regional Remote Sensing Centre - West (RRSC-W), Jodhpur',
          formTitleHindi: 'आकस्मिक छुट्टी / विशेष आकस्मिक छुट्टी / प्रतिपूरक अवकाश के लिए आवेदन',
          formTitleEnglish: 'APPLICATION FOR CASUAL LEAVE / SPECIAL CASUAL LEAVE / COMPENSATORY OFF',
        };
      case 'trainee_biodata':
        return {
          orgNameHindi: 'क्षेत्रीय सुदूर संवेदन केंद्र - पश्चिम (आरआरएससी-डब्लू), जोधपुर',
          orgNameEnglish: 'Regional Remote Sensing Centre - West (RRSC-W), Jodhpur',
          formTitleHindi: 'प्रशिक्षु व्यक्तिगत जानकारी / बायो-डेटा फॉर्म',
          formTitleEnglish: 'TRAINEE PERSONAL INFORMATION / BIO-DATA FORM',
        };
    }
  };

  const getFormFields = (): { labelHi: string; labelEn: string; value: string }[] => {
    const data: Record<string, any> = formData || {};
    switch (formType) {
      case 'casual_leave_nrsc':
        return [
          { labelHi: '1. आवेदक का नाम', labelEn: '1. Name of Applicant', value: data.applicantName },
          { labelHi: '2. पदनाम / ग्रेड', labelEn: '2. Designation / Grade', value: data.designationGrade },
          { labelHi: '3. कर्मचारी कोड संख्या', labelEn: '3. Employee Code No.', value: data.employeeCode },
          { labelHi: '4. छुट्टी का आधार', labelEn: '4. Ground for Leave', value: data.groundForLeave },
          { labelHi: '5. दिनों की संख्या', labelEn: '5. Number of Days', value: data.numberOfDays },
          { labelHi: '6. कब से (तारीख)', labelEn: '6. From Date', value: data.fromDate },
          { labelHi: '7. कब तक (तारीख)', labelEn: '7. To Date', value: data.toDate },
          { labelHi: '8. आधा दिन विकल्प', labelEn: '8. Half Day Option', value: data.halfDay || 'None' },
          { labelHi: '9. क्या मुख्यालय छोड़ रहे हैं?', labelEn: '9. Leaving Station?', value: data.leaveStation === 'yes' ? 'हाँ / Yes' : 'नहीं / No' },
          { labelHi: '10. इस वर्ष अब तक ली गई सीएल', labelEn: '10. CL Availed so far this year', value: data.clAvailedCurrentYear },
          { labelHi: '11. आवेदन की तारीख', labelEn: '11. Date of Application', value: data.applicationDate },
        ];
      case 'earned_leave':
        return [
          { labelHi: '1. आवेदक का नाम', labelEn: '1. Name of Applicant', value: data.applicantName },
          { labelHi: '2. पदनाम और ग्रेड', labelEn: '2. Designation and Grade', value: data.designationGrade },
          { labelHi: '3. विभाग / अनुभाग', labelEn: '3. Division / Section', value: data.divisionSection },
          { labelHi: '4. कर्मचारी कोड संख्या', labelEn: '4. Employee Code No.', value: data.employeeCode },
          { labelHi: '5. मूल वेतन', labelEn: '5. Basic Pay', value: data.basicPay },
          { labelHi: '6. मकान किराया / वाहन भत्ता', labelEn: '6. HRA / Conveyance Allowance', value: data.hraConveyanceAllowance },
          { labelHi: '7. लागू छुट्टी नियम', labelEn: '7. Leave Rules Applicable', value: data.leaveRulesApplicable },
          { labelHi: '8. छुट्टी का प्रकार', labelEn: '8. Type of Leave', value: data.leaveType },
          { labelHi: '9. दिनों की संख्या', labelEn: '9. Number of Days', value: data.numberOfDays },
          { labelHi: '10. कब से (तारीख)', labelEn: '10. From Date', value: data.fromDate },
          { labelHi: '11. कब तक (तारीख)', labelEn: '11. To Date', value: data.toDate },
          { labelHi: '12. रविवार/छुट्टियां (पूर्वसर्ग/अनुलग्नक)', labelEn: '12. Prefix/Suffix Sundays & Holidays', value: data.sundaysHolidaysPrefixSuffix },
          { labelHi: '13. छुट्टी का आधार', labelEn: '13. Ground for Leave', value: data.groundForLeave },
          { labelHi: '14. पिछली छुट्टी से लौटने की तारीख', labelEn: '14. Date of Return from Last Leave', value: data.dateOfReturnFromLastLeave },
          { labelHi: '15. एलटीसी प्रस्ताव?', labelEn: '15. LTC Proposed?', value: data.ltcProposal === 'yes' ? 'हाँ / Yes' : 'नहीं / No' },
          { labelHi: '16. एलटीसी ब्लॉक वर्ष', labelEn: '16. LTC Block Year', value: data.ltcBlockYear },
          { labelHi: '17. छुट्टी के दौरान पता', labelEn: '17. Address during Leave', value: data.leaveAddress },
          { labelHi: '18. आवेदन की तारीख', labelEn: '18. Date of Application', value: data.applicationDate },
        ];
      case 'casual_leave_rrsc':
        return [
          { labelHi: '1. आवेदक का नाम', labelEn: '1. Name of Applicant', value: data.applicantName },
          { labelHi: '2. पदनाम / ग्रेड', labelEn: '2. Designation / Grade', value: data.designationGrade },
          { labelHi: '3. विभाग / अनुभाग', labelEn: '3. Division / Section', value: data.divisionSection },
          { labelHi: '4. कर्मचारी कोड संख्या', labelEn: '4. Employee Code No.', value: data.employeeCode },
          { labelHi: '5. छुट्टी की प्रकृति', labelEn: '5. Nature of Leave', value: data.natureOfLeave },
          { labelHi: '6. दिनों की संख्या', labelEn: '6. Number of Days', value: data.numberOfDays },
          { labelHi: '7. कब से (तारीख)', labelEn: '7. From Date', value: data.fromDate },
          { labelHi: '8. कब तक (तारीख)', labelEn: '8. To Date', value: data.toDate },
          { labelHi: '9. पूर्वसर्ग (तारीखें)', labelEn: '9. Prefixing (Dates)', value: data.prefixing },
          { labelHi: '10. अनुलग्नक (तारीखें)', labelEn: '10. Suffixing (Dates)', value: data.suffixing },
          { labelHi: '11. छुट्टी का उद्देश्य', labelEn: '11. Purpose of Leave', value: data.purpose },
          { labelHi: '12. छुट्टी के दौरान पता', labelEn: '12. Address During Leave', value: data.addressDuringLeave },
          { labelHi: '13. बीच की बंद छुट्टियां', labelEn: '13. Intervening Closed Holidays', value: data.interveningClosedHolidays },
          { labelHi: '14. इस वर्ष ली गई सीएल', labelEn: '14. CL Availed So Far', value: data.clTakenSoFar },
          { labelHi: '15. आवेदन की तारीख', labelEn: '15. Date of Application', value: data.applicationDate },
        ];
      case 'trainee_biodata':
        return [
          { labelHi: '1. छात्र का नाम', labelEn: '1. Name of Student', value: data.studentName },
          { labelHi: '2. पिता / पति का नाम', labelEn: "2. Father's / Husband's Name", value: data.fatherHusbandName },
          { labelHi: '3. राष्ट्रीयता', labelEn: '3. Nationality', value: data.nationality },
          { labelHi: '4. जन्म तिथि', labelEn: '4. Date of Birth', value: data.dateOfBirth },
          { labelHi: '5. वर्तमान पता', labelEn: '5. Present Address', value: data.presentAddress },
          { labelHi: '6. वर्तमान संपर्क नंबर', labelEn: '6. Present Contact No.', value: data.presentContactNumber },
          { labelHi: '7. वर्तमान ईमेल आईडी', labelEn: '7. Present Email ID', value: data.presentEmail },
          { labelHi: '8. स्थायी पता', labelEn: '8. Permanent Address', value: data.permanentAddress },
          { labelHi: '9. स्थायी संपर्क नंबर', labelEn: '9. Permanent Contact No.', value: data.permanentContactNumber },
          { labelHi: '10. स्थायी ईमेल आईडी', labelEn: '10. Permanent Email ID', value: data.permanentEmail },
          { labelHi: '11. संस्थान / कॉलेज का नाम', labelEn: '11. Institution / College Name', value: data.institutionCollegeName },
          { labelHi: '12. संबद्ध विश्वविद्यालय', labelEn: '12. Affiliated University', value: data.affiliatedUniversity },
          { labelHi: '13. अनुशासन / सेमेस्टर / वर्ष', labelEn: '13. Discipline / Semester / Year', value: data.disciplineSemesterYear },
          { labelHi: '14. विभागाध्यक्ष / गाइड का नाम', labelEn: '14. Name of HOD / Guide', value: data.hodGuideName },
          { labelHi: '15. विभागाध्यक्ष / गाइड का पता', labelEn: '15. Address of HOD / Guide', value: data.hodGuideAddress },
          { labelHi: '16. विभागाध्यक्ष / गाइड ईमेल', labelEn: '16. HOD / Guide Email ID', value: data.hodGuideContactEmail },
          { labelHi: '17. परियोजना शीर्षक', labelEn: '17. Project Title', value: data.projectTitle },
          { labelHi: '18. परियोजना आंतरिक गाइड', labelEn: '18. Project Guide (Internal)', value: data.projectGuide },
          { labelHi: '19. परियोजना अवधि', labelEn: '19. Project Period', value: data.projectPeriod },
          { labelHi: '20. प्रवेश पास तारीख', labelEn: '20. Entry Pass Issue Date', value: data.entryPassDate },
          { labelHi: '21. क्या लॉकर जारी किया गया?', labelEn: '21. Locker Issued?', value: data.lockerIssued === 'yes' ? 'हाँ / Yes' : 'नहीं / No' },
          { labelHi: '22. लॉकर कुंजी नंबर', labelEn: '22. Locker Key Number', value: data.lockerKeyNumber },
          { labelHi: '23. लॉकर जमा करने की तारीख', labelEn: '23. Locker Key Deposit Date', value: data.lockerKeyDepositDate },
          {
            labelHi: '24. संलग्न दस्तावेज़',
            labelEn: '24. Enclosed Documents',
            value: Object.entries(data.enclosedDocuments || {})
              .filter(([_, checked]) => checked)
              .map(([key]) => key)
              .join(', ') || 'None',
          },
        ];
    }
  };

  const getStatusBadge = (s: SubmissionStatus) => {
    const styles: Record<SubmissionStatus, string> = {
      draft: 'bg-gray-100 text-gray-800 border-gray-300',
      submitted: 'bg-blue-50 text-blue-700 border-blue-200',
      recommended: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      approved: 'bg-green-50 text-green-700 border-green-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
      returned: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return (
      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${styles[s] || styles.draft}`}>
        {s.toUpperCase()}
      </span>
    );
  };

  const getFormName = (type: FormType) => {
    switch (type) {
      case 'casual_leave_nrsc': return 'Casual Leave — NRSC';
      case 'earned_leave': return 'Earned / Medical Leave — NRSC';
      case 'casual_leave_rrsc': return 'CL / Spl CL / Comp Off — RRSC-W';
      case 'trainee_biodata': return 'Trainee Bio-Data — RRSC-W';
      default: return type;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col my-4">
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D9E2EC] bg-gradient-to-r from-[#F0F4F8] to-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#0B3C6D]">
                <span className="hindi mr-2">प्रस्तुत आवेदन</span> / Submitted Form
              </h2>
              <p className="text-xs text-[#486581] mt-0.5">{getFormName(formType)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(status)}
            <button
              onClick={onClose}
              className="p-1.5 text-[#6B7280] hover:text-[#1F2937] hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Review Comments (if any) ── */}
        {(hrComment || supervisorComment) && (
          <div className="px-6 py-3 border-b border-[#D9E2EC] bg-[#FEFCE8] space-y-2">
            {supervisorComment && (
              <div className="flex items-start gap-2 text-sm">
                <span className="font-semibold text-indigo-700 shrink-0">Supervisor:</span>
                <span className="text-indigo-900">{supervisorComment}</span>
              </div>
            )}
            {hrComment && (
              <div className="flex items-start gap-2 text-sm">
                <span className="font-semibold text-amber-700 shrink-0">HR Remark:</span>
                <span className="text-amber-900">{hrComment}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Modal Body ── */}
        <div className="p-6 overflow-y-auto flex-grow bg-[#F8FAFC]">
          <div className="bg-white border border-[#D9E2EC] rounded shadow-sm p-8 max-w-[21cm] mx-auto">
            <FormHeader {...getHeaderProps()} />

            <div className="mt-6 border border-[#B0C4DE] rounded">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {getFormFields().map((field, idx) => (
                    <tr key={idx} className="border-b border-[#B0C4DE] last:border-b-0">
                      <td className="w-1/2 p-3 bg-[#F0F4F8] border-r border-[#B0C4DE] align-top">
                        <div className="font-semibold text-[#1F2937] hindi mb-0.5" lang="hi">
                          {field.labelHi}
                        </div>
                        <div className="text-xs text-[#486581] italic">
                          {field.labelEn}
                        </div>
                      </td>
                      <td className="w-1/2 p-3 text-[#1F2937] align-top font-medium whitespace-pre-wrap">
                        {String(field.value || '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Declaration */}
            <div className="mt-8 text-xs text-[#6B7280] leading-relaxed border-t border-dashed border-[#D9E2EC] pt-4">
              <p className="hindi mb-1" lang="hi">
                मैं एतद्द्वारा घोषित करता हूँ कि दी गई जानकारी सत्य और सही है।
              </p>
              <p className="italic">
                I hereby declare that the information provided above is true and correct to the best of my knowledge.
              </p>
            </div>
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#D9E2EC] bg-[#F8FAFC] rounded-b-xl">
          <span className="text-xs text-[#6B7280] italic">
            Read-only view — this form has been submitted.
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn btn-outline"
            >
              Close
            </button>
            <button
              onClick={() => onDownloadPdf(submission._id, formType)}
              className="btn btn-primary flex items-center gap-2"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
