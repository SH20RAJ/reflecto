"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Pencil, Search, Sparkles, BarChart } from "lucide-react";

export default function EnhancedHowItWorks() {
  const [mounted, setMounted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const steps = [
    {
      title: "Write Daily",
      description: "Take a few minutes each day to jot down your thoughts, experiences, and reflections in your digital journal.",
      icon: <Pencil className="h-6 w-6" />,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      title: "Organize & Search",
      description: "Easily find past entries with powerful search and organization tools. Filter by date, tags, or content.",
      icon: <Search className="h-6 w-6" />,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    },
    {
      title: "Get Insights",
      description: "Our AI analyzes your entries to identify patterns, mood trends, and recurring themes in your reflections.",
      icon: <Sparkles className="h-6 w-6" />,
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    },
    {
      title: "Track Growth",
      description: "Visualize your personal growth over time with weekly and monthly summaries of your reflection journey.",
      icon: <BarChart className="h-6 w-6" />,
      color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gray-50 dark:bg-gray-900" ref={ref}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How Reflecto Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A simple four-step process to transform your daily reflections into meaningful insights
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line */}
          <div className="absolute top-24 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 hidden lg:block" />
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.15 * index }}
            >
              <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center mb-6`}>
                {step.icon}
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full w-full">
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
              
              {/* Step number */}
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
