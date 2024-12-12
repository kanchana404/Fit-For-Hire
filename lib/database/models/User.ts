// models/User.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photo?: string;
}

const UserSchema: Schema<IUser> = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  username: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  photo: { type: String },
});

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
