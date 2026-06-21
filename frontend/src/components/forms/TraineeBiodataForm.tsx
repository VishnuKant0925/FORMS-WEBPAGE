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

const TraineeBiodataSchema = z.object({
  studentName: z.string().min(2, 'Student name must be at least 2 characters'),
  fatherHusbandName: z.string().min(2, 'Father/Husband name is required'),
  nationality: z.string().min(2, 'Nationality is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  presentAddress: z.string().min(5, 'Present address is required'),
  presentContactNumber: z.string().min(10, 'Valid present contact number is required'),
  presentEmail: z.string().email('Valid present email is required'),
  permanentAddress: z.string().min(5, 'Permanent address is required'),
  permanentContactNumber: z.string().min(10, 'Valid permanent contact number is required'),
  permanentEmail: z.string().email('Valid permanent email is required'),
  institutionCollegeName: z.string().min(2, 'Institution/College name is required'),
  affiliatedUniversity: z.string().min(2, 'Affiliated university is required'),
  disciplineSemesterYear: z.string().min(2, 'Discipline/Semester/Year is required'),
  hodGuideName: z.string().min(2, 'HOD / Guide name is required'),
  hodGuideAddress: z.string().min(5, 'HOD / Guide address is required'),
  hodGuideContactEmail: z.string().email('Valid HOD / Guide email is required'),
  projectTitle: z.string().min(5, 'Project title is required'),
  projectGuide: z.string().min(2, 'Project guide is required'),
  projectPeriod: z.string().min(2, 'Project period is required'),
  entryPassDate: z.string().min(1, 'Entry pass date is required'),
  lockerIssued: z.enum(['yes', 'no']).default('no'),
  lockerKeyNumber: z.string().default(''),
  lockerKeyDepositDate: z.string().default(''),
  enclosedDocuments: z.object({
    bacsRegistration: z.boolean().default(false),
    collegeLetter: z.boolean().default(false),
    characterCertificate: z.boolean().default(false),
    passportPhoto: z.boolean().default(false),
    aadhaarCard: z.boolean().default(false),
    otherIdCopy: z.boolean().default(false),
    collegeIdCopy: z.boolean().default(false),
  }),
});

type TraineeBiodataInputs = z.infer<typeof TraineeBiodataSchema>;

interface TraineeBiodataFormProps {
  initialData?: Record<string, any>;
  draftId?: string;
}

export default function TraineeBiodataForm({ initialData, draftId: incomingDraftId }: TraineeBiodataFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { lang: translitLang } = useTranslitStore();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [errorMsg, setErrorMsg]           = useState<string | null>(null);
  const [signature, setSignature]         = useState<string>('');
  const [sigError, setSigError]           = useState<string | null>(null);

  const defaultValues: TraineeBiodataInputs = {
    studentName: initialData?.studentName || user?.name || '',
    fatherHusbandName: initialData?.fatherHusbandName || '',
    nationality: initialData?.nationality || 'Indian',
    dateOfBirth: initialData?.dateOfBirth || '',
    presentAddress: initialData?.presentAddress || '',
    presentContactNumber: initialData?.presentContactNumber || '',
    presentEmail: initialData?.presentEmail || user?.email || '',
    permanentAddress: initialData?.permanentAddress || '',
    permanentContactNumber: initialData?.permanentContactNumber || '',
    permanentEmail: initialData?.permanentEmail || user?.email || '',
    institutionCollegeName: initialData?.institutionCollegeName || '',
    affiliatedUniversity: initialData?.affiliatedUniversity || '',
    disciplineSemesterYear: initialData?.disciplineSemesterYear || '',
    hodGuideName: initialData?.hodGuideName || '',
    hodGuideAddress: initialData?.hodGuideAddress || '',
    hodGuideContactEmail: initialData?.hodGuideContactEmail || '',
    projectTitle: initialData?.projectTitle || '',
    projectGuide: initialData?.projectGuide || '',
    projectPeriod: initialData?.projectPeriod || '',
    entryPassDate: initialData?.entryPassDate || '',
    lockerIssued: (initialData?.lockerIssued as 'yes' | 'no') || 'no',
    lockerKeyNumber: initialData?.lockerKeyNumber || '',
    lockerKeyDepositDate: initialData?.lockerKeyDepositDate || '',
    enclosedDocuments: {
      bacsRegistration: initialData?.enclosedDocuments?.bacsRegistration || false,
      collegeLetter: initialData?.enclosedDocuments?.collegeLetter || false,
      characterCertificate: initialData?.enclosedDocuments?.characterCertificate || false,
      passportPhoto: initialData?.enclosedDocuments?.passportPhoto || false,
      aadhaarCard: initialData?.enclosedDocuments?.aadhaarCard || false,
      otherIdCopy: initialData?.enclosedDocuments?.otherIdCopy || false,
      collegeIdCopy: initialData?.enclosedDocuments?.collegeIdCopy || false,
    },
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<TraineeBiodataInputs>({
    resolver: zodResolver(TraineeBiodataSchema),
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

  // Helper to map checklist items to template format
  const getPayload = (data: TraineeBiodataInputs) => {
    return {
      ...data,
      doc_bacsRegistration: data.enclosedDocuments.bacsRegistration ? '✓' : '',
      doc_collegeLetter: data.enclosedDocuments.collegeLetter ? '✓' : '',
      doc_characterCertificate: data.enclosedDocuments.characterCertificate ? '✓' : '',
      doc_passportPhoto: data.enclosedDocuments.passportPhoto ? '✓' : '',
      doc_aadhaarCard: data.enclosedDocuments.aadhaarCard ? '✓' : '',
      doc_otherIdCopy: data.enclosedDocuments.otherIdCopy ? '✓' : '',
      doc_collegeIdCopy: data.enclosedDocuments.collegeIdCopy ? '✓' : '',
    };
  };

  const computedValues = getPayload(formValues);

  // Setup Auto-Save
  const { draftId, saveStatus, lastSaved, save } = useAutoSave(
    'trainee_biodata',
    isDirty ? computedValues : undefined,
    translitLang,
    incomingDraftId || null
  );

  const handleOpenPreview = () => {
    if (!signature) {
      setSigError('Trainee signature is required before submission.');
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
        traineeSignature: signature,
        submittedAt:      now.toISOString(),
        submittedDate:    now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }),
        submittedTime:    now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }) + ' IST',
      };
      await formService.submit('trainee_biodata', translitLang, submissionPayload);
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
          formTitleHindi="प्रशिक्षणार्थी व्यक्तिगत जानकारी / जीवन वृत्त"
          formTitleEnglish="Trainee Personal Information / Bio-Data"
        />

        {/* Section 1: Personal Information */}
        <div className="form-section-card animate-fade-in">
          <h3 className="form-section-title">A. Personal Information / व्यक्तिगत जानकारी</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Name */}
            <Controller
              name="studentName"
              control={control}
              render={({ field }) => (
                <TransliterateField
                  labelHindi="छात्र/प्रशिक्षणार्थी का नाम"
                  labelEnglish="Name of Student / Trainee"
                  name="studentName"
                  value={field.value}
                  onChange={(_, val) => field.onChange(val)}
                  required
                  errorMessage={errors.studentName?.message}
                />
              )}
            />

            {/* Father Name */}
            <Controller
              name="fatherHusbandName"
              control={control}
              render={({ field }) => (
                <TransliterateField
                  labelHindi="पिता / पति का नाम"
                  labelEnglish="Father's / Husband's Name"
                  name="fatherHusbandName"
                  value={field.value}
                  onChange={(_, val) => field.onChange(val)}
                  required
                  errorMessage={errors.fatherHusbandName?.message}
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nationality */}
              <div className="form-field-row">
                <label htmlFor="nationality" className="form-label">
                  <span className="label-hindi hindi" lang="hi">राष्ट्रीयता</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">Nationality</span>
                  <span className="required-marker">*</span>
                </label>
                <input
                  id="nationality"
                  type="text"
                  {...register('nationality')}
                  className="form-input"
                  required
                />
                {errors.nationality && (
                  <p className="text-xs text-[#D32F2F] mt-1">{errors.nationality.message}</p>
                )}
              </div>

              {/* DOB */}
              <div className="form-field-row">
                <label htmlFor="dateOfBirth" className="form-label">
                  <span className="label-hindi hindi" lang="hi">जन्म तिथि</span>
                  <span className="label-separator">/</span>
                  <span className="label-english">Date of Birth</span>
                  <span className="required-marker">*</span>
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  {...register('dateOfBirth')}
                  className="form-input"
                  required
                />
                {errors.dateOfBirth && (
                  <p className="text-xs text-[#D32F2F] mt-1">{errors.dateOfBirth.message}</p>
                )}
              </div>
            </div>

            {/* Present Address Block */}
            <div className="p-4 border border-[#E4E7EB] rounded bg-[#F8FAFC]">
              <h4 className="text-xs font-bold text-[#334E68] uppercase mb-4 tracking-wide">Present Contact Details</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Controller
                  name="presentAddress"
                  control={control}
                  render={({ field }) => (
                    <TransliterateField
                      labelHindi="वर्तमान पता"
                      labelEnglish="Present Address"
                      name="presentAddress"
                      value={field.value}
                      onChange={(_, val) => field.onChange(val)}
                      multiline
                      rows={2}
                      required
                      errorMessage={errors.presentAddress?.message}
                    />
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-field-row">
                    <label htmlFor="presentContactNumber" className="form-label">Present Contact No. <span className="required-marker">*</span></label>
                    <input id="presentContactNumber" type="text" {...register('presentContactNumber')} className="form-input" required />
                    {errors.presentContactNumber && <p className="text-xs text-[#D32F2F] mt-1">{errors.presentContactNumber.message}</p>}
                  </div>
                  <div className="form-field-row">
                    <label htmlFor="presentEmail" className="form-label">Present Email ID <span className="required-marker">*</span></label>
                    <input id="presentEmail" type="email" {...register('presentEmail')} className="form-input" required />
                    {errors.presentEmail && <p className="text-xs text-[#D32F2F] mt-1">{errors.presentEmail.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Permanent Address Block */}
            <div className="p-4 border border-[#E4E7EB] rounded bg-[#F8FAFC]">
              <h4 className="text-xs font-bold text-[#334E68] uppercase mb-4 tracking-wide">Permanent Contact Details</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Controller
                  name="permanentAddress"
                  control={control}
                  render={({ field }) => (
                    <TransliterateField
                      labelHindi="स्थायी पता"
                      labelEnglish="Permanent Address"
                      name="permanentAddress"
                      value={field.value}
                      onChange={(_, val) => field.onChange(val)}
                      multiline
                      rows={2}
                      required
                      errorMessage={errors.permanentAddress?.message}
                    />
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-field-row">
                    <label htmlFor="permanentContactNumber" className="form-label">Permanent Contact No. <span className="required-marker">*</span></label>
                    <input id="permanentContactNumber" type="text" {...register('permanentContactNumber')} className="form-input" required />
                    {errors.permanentContactNumber && <p className="text-xs text-[#D32F2F] mt-1">{errors.permanentContactNumber.message}</p>}
                  </div>
                  <div className="form-field-row">
                    <label htmlFor="permanentEmail" className="form-label">Permanent Email ID <span className="required-marker">*</span></label>
                    <input id="permanentEmail" type="email" {...register('permanentEmail')} className="form-input" required />
                    {errors.permanentEmail && <p className="text-xs text-[#D32F2F] mt-1">{errors.permanentEmail.message}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Institution Details */}
        <div className="form-section-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="form-section-title">B. Institution Details / संस्था विवरण</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Controller
              name="institutionCollegeName"
              control={control}
              render={({ field }) => (
                <TransliterateField
                  labelHindi="संस्था / कॉलेज का नाम"
                  labelEnglish="Name of Institution / College"
                  name="institutionCollegeName"
                  value={field.value}
                  onChange={(_, val) => field.onChange(val)}
                  required
                  errorMessage={errors.institutionCollegeName?.message}
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="affiliatedUniversity"
                control={control}
                render={({ field }) => (
                  <TransliterateField
                    labelHindi="सम्बद्ध विश्वविद्यालय"
                    labelEnglish="Affiliated University"
                    name="affiliatedUniversity"
                    value={field.value}
                    onChange={(_, val) => field.onChange(val)}
                    required
                    errorMessage={errors.affiliatedUniversity?.message}
                  />
                )}
              />

              <Controller
                name="disciplineSemesterYear"
                control={control}
                render={({ field }) => (
                  <TransliterateField
                    labelHindi="अनुशासन / सेमेस्टर / वर्ष"
                    labelEnglish="Discipline / Semester / Year"
                    name="disciplineSemesterYear"
                    value={field.value}
                    onChange={(_, val) => field.onChange(val)}
                    required
                    errorMessage={errors.disciplineSemesterYear?.message}
                  />
                )}
              />
            </div>

            {/* HOD Guide details */}
            <div className="p-4 border border-[#E4E7EB] rounded bg-[#F8FAFC]">
              <h4 className="text-xs font-bold text-[#334E68] uppercase mb-4 tracking-wide">College HOD / Guide Details</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Controller
                  name="hodGuideName"
                  control={control}
                  render={({ field }) => (
                    <TransliterateField
                      labelHindi="HOD / गाइड का नाम"
                      labelEnglish="Name of HOD / Guide"
                      name="hodGuideName"
                      value={field.value}
                      onChange={(_, val) => field.onChange(val)}
                      required
                      errorMessage={errors.hodGuideName?.message}
                    />
                  )}
                />
                <Controller
                  name="hodGuideAddress"
                  control={control}
                  render={({ field }) => (
                    <TransliterateField
                      labelHindi="HOD / गाइड का पता"
                      labelEnglish="Address of HOD / Guide"
                      name="hodGuideAddress"
                      value={field.value}
                      onChange={(_, val) => field.onChange(val)}
                      multiline
                      rows={2}
                      required
                      errorMessage={errors.hodGuideAddress?.message}
                    />
                  )}
                />
                <div className="form-field-row">
                  <label htmlFor="hodGuideContactEmail" className="form-label">HOD / Guide Contact Email ID <span className="required-marker">*</span></label>
                  <input id="hodGuideContactEmail" type="email" {...register('hodGuideContactEmail')} className="form-input" required />
                  {errors.hodGuideContactEmail && <p className="text-xs text-[#D32F2F] mt-1">{errors.hodGuideContactEmail.message}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Project Details */}
        <div className="form-section-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="form-section-title">C. Project / परियोजना विवरण</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Controller
              name="projectTitle"
              control={control}
              render={({ field }) => (
                <TransliterateField
                  labelHindi="परियोजना का शीर्षक"
                  labelEnglish="Project Title"
                  name="projectTitle"
                  value={field.value}
                  onChange={(_, val) => field.onChange(val)}
                  required
                  errorMessage={errors.projectTitle?.message}
                />
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="projectGuide"
                control={control}
                render={({ field }) => (
                  <TransliterateField
                    labelHindi="NRSC प्रोजेक्ट गाइड"
                    labelEnglish="NRSC Project Guide (Internal)"
                    name="projectGuide"
                    value={field.value}
                    onChange={(_, val) => field.onChange(val)}
                    required
                    errorMessage={errors.projectGuide?.message}
                  />
                )}
              />

              <div className="form-field-row">
                <label htmlFor="projectPeriod" className="form-label">Training Period (e.g. June — August 2026) <span className="required-marker">*</span></label>
                <input id="projectPeriod" type="text" {...register('projectPeriod')} className="form-input" required />
                {errors.projectPeriod && <p className="text-xs text-[#D32F2F] mt-1">{errors.projectPeriod.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-field-row">
                <label htmlFor="entryPassDate" className="form-label">Entry Pass Issue Date <span className="required-marker">*</span></label>
                <input id="entryPassDate" type="date" {...register('entryPassDate')} className="form-input" required />
                {errors.entryPassDate && <p className="text-xs text-[#D32F2F] mt-1">{errors.entryPassDate.message}</p>}
              </div>

              <div className="form-field-row">
                <span className="form-label">Locker Issued?</span>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                    <input
                      type="radio"
                      value="yes"
                      {...register('lockerIssued')}
                      className="w-4 h-4 text-[#0B3C6D] focus:ring-[#0B3C6D]"
                    />
                    <span>हाँ / Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                    <input
                      type="radio"
                      value="no"
                      {...register('lockerIssued')}
                      className="w-4 h-4 text-[#0B3C6D] focus:ring-[#0B3C6D]"
                    />
                    <span>नहीं / No</span>
                  </label>
                </div>
              </div>
            </div>

            {formValues.lockerIssued === 'yes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                <div className="form-field-row">
                  <label htmlFor="lockerKeyNumber" className="form-label">Locker Key Number</label>
                  <input id="lockerKeyNumber" type="text" {...register('lockerKeyNumber')} className="form-input" />
                </div>
                <div className="form-field-row">
                  <label htmlFor="lockerKeyDepositDate" className="form-label">Key Deposit / Issue Date</label>
                  <input id="lockerKeyDepositDate" type="date" {...register('lockerKeyDepositDate')} className="form-input" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Documents Enclosed */}
        <div className="form-section-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h3 className="form-section-title">D. Documents Enclosed / संलग्न दस्तावेज़</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-[#E4E7EB] rounded bg-[#F8FAFC]">
            <label className="flex items-center gap-3 cursor-pointer text-sm font-medium">
              <input type="checkbox" {...register('enclosedDocuments.bacsRegistration')} className="w-4 h-4 text-[#0B3C6D] rounded" />
              <span>BACS Registration Copy</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer text-sm font-medium">
              <input type="checkbox" {...register('enclosedDocuments.collegeLetter')} className="w-4 h-4 text-[#0B3C6D] rounded" />
              <span>College Authorization Letter</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer text-sm font-medium">
              <input type="checkbox" {...register('enclosedDocuments.characterCertificate')} className="w-4 h-4 text-[#0B3C6D] rounded" />
              <span>Character Certificate</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer text-sm font-medium">
              <input type="checkbox" {...register('enclosedDocuments.passportPhoto')} className="w-4 h-4 text-[#0B3C6D] rounded" />
              <span>Passport Photo (2 copies)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer text-sm font-medium">
              <input type="checkbox" {...register('enclosedDocuments.aadhaarCard')} className="w-4 h-4 text-[#0B3C6D] rounded" />
              <span>Aadhaar Card Copy</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer text-sm font-medium">
              <input type="checkbox" {...register('enclosedDocuments.collegeIdCopy')} className="w-4 h-4 text-[#0B3C6D] rounded" />
              <span>College Student ID Card Copy</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer text-sm font-medium">
              <input type="checkbox" {...register('enclosedDocuments.otherIdCopy')} className="w-4 h-4 text-[#0B3C6D] rounded" />
              <span>Other Govt. ID Card Copy</span>
            </label>
          </div>
        </div>

        {/* Section 5: Signature & Submission */}
        <div className="form-section-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h3 className="form-section-title">Signature & Submission / हस्ताक्षर और प्रस्तुत करना</h3>
          <SignatureUpload
            value={signature}
            onChange={setSignature}
            required
            labelHindi="प्रशिक्षणार्थी के हस्ताक्षर"
            labelEnglish="Trainee Signature"
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
        formType="trainee_biodata"
        formData={computedValues}
        language={translitLang}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
