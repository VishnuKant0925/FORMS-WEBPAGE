import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'employee' | 'supervisor' | 'hr' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  employeeCode?: string;
  department?: string;
  designation?: string;
  profilePhoto?: string;
  role: UserRole;
  authProvider: 'local' | 'google';
  googleId?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: undefined },
    employeeCode: { type: String, sparse: true, trim: true },
    department:   { type: String, trim: true },
    designation:  { type: String, trim: true },
    profilePhoto: { type: String },
    role:         { type: String, enum: ['employee', 'supervisor', 'hr', 'admin'], default: 'employee' },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId:     { type: String, sparse: true, unique: true, default: undefined },
    refreshToken: { type: String, default: undefined },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
