// app/api/create-checkout-session/route.ts

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { currentUser } from '@clerk/nextjs/server'; // Import currentUser

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(req: Request) {
  try {
    const { plan, isAnnual } = await req.json(); // Expecting plan type ('free' or 'pro') and billing period (annual or monthly)

    // Validate plan
    if (!plan || !['free', 'pro'].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // If the plan is 'free', no need to create a checkout session
    if (plan === 'free') {
      return NextResponse.json({ message: "Free plan selected, no payment required." });
    }

    // Ensure the user is authenticated
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Directly access the first email address
    const emailAddressObj = user.emailAddresses?.[0];
    const email = emailAddressObj?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "User email not found." }, { status: 400 });
    }

    // Get base URL for success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_SERVER_URL is not defined in the environment");
    }

    // Define pricing for each plan
    let priceInCents: number;


    if (plan === 'pro') {
      if (isAnnual) {
        priceInCents = 5500; // $55/year

      } else {
        priceInCents = 800; // $8/month

      }
    } else {
      // Although 'free' is handled earlier, adding for completeness
      priceInCents = 0;
 
    }

    // Create a Checkout session with the correct pricing and customer email
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan === 'pro' ? 'Pro Plan' : 'Free Plan',
            },
            unit_amount: priceInCents, // Dynamic price based on plan and billing period
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email, // Set the customer email from Clerk
      success_url: `${baseUrl}/`,
      cancel_url: `${baseUrl}/`,
    });

    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
