// Auth types
export interface LoginPayload     { email: string; password: string; }
export interface RegisterPayload  { name: string; email: string; password: string; }
export interface AuthResponse     { user: import('@/store/useAuthStore').AuthUser; accessToken: string; }

// Form types
export type FormType =
  | 'casual_leave_nrsc'
  | 'earned_leave'
  | 'casual_leave_rrsc'
  | 'trainee_biodata';

export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'recommended'
  | 'approved'
  | 'rejected'
  | 'returned';

export interface Submission {
  _id: string;
  userId: string | { _id: string; name: string; email: string; employeeCode?: string };
  formType: FormType;
  language: string;
  formData: Record<string, unknown>;
  status: SubmissionStatus;
  supervisorComment?: string;
  hrComment?: string;
  reviewedBy?: string | { name: string; email: string };
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  submissions?: T[];
  users?: T[];
  total: number;
  page: number;
  pages: number;
}

// Form data shapes
export interface CasualLeaveNrscData {
  applicantName: string;
  designationGrade: string;
  employeeCode: string;
  groundForLeave: string;
  numberOfDays: string;
  fromDate: string;
  toDate: string;
  halfDay: '' | 'Forenoon' | 'Afternoon';
  leaveStation: 'yes' | 'no';
  clAvailedCurrentYear: string;
  applicationDate: string;
}

export interface EarnedLeaveData {
  applicantName: string;
  designationGrade: string;
  divisionSection: string;
  employeeCode: string;
  basicPay: string;
  hraConveyanceAllowance: string;
  leaveRulesApplicable: string;
  leaveType: string;
  numberOfDays: string;
  fromDate: string;
  toDate: string;
  sundaysHolidaysPrefixSuffix: string;
  groundForLeave: string;
  dateOfReturnFromLastLeave: string;
  ltcProposal: 'yes' | 'no';
  ltcBlockYear: string;
  leaveAddress: string;
  applicationDate: string;
}

export interface RrscCasualLeaveData {
  employeeCode: string;
  applicantName: string;
  designationGrade: string;
  divisionSection: string;
  natureOfLeave: 'CL' | 'Spl CL' | 'Compensatory Off';
  numberOfDays: string;
  fromDate: string;
  toDate: string;
  prefixing: string;
  suffixing: string;
  purpose: string;
  addressDuringLeave: string;
  interveningClosedHolidays: string;
  clTakenSoFar: string;
  applicationDate: string;
}

export interface TraineeBiodataData {
  studentName: string;
  fatherHusbandName: string;
  nationality: string;
  dateOfBirth: string;
  presentAddress: string;
  presentContactNumber: string;
  presentEmail: string;
  permanentAddress: string;
  permanentContactNumber: string;
  permanentEmail: string;
  institutionCollegeName: string;
  affiliatedUniversity: string;
  disciplineSemesterYear: string;
  hodGuideName: string;
  hodGuideAddress: string;
  hodGuideContactEmail: string;
  projectTitle: string;
  projectGuide: string;
  projectPeriod: string;
  entryPassDate: string;
  lockerIssued: 'yes' | 'no';
  lockerKeyNumber: string;
  lockerKeyDepositDate: string;
  enclosedDocuments: {
    bacsRegistration: boolean;
    collegeLetter: boolean;
    characterCertificate: boolean;
    passportPhoto: boolean;
    aadhaarCard: boolean;
    otherIdCopy: boolean;
    collegeIdCopy: boolean;
  };
}
