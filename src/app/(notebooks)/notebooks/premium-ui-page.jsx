"use client";

import React from 'react';
import { motion } from 'framer-motion';
import PremiumDashboard from '@/components/PremiumDashboard';

export default function NotebooksPage() {
  return (
    <div className="h-full">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <PremiumDashboard />
      </motion.div>
    </div>
  );
}
