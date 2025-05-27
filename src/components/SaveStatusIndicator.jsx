"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  Check, 
  X, 
  Loader2,
  Wifi,
  WifiOff,
  RefreshCw 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

/**
 * Save Status Indicator Component
 * Shows real-time save status with progress indication and retry functionality
 */
export default function SaveStatusIndicator({ 
  saveStatus = 'idle', // 'idle' | 'saving' | 'saved' | 'error' | 'offline'
  lastSaved = null,
  onRetry = null,
  className = "",
  showDetails = true,
  autoHide = true,
  hideDelay = 3000
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    // Show indicator when status changes
    if (saveStatus !== 'idle') {
      setIsVisible(true);
    }
    // Auto-hide successful saves
    if (autoHide && saveStatus === 'saved') {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);
      return () => clearTimeout(timer);
    }
    // Keep error states visible
    if (saveStatus === 'error' || saveStatus === 'offline') {
      setIsVisible(true);
    }
    
    // Simulate progress for saving state
    if (saveStatus === 'saving') {
      setProgressValue(0);
      const interval = setInterval(() => {
        setProgressValue(prev => {
          const newValue = prev + (100 - prev) * 0.1;
          return newValue > 90 ? 90 : newValue;
        });
      }, 200);
      return () => clearInterval(interval);
    } else if (saveStatus === 'saved') {
      setProgressValue(100);
    }
  }, [saveStatus, autoHide, hideDelay]);

  useEffect(() => {
    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial state
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);  const getStatusConfig = () => {
    switch (saveStatus) {
      case 'saving':
        return {
          icon: Loader2,
          text: 'Saving...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          animate: true
        };
      case 'saved':
        return {
          icon: Check,
          text: 'Saved',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          animate: false
        };
      case 'error':
        return {
          icon: X,
          text: 'Save failed',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          animate: false
        };
      case 'offline':
        return {
          icon: WifiOff,
          text: 'Offline',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          animate: false
        };
      default:
        return null;
    }
  };  const formatLastSaved = (timestamp) => {
    if (!timestamp) return null;
    
    const now = new Date();
    const saved = new Date(timestamp);
    const diffMs = now - saved;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return saved.toLocaleDateString();
  };

  const statusConfig = getStatusConfig();

  if (!statusConfig || !isVisible) {
    return null;
  }

  const IconComponent = statusConfig.icon;  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        className={`inline-flex flex-col gap-1 px-3 py-2 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor} ${className}`}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <IconComponent 
              className={`h-4 w-4 ${statusConfig.color} ${statusConfig.animate ? 'animate-spin' : ''}`}
            />
            <span className={`text-sm font-medium ${statusConfig.color}`}>
              {statusConfig.text}
            </span>
          </div>
          
          {/* Network status indicator */}
          <div className="flex items-center gap-1">
            {isOnline ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-500" />
            )}
          </div>
          
          {/* Last saved time */}
          {showDetails && lastSaved && saveStatus === 'saved' && (
            <span className="text-xs text-gray-500">
              {formatLastSaved(lastSaved)}
            </span>
          )}
          
          {/* Retry button for errors */}
          {saveStatus === 'error' && onRetry && (
            <Button
              onClick={onRetry}
              variant="ghost"
              size="sm"
              className="h-6 px-2 py-0 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
        
        {/* Progress bar for saving state */}
        {saveStatus === 'saving' && (
          <Progress 
            value={progressValue}
            className="h-1 w-full bg-blue-100"
          />
        )}
      </motion.div>
    </AnimatePresence>
  );}

/**
 * Hook for managing save status state
 */
export function useSaveStatus() {
  const [saveStatus, setSaveStatus] = useState('idle');
  const [lastSaved, setLastSaved] = useState(null);

  const startSaving = () => {
    setSaveStatus('saving');
  };

  const markSaved = () => {
    setSaveStatus('saved');
    setLastSaved(new Date().toISOString());
  };

  const markError = () => {
    setSaveStatus('error');
  };

  const markOffline = () => {
    setSaveStatus('offline');
  };

  const reset = () => {
    setSaveStatus('idle');
  };

  return {
    saveStatus,
    lastSaved,
    startSaving,
    markSaved,
    markError,
    markOffline,
    reset
  };
}