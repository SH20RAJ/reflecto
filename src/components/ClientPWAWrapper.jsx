"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import PWAManager with no SSR
const PWAManager = dynamic(() => import("./PWAManager"), { ssr: false });

export default function ClientPWAWrapper() {
    return <PWAManager />;
}
