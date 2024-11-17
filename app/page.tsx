import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import PricingPlans from "@/components/Pricing";
import React from "react";

const page = () => {
  return (
    <div className="overflow-hidden">
      <Navbar />
      <Hero />
      <PricingPlans />
    </div>
  );
};

export default page;
