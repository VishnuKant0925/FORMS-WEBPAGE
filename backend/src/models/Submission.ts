import mongoose, { Schema, Document } from 'mongoose';

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

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId;
  formType: FormType;
  language: string;
  formData: Record<string, unknown>;
  status: SubmissionStatus;
  supervisorComment?: string;
  hrComment?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    formType: {
      type: String,
      required: true,
      enum: ['casual_leave_nrsc', 'earned_leave', 'casual_leave_rrsc', 'trainee_biodata'],
      index: true,
    },
    language:          { type: String, required: true, default: 'hi' },
    formData:          { type: Schema.Types.Mixed, required: true },
    status:            { type: String, enum: ['draft','submitted','recommended','approved','rejected','returned'], default: 'submitted', index: true },
    supervisorComment: { type: String },
    hrComment:         { type: String },
    reviewedBy:        { type: Schema.Types.ObjectId, ref: 'User', default: undefined },
    reviewedAt:        { type: Date, default: undefined },
  },
  { timestamps: true }
);

export default mongoose.model<ISubmission>('Submission', submissionSchema);
