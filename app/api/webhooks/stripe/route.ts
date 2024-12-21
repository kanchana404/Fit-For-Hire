// app/api/webhooks/stripe/route.ts

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '../../../../lib/database'; // Adjust the path as needed
import { User } from '../../../../lib/database/models/User';
import { Subscription } from '../../../../lib/database/models/Subscription';

// Initialize Stripe with your secret key and specify the API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-11-20.acacia',
});

// Define the handler for POST requests
export async function POST(req: Request) {
  // Retrieve the Stripe signature from the headers
  const signature = req.headers.get('stripe-signature');

  // Your Stripe Webhook Secret (set in .env)
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Check if webhook secret is set
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not defined.');
    return NextResponse.json(
      { error: 'Webhook Secret not configured' },
      { status: 500 }
    );
  }

  // Check if signature header is present
  if (!signature) {
    console.error('Missing Stripe signature.');
    return NextResponse.json(
      { error: 'Missing Stripe signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Read the raw body as text
    const body = await req.text();

    // Construct the event using the raw body and signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) { // Changed from 'any' to 'unknown'
    // Safely handle the error
    if (err instanceof Error) {
      console.error('Error verifying Stripe webhook signature:', err.message);
    } else {
      console.error('Unknown error verifying Stripe webhook signature:', err);
    }
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event based on its type
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Extract customer email from the session
    const customerEmail = session.customer_email;
    const amountPaid = session.amount_total; // Amount in the smallest currency unit (e.g., cents for USD)
    const currency = session.currency;

   
    if (!customerEmail) {
      console.error('No customer email found in the checkout session.');
      return NextResponse.json(
        { error: 'No customer email found in session' },
        { status: 400 }
      );
    }

    if (!currency) { // Added check for currency
      console.error('No currency found in the checkout session.');
      return NextResponse.json(
        { error: 'No currency found in session' },
        { status: 400 }
      );
    }

    try {
      // Connect to the MongoDB database
      await connectToDatabase();

      // Find the user by email
      const user = await User.findOne({ email: customerEmail });

      if (user) {
        // Determine the subscription plan based on the amount paid
        let plan: 'monthly' | 'annual';
        let scans: number | null;

        if (amountPaid === 800) { // $8.00
          plan = 'monthly';
          scans = 50;
        } else if (amountPaid === 5500) { // $55.00
          plan = 'annual';
          scans = null; // Unlimited scans
        } else {
          console.error(`Unexpected amount paid: ${amountPaid} ${currency.toUpperCase()}`);
          return NextResponse.json(
            { error: 'Unexpected amount paid' },
            { status: 400 }
          );
        }

        // Calculate the end date based on the plan
        const currentDate = new Date();
        let endDate: Date;

        if (plan === 'monthly') {
          endDate = new Date(currentDate);
          endDate.setMonth(endDate.getMonth() + 1);
        } else { // 'annual'
          endDate = new Date(currentDate);
          endDate.setFullYear(endDate.getFullYear() + 1);
        }

        // Check if the user already has a subscription
        const existingSubscription = await Subscription.findOne({ user: user._id });

        if (existingSubscription) {
          // Update existing subscription
          existingSubscription.plan = plan;
          existingSubscription.scans = scans;
          existingSubscription.startDate = currentDate;
          existingSubscription.endDate = endDate;
          await existingSubscription.save();

          console.log(`Updated subscription for user ID ${user._id}: Plan=${plan}, Scans=${scans}, EndDate=${endDate}`);
        } else {
          // Create a new subscription
          const newSubscription = new Subscription({
            user: user._id,
            plan: plan,
            scans: scans,
            startDate: currentDate,
            endDate: endDate,
          });

          await newSubscription.save();

        }

        // Log the user's data and the paid amount
      
    } else {
        // Log if no user is found with the provided email
        console.error(`No user found with email: ${customerEmail}`);
      }

      // TODO: Implement additional logic, such as sending confirmation emails, etc.
    } catch (dbError: unknown) { // Changed from 'any' to 'unknown'
      // Safely handle the database error
      if (dbError instanceof Error) {
        console.error('Database error:', dbError.message);
      } else {
        console.error('Unknown database error:', dbError);
      }
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }
  } else {
    // Log unhandled event types
    console.log(`Unhandled event type ${event.type}`);
  }

  // Respond with a 200 status code to acknowledge receipt of the event
  return NextResponse.json({ received: true });
}
