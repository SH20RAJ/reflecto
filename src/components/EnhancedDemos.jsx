"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot } from "lucide-react";
import LunaChatDemo from "@/components/LunaChatDemo";
import JournalingDemo from "@/components/JournalingDemo";

export default function EnhancedDemos() {
  const [activeTab, setActiveTab] = useState("chat");
  
  const tabVariants = {
    inactive: { opacity: 0.7 },
    active: { 
      opacity: 1,
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  };
  
  const contentVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.96 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.7 
      } 
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.96,
      transition: {
        duration: 0.3
      }
    }
  };
  
  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-400">
            Experience Reflecto in Action
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            See how our intelligent journaling platform helps you capture thoughts and gain insights.
          </p>
        </div>
        
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div 
            className="inline-flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-full relative overflow-hidden"
            whileHover={{ boxShadow: "0px 4px 12px rgba(99, 102, 241, 0.15)" }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10"
              animate={{ 
                x: ["-100%", "100%"],
                opacity: [0.2, 0.3, 0.2]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: "mirror"
              }}
            />
            <motion.button
              className={`px-6 py-2 rounded-full text-sm font-medium relative ${activeTab === "chat" ? "bg-white dark:bg-slate-900 shadow-sm" : ""}`}
              variants={tabVariants}
              animate={activeTab === "chat" ? "active" : "inactive"}
              onClick={() => setActiveTab("chat")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              {activeTab === "chat" && (
                <motion.div 
                  className="absolute inset-0 rounded-full"
                  layoutId="activeTab"
                  initial={false}
                  transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                />
              )}
              <span className="relative z-10">Luna Chat</span>
            </motion.button>
            <motion.button
              className={`px-6 py-2 rounded-full text-sm font-medium relative ${activeTab === "journal" ? "bg-white dark:bg-slate-900 shadow-sm" : ""}`}
              variants={tabVariants}
              animate={activeTab === "journal" ? "active" : "inactive"}
              onClick={() => setActiveTab("journal")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              {activeTab === "journal" && (
                <motion.div 
                  className="absolute inset-0 rounded-full"
                  layoutId="activeTab"
                  initial={false}
                  transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                />
              )}
              <span className="relative z-10">Journaling</span>
            </motion.button>
          </motion.div>
        </motion.div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={contentVariants}
            className="flex justify-center"
          >
            {activeTab === "chat" ? (
              <div className="w-full max-w-2xl">
                <LunaChatDemo />
              </div>
            ) : (
              <div className="w-full max-w-3xl">
                <JournalingDemo />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <motion.div 
            className="inline-block relative overflow-hidden group"
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-80 blur-[3px] group-hover:opacity-100"
              animate={{
                opacity: [0.7, 0.9, 0.7],
                scale: [0.98, 1.01, 0.98]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: "mirror"
              }}
            />
            <a 
              href="/auth/signin" 
              className="relative bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-10 py-3.5 rounded-full text-lg font-medium shadow-md flex items-center space-x-3 transition-all"
            >
              <span>Try Reflecto Free</span>
              <motion.svg 
                className="h-5 w-5" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                animate={{ 
                  x: [0, 6, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  repeatDelay: 1.5 
                }}
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </motion.svg>
            </a>
          </motion.div>
          <motion.p 
            className="mt-4 text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            No credit card required. Premium features to explore your thoughts.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
