// app/api/decrement-scans/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server'; // Corrected import
import { connectToDatabase } from '@/lib/database';
import { User } from '@/lib/database/models/User';
import { Subscription } from '@/lib/database/models/Subscription';

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const { userId } = getAuth(req); // Use getAuth

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user in the database
    const dbUser = await User.findOne({ clerkId: userId });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the user's subscription
    const subscription = await Subscription.findOne({ user: dbUser._id });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Decrement scans if plan is 'free' or 'monthly'
    if (subscription.plan === 'free' || subscription.plan === 'monthly') {
      if (subscription.scans !== null && subscription.scans > 0) {
        subscription.scans -= 1;
        await subscription.save();
        return NextResponse.json({ scans: subscription.scans }, { status: 200 });
      } else {
        return NextResponse.json({ error: 'No scans left' }, { status: 400 });
      }
    } else if (subscription.plan === 'annual') {
      // Unlimited scans
      return NextResponse.json({ scans: 'unlimited' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid subscription plan' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error decrementing scans:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
