// app/api/subscription/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server'; // Corrected import
import { connectToDatabase } from '@/lib/database';
import { User } from '@/lib/database/models/User';
import { Subscription } from '@/lib/database/models/Subscription';

export async function GET(req: NextRequest) {
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

    return NextResponse.json({ subscription }, { status: 200 });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
