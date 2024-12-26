import Hero from "@/components/Hero";
import PricingPlans from "@/components/Pricing";
import React from "react";

const page = () => {
  return (
    <div className="overflow-hidden">
     
      <Hero />
      <div id="pricing">
        <PricingPlans />
      </div>
    </div>
  );
};

export default page;
