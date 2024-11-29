"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CheckCircle } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js"; // Import loadStripe

const PricingPlans = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [plan, setPlan] = useState<'free' | 'pro'>('pro'); // Default to pro plan ($8/month)

  const freePlanFeatures = [
    "Basic Resume Screening",
    "Up to 25 resumes/month",
    "Standard Support",
    "Basic Analytics",
  ];

  const proPlanFeatures = [
    "Advanced AI Screening",
    "Unlimited resumes",
    "Priority Support",
    "Advanced Analytics",
    "Custom Parsing Rules",
    "API Access",
  ];

  const handleToggle = () => {
    setIsAnnual(!isAnnual);
  };

  const handlePlanSelection = (selectedPlan: 'free' | 'pro') => {
    setPlan(selectedPlan);
  };

  const createCheckoutSession = async () => {
    if (plan === 'free') {
      alert("You selected the Free plan, no payment required.");
      return; // Do nothing for free plan
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan, isAnnual }),
      });

      const data = await response.json();
      if (data.id) {
        // Redirect to Stripe Checkout
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);
        stripe?.redirectToCheckout({ sessionId: data.id });
      } else {
        alert("Error creating checkout session");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while creating the checkout session");
    }
  };

  const planPrice = isAnnual ? 55 : 8; // Corrected price logic

  return (
    <div className="relative py-20 px-4">
      {/* Background effects matching hero */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-yellow-500/10 dark:from-pink-500/5 dark:via-transparent dark:to-yellow-500/5 -z-10" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="max-w-6xl mx-auto">
        {/* Pricing Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Simple, Transparent{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
              Pricing
            </span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Choose the perfect plan for your hiring needs
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 select-none">
            <button
              onClick={() => setIsAnnual(false)}
              className={`text-sm transition-colors ${!isAnnual ? "text-foreground font-medium" : "text-muted-foreground"}`}
            >
              Monthly
            </button>
            <div className="relative">
              <Switch
                checked={isAnnual}
                onCheckedChange={handleToggle}
                className="data-[state=checked]:bg-gradient-to-r from-pink-500 to-yellow-500"
              />
            </div>
            <button
              onClick={() => setIsAnnual(true)}
              className={`text-sm transition-colors ${isAnnual ? "text-foreground font-medium" : "text-muted-foreground"}`}
            >
              Yearly{" "}
              <span className="text-pink-500 font-medium ml-1">(-40%)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="relative p-8 rounded-xl border bg-card backdrop-blur-sm flex flex-col h-full">
            <div className="flex-grow">
              <h3 className="text-xl font-semibold mb-2 text-foreground">Free Plan</h3>
              <p className="text-muted-foreground mb-4">Perfect for getting started</p>
              <div className="text-3xl font-bold mb-6 text-foreground">
                $0 <span className="text-base font-normal text-muted-foreground">/month</span>
              </div>
              <div className="space-y-4 mb-8 flex-grow">
                {freePlanFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-pink-500 shrink-0" />
                    <span className="text-foreground dark:text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-auto">
              <Button
                variant="outline"
                className="w-full transition-colors bg-black text-white dark:bg-white dark:text-black hover:bg-pink-500/10"
                onClick={() => handlePlanSelection('free')}
              >
                Select Plan
              </Button>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="relative p-8 rounded-xl border bg-card backdrop-blur-sm flex flex-col h-full">
            <div className="absolute -top-4 right-4 px-4 py-1 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full text-xs font-medium text-white">
              MOST POPULAR
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-semibold mb-2 text-foreground">Pro Plan</h3>
              <p className="text-muted-foreground mb-4">For growing businesses</p>
              <div className="text-3xl font-bold mb-6 text-foreground">
                ${planPrice}{" "}
                <span className="text-base font-normal text-muted-foreground">
                  /{isAnnual ? "year" : "month"}
                </span>
              </div>
              <div className="space-y-4 mb-8 flex-grow">
                {proPlanFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-pink-500 shrink-0" />
                    <span className="text-foreground dark:text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full transition-colors bg-gradient-to-r from-pink-500 to-yellow-500 text-white"
                onClick={createCheckoutSession}
              >
                {isAnnual ? "Pay $55/year" : "Pay $8/month"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;
