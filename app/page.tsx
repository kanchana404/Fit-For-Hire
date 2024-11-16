import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import React from "react";

const page = () => {
  return (
    <div className="overflow-hidden">
      <Navbar />
      <Hero />
    </div>
  );
};

export default page;
