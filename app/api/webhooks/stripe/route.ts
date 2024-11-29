// import { NextRequest, NextResponse } from "next/server";
// import Stripe from "stripe";
// import {
//   createOrUpdateSubscription,
//   createTransaction,
//   processReferralCommission,
// } from "@/actions/subscription.action"; // Import processReferralCommission
// import { getUserById } from "@/actions/UserAction"; // Import getUserById

// export async function POST(request: NextRequest) {
//   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//     apiVersion: "2024-10-28.acacia",
//   });

//   const sig = request.headers.get("stripe-signature") as string;
//   const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

//   const buf = await request.arrayBuffer();
//   const rawBody = Buffer.from(buf);

//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
//   } catch (err: any) {
//     console.error("Webhook signature verification failed:", err.message);
//     return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
//   }

//   // Handle the event
//   switch (event.type) {
//     case "customer.subscription.created":
//     case "customer.subscription.updated":
//     case "customer.subscription.deleted":
//       const subscription = event.data.object as Stripe.Subscription;
//       await handleSubscriptionEvent(stripe, subscription, event.type);
//       break;
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   return NextResponse.json({ received: true });
// }

// async function handleSubscriptionEvent(
//   stripe: Stripe,
//   subscription: Stripe.Subscription,
//   eventType: string
// ) {
//   try {
//     const customer = (await stripe.customers.retrieve(
//       subscription.customer as string
//     )) as Stripe.Customer;
//     const clerkUserId = customer?.metadata?.clerkUserId;

//     if (!clerkUserId) {
//       console.error("No clerkUserId found in customer metadata");
//       return;
//     }

//     // Ensure subscription.items and price exist
//     const subscriptionItem = subscription.items?.data[0];
//     if (!subscriptionItem || !subscriptionItem.price) {
//       console.error("Subscription item or price data is missing.");
//       return;
//     }

//     const productId = subscriptionItem.price.product as string;
//     const priceId = subscriptionItem.price.id as string;
//     const amount = subscriptionItem.price.unit_amount
//       ? subscriptionItem.price.unit_amount / 100
//       : 0; // Amount in dollars

//     // Map productId to product names
//     const productNames: Record<string, string> = {
//       "prod_R4PEWuvnkmbB5k": "1 Month Plan",
//       "prod_R4PExcfu7NWbvu": "3 Months Plan",
//       "prod_R4PFOPF698qZAr": "1 Year Plan",
//     };

//     const productName = productNames[productId] || "Unknown Product";

//     const subscriptionData = {
//       clerkUserId,
//       subscriptionId: subscription.id,
//       productId,
//       priceId,
//       amount,
//       productName,
//       status: subscription.status,
//       currentPeriodEnd: new Date(subscription.current_period_end * 1000),
//     };

//     // Create or update subscription
//     await createOrUpdateSubscription(subscriptionData);

//     // Create a transaction record for the subscription event with specific product information
//     if (eventType === "customer.subscription.created") {
//       const reason = `${productName} Created`; // e.g., "1 Month Plan Created"
//       await createTransaction(clerkUserId, amount, reason);
//       console.log(
//         `Transaction created for clerkUserId: ${clerkUserId}, amount: ${amount}, reason: ${reason}`
//       );
//     } else if (eventType === "customer.subscription.updated") {
//       const reason = `${productName} Updated`; // e.g., "1 Month Plan Updated"
//       await createTransaction(clerkUserId, amount, reason);
//       console.log(
//         `Transaction created for clerkUserId: ${clerkUserId}, amount: ${amount}, reason: ${reason}`
//       );
//     }

//     // **Process Referral Commission**
//     await processReferralCommission(clerkUserId, amount);
//   } catch (error) {
//     console.error("Error handling subscription event:", error);
//   }
// }
