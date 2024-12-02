import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface IPLimitDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const IPLimitDialog: React.FC<IPLimitDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-black/80 backdrop-blur-lg border-none shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-transparent to-yellow-500/10 dark:from-pink-500/5 dark:via-transparent dark:to-yellow-500/5 -z-10 rounded-lg" />

        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-foreground">
            Usage Limit Reached
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base mt-2">
            You&apos;ve maximized your free resume scans. Create an account to
            continue analyzing resumes effortlessly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Not Now
            </Button>
            <Link href="/sign-up">
              <Button
                onClick={() => {
                  onOpenChange(false);
                }}
                className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 text-white hover:opacity-90 transition-opacity"
              >
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IPLimitDialog;
