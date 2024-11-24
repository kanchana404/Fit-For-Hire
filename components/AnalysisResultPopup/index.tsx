"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AnalysisResultPopupProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    feedback: string;
    score?: number;
  } | null;
}

const AnalysisResultPopup: React.FC<AnalysisResultPopupProps> = ({
  isOpen,
  onClose,
  result
}) => {
  if (!result || !isOpen) return null;

  const feedbackLines = result.feedback
    .split('\n')
    .filter(line => line.trim() !== '');

  const score = result.score || 0;
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-3xl my-8"
        >
          <Card className="bg-white dark:bg-gray-900 shadow-2xl border-0">
            <CardContent className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-yellow-100 dark:from-pink-900/20 dark:to-yellow-900/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-yellow-500 text-transparent bg-clip-text">
                      Resume Analysis
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      Review your resume&apos;s performance
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Score Card */}
              {result.score !== undefined && (
                <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-pink-50 to-yellow-50 dark:from-pink-900/10 dark:to-yellow-900/10">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      ATS Compatibility Score
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                        {score}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback Cards */}
              <div className="space-y-4">
                {feedbackLines.map((feedback, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 flex items-start gap-4 group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {feedback}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white hover:opacity-90 px-6"
                >
                  Close Analysis
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AnalysisResultPopup;