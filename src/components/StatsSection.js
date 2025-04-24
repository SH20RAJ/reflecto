"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BookOpen, Users, Calendar, Star } from "lucide-react";

export default function StatsSection() {
  const [mounted, setMounted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  const [counts, setCounts] = useState({
    users: 0,
    entries: 0,
    reflections: 0,
    rating: 0,
  });
  
  const targetCounts = {
    users: 10000,
    entries: 500000,
    reflections: 2000000,
    rating: 4.9,
  };
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (isInView) {
      const duration = 2000; // ms
      const interval = 20; // ms
      const steps = duration / interval;
      
      let step = 0;
      
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setCounts({
          users: Math.floor(targetCounts.users * progress),
          entries: Math.floor(targetCounts.entries * progress),
          reflections: Math.floor(targetCounts.reflections * progress),
          rating: Number((targetCounts.rating * progress).toFixed(1)),
        });
        
        if (step >= steps) {
          clearInterval(timer);
          setCounts(targetCounts);
        }
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [isInView]);
  
  if (!mounted) {
    return null;
  }
  
  const stats = [
    {
      label: "Active Users",
      value: counts.users.toLocaleString(),
      icon: <Users className="h-6 w-6" />,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: "Journal Entries",
      value: counts.entries.toLocaleString(),
      icon: <BookOpen className="h-6 w-6" />,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    },
    {
      label: "Daily Reflections",
      value: counts.reflections.toLocaleString(),
      icon: <Calendar className="h-6 w-6" />,
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    },
    {
      label: "User Rating",
      value: counts.rating.toFixed(1) + "/5",
      icon: <Star className="h-6 w-6" />,
      color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    },
  ];
  
  return (
    <section className="py-24 bg-white dark:bg-black" ref={ref}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by thousands of reflective minds
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join our growing community of journalers who are transforming their lives through daily reflection
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <div className={`p-3 rounded-full mb-4 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-muted-foreground text-center">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
