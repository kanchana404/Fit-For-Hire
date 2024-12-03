// lib/database/models/Subscription.ts

import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId | IUser;
  plan: 'free' | 'monthly' | 'annual';
  scans: number | null; // Use 'null' for unlimited scans
  startDate: Date;
  endDate?: Date;
}

const SubscriptionSchema: Schema<ISubscription> = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['free', 'monthly', 'annual'], required: true },
  scans: {
    type: Number,
    default: function () {
      if (this.plan === 'free') return 3;
      if (this.plan === 'monthly') return 50;
      if (this.plan === 'annual') return null; // null represents unlimited scans
      return 0;
    },
    required: true,
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
});

export const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>('Subscription', SubscriptionSchema);




  //tt
