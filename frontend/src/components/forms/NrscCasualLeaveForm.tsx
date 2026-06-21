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

const NrscCasualLeaveSchema = z.object({
  applicantName: z.string().min(2, 'Name must be at least 2 characters'),
  designationGrade: z.string().min(2, 'Designation/Grade is required'),
  employeeCode: z.string().min(3, 'Employee code is required'),
  groundForLeave: z.string().min(5, 'Ground/reason for leave is required'),
  numberOfDays: z.string().min(1, 'Number of days is required'),
  fromDate: z.string().min(1, 'From date is required'),
  toDate: z.string().min(1, 'To date is required'),
  halfDay: z.string().optional().default(''),
  leaveStation: z.enum(['yes', 'no']).default('no'),
  clAvailedCurrentYear: z.string().default('0'),
  applicationDate: z.string().min(1, 'Application date is required'),
});

type NrscCasualLeaveInputs = z.infer<typeof NrscCasualLeaveSchema>;

interface NrscCasualLeaveFormProps {
  initialData?: Record<string, any>;
  draftId?: string;
}

export default function NrscCasualLeaveForm({ initialData, draftId: incomingDraftId }: NrscCasualLeaveFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { lang: translitLang } = useTranslitStore();
  const [isPreviewOpen, setIsPreviewOpen]   = useState(false);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [errorMsg, setErrorMsg]             = useState<string | null>(null);
  const [signature, setSignature]           = useState<string>('');
  const [sigError, setSigError]             = useState<string | null>(null);

  const defaultValues: NrscCasualLeaveInputs = {
    applicantName: initialData?.applicantName || user?.name || '',
    designationGrade: initialData?.designationGrade || user?.designation || '',
    employeeCode: initialData?.employeeCode || user?.employeeCode || '',
    groundForLeave: initialData?.groundForLeave || '',
    numberOfDays: initialData?.numberOfDays || '1',
    fromDate: initialData?.fromDate || '',
    toDate: initialData?.toDate || '',
    halfDay: initialData?.halfDay || '',
    leaveStation: initialData?.leaveStation || 'no',
    clAvailedCurrentYear: initialData?.clAvailedCurrentYear || '0',
    applicationDate: initialData?.applicationDate || new Date().toISOString().split('T')[0],
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<NrscCasualLeaveInputs>({
    resolver: zodResolver(NrscCasualLeaveSchema),
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
    'casual_leave_nrsc',
    isDirty ? formValues : undefined,
    translitLang,
    incomingDraftId || null
  );

  const handleOpenPreview = () => {
    // Validate signature before opening preview
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
      // Build payload with signature + auto-generated timestamp
      const now = new Date();
      const submissionPayload = {
        ...formValues,
        employeeSignature:   signature,
        submittedAt:         now.toISOString(),
        submittedDate:       now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }),
        submittedTime:       now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }) + ' IST',
      };
      await formService.submit('casual_leave_nrsc', translitLang, submissionPayload);
      if (draftId) {
        try {
          await formService.deleteDraft(draftId);
        } catch {
          // Ignore delete draft error if it fails
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
          formTitleHindi="आकस्मिक छुट्टी के लिए आवेदन"
          formTitleEnglish="Application for Casual Leave"
          formCode="NRSC-F-CL"
        />

        {/* Section 1: Employee Information */}
        <div className="form-section-card animate-fade-in">
          <h3 className="form-section-title">Employee Information / कर्मचारी की जानकारी</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  onChange={(_, val) => {
                    field.onChange(val);
                  }}
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
                  onChange={(_, val) => {
                    field.onChange(val);
                  }}
                  required
                  errorMessage={errors.designationGrade?.message}
                />
              )}
            />

            {/* 3. Employee Code */}
            <div className="form-field-row">
              <label htmlFor="employeeCode" className="form-label">
                <span className="field-number">3.</span>
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
        </div>

        {/* Section 2: Leave Information */}
        <div className="form-section-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="form-section-title">Leave Details / अवकाश का विवरण</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 4. Ground for Leave */}
            <Controller
              name="groundForLeave"
              control={control}
              render={({ field }) => (
                <TransliterateField
                  fieldNumber="4."
                  labelHindi="छुट्टी का कारण"
                  labelEnglish="Ground / Reason for Leave"
                  name="groundForLeave"
                  value={field.value}
                  onChange={(_, val) => {
                    field.onChange(val);
                  }}
                  multiline
                  rows={3}
                  required
                  errorMessage={errors.groundForLeave?.message}
                />
              )}
            />

            {/* Date range grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* From Date */}
              <div className="form-field-row">
                <label htmlFor="fromDate" className="form-label">
                  <span className="field-number">5.</span>
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
                  <span className="field-number">6.</span>
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
                  <span className="field-number">7.</span>
                  <span className="label-hindi hindi" lang="hi">छुट्टी की संख्या (दिन)</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">Number of Days</span>
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
              {/* Half Day Option */}
              <div className="form-field-row">
                <label htmlFor="halfDay" className="form-label">
                  <span className="field-number">8.</span>
                  <span className="label-hindi hindi" lang="hi">अर्धकालिक छुट्टी (यदि हो)</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">Half Day (if applicable)</span>
                </label>
                <select id="halfDay" {...register('halfDay')} className="form-input select-wrapper" style={{ height: '42px', borderRadius: '10px' }}>
                  <option value="">Full Day (पूरा दिन)</option>
                  <option value="Forenoon">Forenoon (पूर्वाह्न)</option>
                  <option value="Afternoon">Afternoon (अपराह्न)</option>
                </select>
              </div>

              {/* Leave Station */}
              <div className="form-field-row">
                <span className="form-label">
                  <span className="field-number">9.</span>
                  <span className="label-hindi hindi" lang="hi">क्या आप स्टेशन छोड़ेंगे?</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">Do you propose to leave the station?</span>
                </span>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                    <input
                      type="radio"
                      value="yes"
                      {...register('leaveStation')}
                      className="w-4 h-4 text-[#0B3C6D] focus:ring-[#0B3C6D]"
                    />
                    <span>हाँ / Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                    <input
                      type="radio"
                      value="no"
                      {...register('leaveStation')}
                      className="w-4 h-4 text-[#0B3C6D] focus:ring-[#0B3C6D]"
                    />
                    <span>नहीं / No</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CL availed so far */}
              <div className="form-field-row">
                <label htmlFor="clAvailedCurrentYear" className="form-label">
                  <span className="field-number">10.</span>
                  <span className="label-hindi hindi" lang="hi">इस कैलेंडर वर्ष में अब तक ली गई CL</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">CL availed so far in this calendar year</span>
                </label>
                <input
                  id="clAvailedCurrentYear"
                  type="number"
                  min="0"
                  {...register('clAvailedCurrentYear')}
                  className="form-input"
                />
              </div>

              {/* Application Date */}
              <div className="form-field-row">
                <label htmlFor="applicationDate" className="form-label">
                  <span className="field-number">11.</span>
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
        formType="casual_leave_nrsc"
        formData={formValues}
        language={translitLang}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
