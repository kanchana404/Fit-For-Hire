import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const Hero = () => {
  const features = [
    "AI-Powered Resume Screening",
    "95% Parsing Accuracy",
    "Instant Job Match Analysis",
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-yellow-500/10 dark:from-pink-500/5 dark:via-transparent dark:to-yellow-500/5 -z-10" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Transform Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
                Hiring Process
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered ATS simplifies resume screening, helping you find the perfect candidates faster than ever before.
            </p>

            <div className="flex flex-col md:flex-row justify-center gap-4 py-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center space-x-2 text-muted-foreground"
                >
                  <CheckCircle className="w-5 h-5 text-pink-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button className="px-8 bg-gradient-to-r h-12 from-pink-500 to-yellow-500 text-white font-medium hover:opacity-90 transition-opacity group">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="group h-12">
                View Demo
                <ArrowRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;