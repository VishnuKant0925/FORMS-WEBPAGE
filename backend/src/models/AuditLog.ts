import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  target?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action:   { type: String, required: true },
    target:   { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
