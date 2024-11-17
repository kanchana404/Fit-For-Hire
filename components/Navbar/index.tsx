"use client"
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Moon,
  Sun,
  Home,
  FileText,
  Settings,
  LogIn
} from "lucide-react";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  
  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Jobs", href: "/jobs", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const backgroundClasses = scrolled 
    ? "bg-background/80 border-b border-border" 
    : "bg-gradient-to-r from-pink-500/10 via-transparent to-yellow-500/10 dark:from-pink-500/5 dark:via-transparent dark:to-yellow-500/5";

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <nav className={`w-full transition-all duration-300 backdrop-blur-sm ${backgroundClasses}`}>
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-500 to-yellow-500 text-transparent bg-clip-text hover:opacity-80 transition-opacity px-2">
                FitForHire
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-1 items-center justify-center px-8">
              <div className="flex items-center space-x-12">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium transition-colors hover:text-pink-500 dark:hover:text-yellow-400 group flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-pink-50 dark:hover:bg-pink-900/20"
                  >
                    <item.icon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-3 group-hover:translate-x-0" />
                    <span>{item.name}</span>
                  </a>
                ))}
              </div>
            </div>
            
            {/* Desktop Theme Toggle and Sign In */}
            <div className="hidden md:flex items-center space-x-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-full p-2"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              
              <Button 
                className="relative overflow-hidden group px-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-yellow-500 transition-transform group-hover:scale-105" />
                <span className="relative flex items-center text-white px-2">
                  <LogIn className="mr-2 h-4 w-4" /> Sign In
                </span>
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="hover:bg-pink-50 dark:hover:bg-pink-900/20 p-2"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="flex flex-col space-y-6 mt-8 px-4">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.name}
                          href={item.href}
                          className="flex items-center space-x-3 text-sm font-medium hover:text-pink-500 dark:hover:text-yellow-400 transition-colors p-2 rounded-md hover:bg-pink-50 dark:hover:bg-pink-900/20"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </a>
                      );
                    })}
                    <div className="pt-6 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="justify-start w-full p-2"
                      >
                        <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="ml-2">{theme === "dark" ? "Light" : "Dark"} Mode</span>
                      </Button>
                      <Button 
                        className="relative overflow-hidden group w-full mt-4"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-yellow-500 transition-transform group-hover:scale-105" />
                        <span className="relative flex items-center justify-center text-white p-2">
                          <LogIn className="mr-2 h-4 w-4" /> Sign In
                        </span>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;