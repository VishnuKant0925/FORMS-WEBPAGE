import React from 'react';
import type { FormType } from '@/types';
import FormHeader from './FormHeader';

interface FormPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formType: FormType;
  formData: Record<string, any>;
  language: string;
  isSubmitting?: boolean;
}

export default function FormPreview({
  isOpen,
  onClose,
  onSubmit,
  formType,
  formData,
  language,
  isSubmitting = false,
}: FormPreviewProps) {
  if (!isOpen) return null;

  // Bilingual mapping
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

  const getFormFields = () => {
    switch (formType) {
      case 'casual_leave_nrsc':
        return [
          { labelHi: '1. आवेदक का नाम', labelEn: '1. Name of Applicant', value: formData.applicantName },
          { labelHi: '2. पदनाम / ग्रेड', labelEn: '2. Designation / Grade', value: formData.designationGrade },
          { labelHi: '3. कर्मचारी कोड संख्या', labelEn: '3. Employee Code No.', value: formData.employeeCode },
          { labelHi: '4. छुट्टी का आधार', labelEn: '4. Ground for Leave', value: formData.groundForLeave },
          { labelHi: '5. दिनों की संख्या', labelEn: '5. Number of Days', value: formData.numberOfDays },
          { labelHi: '6. कब से (तारीख)', labelEn: '6. From Date', value: formData.fromDate },
          { labelHi: '7. कब तक (तारीख)', labelEn: '7. To Date', value: formData.toDate },
          { labelHi: '8. आधा दिन विकल्प', labelEn: '8. Half Day Option', value: formData.halfDay || 'None' },
          { labelHi: '9. क्या मुख्यालय छोड़ रहे हैं?', labelEn: '9. Leaving Station?', value: formData.leaveStation === 'yes' ? 'हाँ / Yes' : 'नहीं / No' },
          { labelHi: '10. इस वर्ष अब तक ली गई सीएल', labelEn: '10. CL Availed so far this year', value: formData.clAvailedCurrentYear },
          { labelHi: '11. आवेदन की तारीख', labelEn: '11. Date of Application', value: formData.applicationDate },
        ];
      case 'earned_leave':
        return [
          { labelHi: '1. आवेदक का नाम', labelEn: '1. Name of Applicant', value: formData.applicantName },
          { labelHi: '2. पदनाम और ग्रेड', labelEn: '2. Designation and Grade', value: formData.designationGrade },
          { labelHi: '3. विभाग / अनुभाग', labelEn: '3. Division / Section', value: formData.divisionSection },
          { labelHi: '4. कर्मचारी कोड संख्या', labelEn: '4. Employee Code No.', value: formData.employeeCode },
          { labelHi: '5. मूल वेतन', labelEn: '5. Basic Pay', value: formData.basicPay },
          { labelHi: '6. मकान किराया / वाहन भत्ता', labelEn: '6. HRA / Conveyance Allowance', value: formData.hraConveyanceAllowance },
          { labelHi: '7. लागू छुट्टी नियम', labelEn: '7. Leave Rules Applicable', value: formData.leaveRulesApplicable },
          { labelHi: '8. छुट्टी का प्रकार', labelEn: '8. Type of Leave', value: formData.leaveType },
          { labelHi: '9. दिनों की संख्या', labelEn: '9. Number of Days', value: formData.numberOfDays },
          { labelHi: '10. कब से (तारीख)', labelEn: '10. From Date', value: formData.fromDate },
          { labelHi: '11. कब तक (तारीख)', labelEn: '11. To Date', value: formData.toDate },
          { labelHi: '12. रविवार/छुट्टियां (पूर्वसर्ग/अनुलग्नक)', labelEn: '12. Prefix/Suffix Sundays & Holidays', value: formData.sundaysHolidaysPrefixSuffix },
          { labelHi: '13. छुट्टी का आधार', labelEn: '13. Ground for Leave', value: formData.groundForLeave },
          { labelHi: '14. पिछली छुट्टी से लौटने की तारीख', labelEn: '14. Date of Return from Last Leave', value: formData.dateOfReturnFromLastLeave },
          { labelHi: '15. एलटीसी प्रस्ताव?', labelEn: '15. LTC Proposed?', value: formData.ltcProposal === 'yes' ? 'हाँ / Yes' : 'नहीं / No' },
          { labelHi: '16. एलटीसी ब्लॉक वर्ष', labelEn: '16. LTC Block Year', value: formData.ltcBlockYear },
          { labelHi: '17. छुट्टी के दौरान पता', labelEn: '17. Address during Leave', value: formData.leaveAddress },
          { labelHi: '18. आवेदन की तारीख', labelEn: '18. Date of Application', value: formData.applicationDate },
        ];
      case 'casual_leave_rrsc':
        return [
          { labelHi: '1. आवेदक का नाम', labelEn: '1. Name of Applicant', value: formData.applicantName },
          { labelHi: '2. पदनाम / ग्रेड', labelEn: '2. Designation / Grade', value: formData.designationGrade },
          { labelHi: '3. विभाग / अनुभाग', labelEn: '3. Division / Section', value: formData.divisionSection },
          { labelHi: '4. कर्मचारी कोड संख्या', labelEn: '4. Employee Code No.', value: formData.employeeCode },
          { labelHi: '5. छुट्टी की प्रकृति', labelEn: '5. Nature of Leave', value: formData.natureOfLeave },
          { labelHi: '6. दिनों की संख्या', labelEn: '6. Number of Days', value: formData.numberOfDays },
          { labelHi: '7. कब से (तारीख)', labelEn: '7. From Date', value: formData.fromDate },
          { labelHi: '8. कब तक (तारीख)', labelEn: '8. To Date', value: formData.toDate },
          { labelHi: '9. पूर्वसर्ग (तारीखें)', labelEn: '9. Prefixing (Dates)', value: formData.prefixing },
          { labelHi: '10. अनुलग्नक (तारीखें)', labelEn: '10. Suffixing (Dates)', value: formData.suffixing },
          { labelHi: '11. छुट्टी का उद्देश्य', labelEn: '11. Purpose of Leave', value: formData.purpose },
          { labelHi: '12. छुट्टी के दौरान पता', labelEn: '12. Address During Leave', value: formData.addressDuringLeave },
          { labelHi: '13. बीच की बंद छुट्टियां', labelEn: '13. Intervening Closed Holidays', value: formData.interveningClosedHolidays },
          { labelHi: '14. इस वर्ष ली गई सीएल', labelEn: '14. CL Availed So Far', value: formData.clTakenSoFar },
          { labelHi: '15. आवेदन की तारीख', labelEn: '15. Date of Application', value: formData.applicationDate },
        ];
      case 'trainee_biodata':
        return [
          { labelHi: '1. छात्र का नाम', labelEn: '1. Name of Student', value: formData.studentName },
          { labelHi: '2. पिता / पति का नाम', labelEn: '2. Father\'s / Husband\'s Name', value: formData.fatherHusbandName },
          { labelHi: '3. राष्ट्रीयता', labelEn: '3. Nationality', value: formData.nationality },
          { labelHi: '4. जन्म तिथि', labelEn: '4. Date of Birth', value: formData.dateOfBirth },
          { labelHi: '5. वर्तमान पता', labelEn: '5. Present Address', value: formData.presentAddress },
          { labelHi: '6. वर्तमान संपर्क नंबर', labelEn: '6. Present Contact No.', value: formData.presentContactNumber },
          { labelHi: '7. वर्तमान ईमेल आईडी', labelEn: '7. Present Email ID', value: formData.presentEmail },
          { labelHi: '8. स्थायी पता', labelEn: '8. Permanent Address', value: formData.permanentAddress },
          { labelHi: '9. स्थायी संपर्क नंबर', labelEn: '9. Permanent Contact No.', value: formData.permanentContactNumber },
          { labelHi: '10. स्थायी ईमेल आईडी', labelEn: '10. Permanent Email ID', value: formData.permanentEmail },
          { labelHi: '11. संस्थान / कॉलेज का नाम', labelEn: '11. Institution / College Name', value: formData.institutionCollegeName },
          { labelHi: '12. संबद्ध विश्वविद्यालय', labelEn: '12. Affiliated University', value: formData.affiliatedUniversity },
          { labelHi: '13. अनुशासन / सेमेस्टर / वर्ष', labelEn: '13. Discipline / Semester / Year', value: formData.disciplineSemesterYear },
          { labelHi: '14. विभागाध्यक्ष / गाइड का नाम', labelEn: '14. Name of HOD / Guide', value: formData.hodGuideName },
          { labelHi: '15. विभागाध्यक्ष / गाइड का पता', labelEn: '15. Address of HOD / Guide', value: formData.hodGuideAddress },
          { labelHi: '16. विभागाध्यक्ष / गाइड ईमेल', labelEn: '16. HOD / Guide Email ID', value: formData.hodGuideContactEmail },
          { labelHi: '17. परियोजना शीर्षक', labelEn: '17. Project Title', value: formData.projectTitle },
          { labelHi: '18. परियोजना आंतरिक गाइड', labelEn: '18. Project Guide (Internal)', value: formData.projectGuide },
          { labelHi: '19. परियोजना अवधि', labelEn: '19. Project Period', value: formData.projectPeriod },
          { labelHi: '20. प्रवेश पास तारीख', labelEn: '20. Entry Pass Issue Date', value: formData.entryPassDate },
          { labelHi: '21. क्या लॉकर जारी किया गया?', labelEn: '21. Locker Issued?', value: formData.lockerIssued === 'yes' ? 'हाँ / Yes' : 'नहीं / No' },
          { labelHi: '22. लॉकर कुंजी नंबर', labelEn: '22. Locker Key Number', value: formData.lockerKeyNumber },
          { labelHi: '23. लॉकर जमा करने की तारीख', labelEn: '23. Locker Key Deposit Date', value: formData.lockerKeyDepositDate },
          {
            labelHi: '24. संलग्न दस्तावेज़',
            labelEn: '24. Enclosed Documents',
            value: Object.entries(formData.enclosedDocuments || {})
              .filter(([_, checked]) => checked)
              .map(([key]) => key)
              .join(', ') || 'None',
          },
        ];
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#D9E2EC]">
          <h2 className="text-lg font-bold text-[#0B3C6D]">
            <span className="hindi mr-2">आवेदन का पूर्वावलोकन</span> / Form Preview
          </h2>
          <button
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#1F2937] text-2xl font-bold leading-none p-1"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-grow bg-[#F8FAFC]">
          <div className="bg-white border border-[#D9E2EC] rounded shadow-sm p-8 max-w-[21cm] mx-auto min-h-[29.7cm]">
            <FormHeader {...getHeaderProps()} />

            <div className="mt-6 border border-[#B0C4DE]">
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
                      <td className="w-1/2 p-3 text-[#1F2937] align-top font-medium">
                        {String(field.value || '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Instruction Warning / Sign Off */}
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

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#D9E2EC]">
          <span className="text-xs text-[#6B7280] italic">
            Review your inputs carefully before clicking Submit.
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              Edit Form
            </button>
            <button
              onClick={onSubmit}
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Official Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
