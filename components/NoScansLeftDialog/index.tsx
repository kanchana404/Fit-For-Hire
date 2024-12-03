// components/NoScansLeftDialog.tsx

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface NoScansLeftDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const NoScansLeftDialog: React.FC<NoScansLeftDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const router = useRouter();

  const handleUpgrade = () => {
    // Redirect to the upgrade page or pricing page
    router.push("/pricing");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>No Scans Left</DialogTitle>
          <DialogDescription>
            You have used all your scans. Please upgrade your plan to continue scanning resumes.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button onClick={handleUpgrade}>Upgrade Plan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoScansLeftDialog;
