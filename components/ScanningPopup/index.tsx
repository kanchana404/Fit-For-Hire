"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScanningPopupProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
}

const ScanningPopup: React.FC<ScanningPopupProps> = ({ isOpen, onClose, fileName }) => {
  const [scanningState, setScanningState] = React.useState('scanning');
  
  React.useEffect(() => {
    if (isOpen) {
      // Simulate scanning process
      const timer = setTimeout(() => {
        setScanningState('complete');
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setScanningState('scanning');
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-md w-full relative"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="flex flex-col items-center gap-6 py-4">
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-24 h-32 border-2 border-pink-500/20 rounded-lg flex items-center justify-center"
                >
                  <FileText className="w-12 h-12 text-pink-500/50" />
                </motion.div>

                {scanningState === 'scanning' && (
                  <motion.div
                    initial={{ top: 0 }}
                    animate={{ top: '100%' }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-yellow-500"
                  />
                )}
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">
                  {scanningState === 'scanning' ? 'Analyzing Resume' : 'Analysis Complete'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {fileName}
                </p>
              </div>

              {scanningState === 'scanning' ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                  <span>Processing document...</span>
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 text-sm text-green-500"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Ready to view results</span>
                </motion.div>
              )}

              {scanningState === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white hover:opacity-90"
                    onClick={onClose}
                  >
                    View Analysis
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ScanningPopup;