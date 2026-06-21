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
import SignatureUpload from './SignatureUpload';
import TransliterateField from './TransliterateField';
import FormPreview from './FormPreview';
import { useRouter } from 'next/navigation';

const RrscCasualLeaveSchema = z.object({
  employeeCode: z.string().min(3, 'Employee code is required'),
  applicantName: z.string().min(2, 'Name must be at least 2 characters'),
  designationGrade: z.string().min(2, 'Designation / Grade is required'),
  divisionSection: z.string().min(2, 'Division / Section is required'),
  natureOfLeave: z.enum(['CL', 'Spl CL', 'Compensatory Off']).default('CL'),
  numberOfDays: z.string().min(1, 'Number of days is required'),
  fromDate: z.string().min(1, 'From date is required'),
  toDate: z.string().min(1, 'To date is required'),
  prefixing: z.string().default(''),
  suffixing: z.string().default(''),
  purpose: z.string().min(5, 'Purpose of leave is required'),
  addressDuringLeave: z.string().min(5, 'Address during leave is required'),
  interveningClosedHolidays: z.string().default(''),
  clTakenSoFar: z.string().default('0'),
  applicationDate: z.string().min(1, 'Application date is required'),
});

type RrscCasualLeaveInputs = z.infer<typeof RrscCasualLeaveSchema>;

interface RrscCasualLeaveFormProps {
  initialData?: Record<string, any>;
  draftId?: string;
}

