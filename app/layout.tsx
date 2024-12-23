import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider, UserButton } from "@clerk/nextjs";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Fit for Hire | Revolutionizing Recruitment with AI",
  description:
    "Fit for Hire leverages cutting-edge AI technology to streamline your hiring process, offering AI-powered resume screening, instant job match analysis, and unparalleled parsing accuracy to help you find the perfect candidates faster.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            {children}
            <Toaster />
            
            {/* Persistent UserButton in bottom right corner */}
            <div className="fixed bottom-4 right-4 z-50">
              <UserButton afterSignOutUrl="/" />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}