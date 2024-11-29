import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(req: Request) {
  const { plan, isAnnual } = await req.json(); // Expecting plan type ('free' or 'pro') and billing period (annual or monthly)

  try {
    if (!plan || !['free', 'pro'].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Get base URL for success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_SERVER_URL is not defined in the environment");
    }

    // Define pricing for each plan
    let priceInCents;
    if (plan === 'pro') {
      priceInCents = isAnnual ? 5500 : 800;  // Example: $55/year or $8/month (in cents)
    } else {
      priceInCents = 0;  // Free plan
    }

    // Create a Checkout session with the correct pricing
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan === 'pro' ? 'Pro Plan' : 'Free Plan',
            },
            unit_amount: priceInCents,  // Use the dynamic price
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
    });

    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