export default function RrscCasualLeaveForm({ initialData, draftId: incomingDraftId }: RrscCasualLeaveFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { lang: translitLang } = useTranslitStore();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [errorMsg, setErrorMsg]           = useState<string | null>(null);
  const [signature, setSignature]         = useState<string>('');
  const [sigError, setSigError]           = useState<string | null>(null);

  const defaultValues: RrscCasualLeaveInputs = {
    employeeCode: initialData?.employeeCode || user?.employeeCode || '',
    applicantName: initialData?.applicantName || user?.name || '',
    designationGrade: initialData?.designationGrade || user?.designation || '',
    divisionSection: initialData?.divisionSection || user?.department || '',
    natureOfLeave: (initialData?.natureOfLeave as 'CL' | 'Spl CL' | 'Compensatory Off') || 'CL',
    numberOfDays: initialData?.numberOfDays || '1',
    fromDate: initialData?.fromDate || '',
    toDate: initialData?.toDate || '',
    prefixing: initialData?.prefixing || '',
    suffixing: initialData?.suffixing || '',
    purpose: initialData?.purpose || '',
    addressDuringLeave: initialData?.addressDuringLeave || '',
    interveningClosedHolidays: initialData?.interveningClosedHolidays || '',
    clTakenSoFar: initialData?.clTakenSoFar || '0',
    applicationDate: initialData?.applicationDate || new Date().toISOString().split('T')[0],
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<RrscCasualLeaveInputs>({
    resolver: zodResolver(RrscCasualLeaveSchema),
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

  // Helper to compute checkbox marks for natureOfLeave
  const getPayload = (data: RrscCasualLeaveInputs) => {
    return {
      ...data,
      clCheck: data.natureOfLeave === 'CL' ? '✓' : '',
      splClCheck: data.natureOfLeave === 'Spl CL' ? '✓' : '',
      compOffCheck: data.natureOfLeave === 'Compensatory Off' ? '✓' : '',
    };
  };

  const computedValues = getPayload(formValues);

  // Setup Auto-Save
  const { draftId, saveStatus, lastSaved, save } = useAutoSave(
    'casual_leave_rrsc',
    isDirty ? computedValues : undefined,
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
        ...computedValues,
        employeeSignature: signature,
        submittedAt:       now.toISOString(),
        submittedDate:     now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }),
        submittedTime:     now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }) + ' IST',
      };
      await formService.submit('casual_leave_rrsc', translitLang, submissionPayload);
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
          orgNameHindi="क्षेत्रीय सुदूर संवेदन केंद्र - पश्चिम (आरआरएससी-डब्लू), जोधपुर"
          orgNameEnglish="Regional Remote Sensing Centre - West (RRSC-W), Jodhpur"
          formTitleHindi="आकस्मिक छुट्टी / विशेष आकस्मिक छुट्टी / प्रतिपूरक अवकाश के लिए आवेदन"
          formTitleEnglish="Application for Casual Leave / Special Casual Leave / Compensatory Off"
        />

        {/* Section 1: Employee Information */}
        <div className="form-section-card animate-fade-in">
          <h3 className="form-section-title">Employee Information / कर्मचारी की जानकारी</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Employee Code */}
              <div className="form-field-row">
                <label htmlFor="employeeCode" className="form-label">
                  <span className="field-number">1.</span>
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

              {/* 2. Applicant Name */}
              <Controller
                name="applicantName"
                control={control}
                render={({ field }) => (
                  <TransliterateField
                    fieldNumber="2."
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 3. Designation / Grade */}
              <Controller
                name="designationGrade"
                control={control}
                render={({ field }) => (
                  <TransliterateField
                    fieldNumber="3."
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

              {/* 4. Division / Section */}
              <Controller
                name="divisionSection"
                control={control}
                render={({ field }) => (
                  <TransliterateField
                    fieldNumber="4."
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
            </div>
          </div>
        </div>

        {/* Section 2: Leave Details */}
        <div className="form-section-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="form-section-title">Leave Details / अवकाश का विवरण</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 5. Nature of Leave */}
            <div className="form-field-row">
              <span className="form-label">
                <span className="field-number">5.</span>
                <span className="label-hindi hindi" lang="hi">छुट्टी की प्रकृति</span>
                <span className="label-separator">/</span>
                <span className="label-english">Nature of Leave</span>
                <span className="required-marker">*</span>
              </span>
              <div className="flex flex-wrap gap-6 mt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                  <input
                    type="radio"
                    value="CL"
                    {...register('natureOfLeave')}
                    className="w-4 h-4 text-[#0B3C6D] focus:ring-[#0B3C6D]"
                  />
                  <span>Casual Leave (CL)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                  <input
                    type="radio"
                    value="Spl CL"
                    {...register('natureOfLeave')}
                    className="w-4 h-4 text-[#0B3C6D] focus:ring-[#0B3C6D]"
                  />
                  <span>Special Casual Leave (Spl CL)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                  <input
                    type="radio"
                    value="Compensatory Off"
                    {...register('natureOfLeave')}
                    className="w-4 h-4 text-[#0B3C6D] focus:ring-[#0B3C6D]"
                  />
                  <span>Compensatory Off</span>
                </label>
              </div>
            </div>

            {/* Date range grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* From Date */}
              <div className="form-field-row">
                <label htmlFor="fromDate" className="form-label">
                  <span className="field-number">7a.</span>
                  <span className="label-hindi hindi" lang="hi">छुट्टी की तारीख (से)</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">From Date</span>
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
                  <span className="field-number">7b.</span>
                  <span className="label-hindi hindi" lang="hi">छुट्टी की तारीख (तक)</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">To Date</span>
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
                  <span className="field-number">6.</span>
                  <span className="label-hindi hindi" lang="hi">दिनों की संख्या</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">No. of Days</span>
                  <span className="required-marker">*</span>
                </label>
                <input
                  id="numberOfDays"
                  type="number"
                  step="0.5"
                  min="0.5"
                  {...register('numberOfDays')}
                  className="form-input"
                  required
                />
                {errors.numberOfDays && (
                  <p className="text-xs text-[#D32F2F] mt-1">{errors.numberOfDays.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 8. Prefixing */}
              <Controller
                name="prefixing"
                control={control}
                render={({ field }) => (
                  <TransliterateField
                    fieldNumber="8."
                    labelHindi="पूर्वसर्ग (Prefixing)"
                    labelEnglish="Prefix Holiday / Sunday"
                    name="prefixing"
                    value={field.value}
                    onChange={(_, val) => field.onChange(val)}
                    errorMessage={errors.prefixing?.message}
                  />
                )}
              />

              {/* 9. Suffixing */}
              <Controller
                name="suffixing"
                control={control}
                render={({ field }) => (
                  <TransliterateField
                    fieldNumber="9."
                    labelHindi="प्रत्यय (Suffixing)"
                    labelEnglish="Suffix Holiday / Sunday"
                    name="suffixing"
                    value={field.value}
                    onChange={(_, val) => field.onChange(val)}
                    errorMessage={errors.suffixing?.message}
                  />
                )}
              />
            </div>

            {/* 10. Purpose / Reason */}
            <Controller
              name="purpose"
              control={control}
              render={({ field }) => (
                <TransliterateField
                  fieldNumber="10."
                  labelHindi="उद्देश्य / कारण"
                  labelEnglish="Purpose / Reason"
                  name="purpose"
                  value={field.value}
                  onChange={(_, val) => field.onChange(val)}
                  multiline
                  rows={2}
                  required
                  errorMessage={errors.purpose?.message}
                />
              )}
            />

            {/* 11. Address During Leave */}
            <Controller
              name="addressDuringLeave"
              control={control}
              render={({ field }) => (
                <TransliterateField
                  fieldNumber="11."
                  labelHindi="छुट्टी के दौरान का पता"
                  labelEnglish="Address During Leave"
                  name="addressDuringLeave"
                  value={field.value}
                  onChange={(_, val) => field.onChange(val)}
                  multiline
                  rows={2}
                  required
                  errorMessage={errors.addressDuringLeave?.message}
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 12. Intervening Closed Holidays */}
              <div className="form-field-row">
                <label htmlFor="interveningClosedHolidays" className="form-label">
                  <span className="field-number">12.</span>
                  <span className="label-hindi hindi" lang="hi">बीच की बंद छुट्टियाँ</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">Intervening Closed Holidays</span>
                </label>
                <input
                  id="interveningClosedHolidays"
                  type="text"
                  {...register('interveningClosedHolidays')}
                  className="form-input"
                  placeholder="e.g. 2 Saturdays"
                />
              </div>

              {/* 13. CL Taken So Far */}
              <div className="form-field-row">
                <label htmlFor="clTakenSoFar" className="form-label">
                  <span className="field-number">13.</span>
                  <span className="label-hindi hindi" lang="hi">इस वर्ष अब तक CL</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">CL Taken So Far This Year</span>
                </label>
                <input
                  id="clTakenSoFar"
                  type="number"
                  min="0"
                  {...register('clTakenSoFar')}
                  className="form-input"
                />
              </div>
            </div>

            {/* 14. Application Date */}
            <div className="form-field-row">
              <label htmlFor="applicationDate" className="form-label">
                <span className="field-number">14.</span>
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
        formType="casual_leave_rrsc"
        formData={computedValues}
        language={translitLang}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
