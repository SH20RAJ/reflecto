"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function JournalingDemo() {
  const [isWriting, setIsWriting] = useState(false);
  const [text, setText] = useState("");
  const [demoComplete, setDemoComplete] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const journalEntry = `Today was surprisingly productive. I started the morning with a 20-minute meditation session which helped clear my mind. Work went smoothly and I managed to finish the project ahead of schedule. I'm proud of how I handled the client meeting - stayed calm despite some challenging questions.

I've been reflecting on my goals for the next quarter. Maybe it's time to focus more on personal growth and less on just work metrics. My energy levels seem better when I balance work with creative projects.

One thing to improve: I need to set better boundaries around after-hours emails. Tomorrow I'll try not checking messages after 6pm.`;

  // Run the demo sequence
  useEffect(() => {
    if (demoComplete) return;

    const runDemo = async () => {
      setIsWriting(true);
      let currentText = "";

      for (let i = 0; i < journalEntry.length; i++) {
        currentText += journalEntry[i];
        setText(currentText);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 30));

        if (journalEntry[i] === '.' && journalEntry[i + 1] === ' ') {
          await new Promise(resolve => setTimeout(resolve, 400));
        }

        if (i === Math.floor(journalEntry.length / 2)) {
          setFocusMode(true);
        }
      }

      setIsWriting(false);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowStats(true);
      await new Promise(resolve => setTimeout(resolve, 5000));
      setDemoComplete(true);
    };

    const timer = setTimeout(runDemo, 2000);
    return () => clearTimeout(timer);
  }, [demoComplete]);

  // Reset demo
  useEffect(() => {
    if (!demoComplete) return;

    const resetTimer = setTimeout(() => {
      setText("");
      setIsWriting(false);
      setFocusMode(false);
      setShowStats(false);
      setDemoComplete(false);
    }, 15000);

    return () => clearTimeout(resetTimer);
  }, [demoComplete]);

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15, duration: 0.8 }}
      >
        <Card className={`w-full max-w-3xl bg-white dark:bg-slate-900/60 shadow-xl rounded-xl border border-slate-200/70 dark:border-slate-800/50 overflow-hidden backdrop-blur-sm transition-all duration-300 ${focusMode ? 'max-w-4xl' : ''}`}>
          <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/80">
            <div className="flex items-center space-x-2">
              <motion.button 
                className={`text-xs py-1 px-2 rounded relative overflow-hidden ${focusMode ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
                whileTap={{ scale: 0.95 }}
                animate={focusMode ? { 
                  y: [0, -2, 0],
                  boxShadow: ["0px 0px 0px rgba(99,102,241,0)", "0px 0px 8px rgba(99,102,241,0.6)", "0px 0px 0px rgba(99,102,241,0)"] 
                } : {}}
                transition={focusMode ? { duration: 2, repeat: Infinity } : {}}
              >
                {focusMode && (
                  <motion.div 
                    className="absolute inset-0 bg-indigo-400/20" 
                    animate={{ opacity: [0, 0.8, 0], scale: [0.6, 1.2, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                )}
                <span className="relative z-10">Focus Mode</span>
              </motion.button>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button 
                className={`text-xs py-1 px-2 rounded ${focusMode ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
                whileTap={{ scale: 0.95 }}
              >
                Focus Mode
              </motion.button>
              <motion.button 
                className="text-xs py-1 px-2 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                whileTap={{ scale: 0.95 }}
              >
                Save
              </motion.button>
            </div>
          </div>

          <div className="p-6">
            <motion.p className="text-base leading-relaxed">
              {text}
              {isWriting && (
                <motion.span
                  className="inline-block w-0.5 h-5 bg-current ml-0.5"
                  animate={{ opacity: [0, 1, 0], height: ["16px", "20px", "16px"], backgroundColor: ["#333", "#6366F1", "#333"] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.p>

            <AnimatePresence>
              {showStats && (
                <motion.div 
                  className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Entry Analytics:</h3>
                  <div className="flex flex-wrap gap-4">
                    <motion.div 
                      className="bg-green-100 dark:bg-green-900/20 p-2 rounded text-xs text-green-800 dark:text-green-300 flex items-center"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className="font-medium">Mood:</span>
                      <span className="ml-1">Positive</span>
                    </motion.div>

                    <motion.div 
                      className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded text-xs text-blue-800 dark:text-blue-300 flex items-center"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span className="font-medium">Words:</span>
                      <span className="ml-1">{text.split(" ").length}</span>
                    </motion.div>

                    <motion.div 
                      className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded text-xs text-purple-800 dark:text-purple-300 flex items-center"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <span className="font-medium">Duration:</span>
                      <span className="ml-1">~{Math.floor(text.length / 25)}s</span>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>

      {focusMode && (
        <motion.div 
          className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0.5], scale: [0.95, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      )}
    </div>
  );
}
