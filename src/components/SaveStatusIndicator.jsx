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
import { toast } from "sonner";

/**
 * Save Status Indicator Component
 * Shows real-time save status with progress indication and retry functionality
 */
export default function SaveStatusIndicator({ Status
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
  }, []);

  const getStatusConfig = () => {
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
  };

  const formatLastSaved = (timestamp) => {
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

  const IconComponent = statusConfig.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor} ${className}`}
      >
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
      </motion.div>
    </AnimatePresence>
  );
}

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
  Wifi, 
  WifiOff, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Save Status Indicator Component
 * Shows real-time save status with user-friendly messages
 */
export default function SaveStatusIndicator({
  isSaving = false,
  lastSaved = null,
  hasUnsavedChanges = false,
  saveError = null,
  isOnline = true,
  onRetry = () => {},
  className = '',
  position = 'fixed', // 'fixed', 'relative', 'absolute'
  compact = false,
}) {
  const [showStatus, setShowStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('idle'); // 'idle', 'saving', 'saved', 'error', 'offline'

  // Update status based on props
  useEffect(() => {
    if (!isOnline) {
      setStatusType('offline');
      setStatusMessage('Offline - changes will be saved when reconnected');
      setShowStatus(true);
    } else if (isSaving) {
      setStatusType('saving');
      setStatusMessage('Saving...');
      setShowStatus(true);
    } else if (saveError) {
      setStatusType('error');
      setStatusMessage(saveError.message || 'Failed to save');
      setShowStatus(true);
    } else if (lastSaved && !hasUnsavedChanges) {
      setStatusType('saved');
      setStatusMessage(formatLastSaved(lastSaved));
      setShowStatus(true);
      
      // Auto-hide after 3 seconds if no changes
      const timer = setTimeout(() => {
        if (!hasUnsavedChanges && !isSaving) {
          setShowStatus(false);
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    } else if (hasUnsavedChanges && !isSaving) {
      setStatusType('unsaved');
      setStatusMessage('Unsaved changes');
      setShowStatus(true);
    } else {
      setShowStatus(false);
    }
  }, [isSaving, lastSaved, hasUnsavedChanges, saveError, isOnline]);

  // Format last saved time
  function formatLastSaved(date) {
    if (!date) return '';
    
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds
    
    if (diff < 5) return 'Saved just now';
    if (diff < 60) return `Saved ${diff}s ago`;
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `Saved ${Math.floor(diff / 3600)}h ago`;
    
    return `Saved on ${date.toLocaleDateString()}`;
  }

  // Get status icon and styling
  function getStatusConfig() {
    switch (statusType) {
      case 'saving':
        return {
          icon: Loader2,
          iconProps: { className: 'animate-spin' },
          variant: 'secondary',
          bgColor: 'bg-blue-50 dark:bg-blue-950',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-700 dark:text-blue-300',
        };
      case 'saved':
        return {
          icon: Check,
          variant: 'secondary',
          bgColor: 'bg-green-50 dark:bg-green-950',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-700 dark:text-green-300',
        };
      case 'error':
        return {
          icon: X,
          variant: 'destructive',
          bgColor: 'bg-red-50 dark:bg-red-950',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-700 dark:text-red-300',
        };
      case 'offline':
        return {
          icon: WifiOff,
          variant: 'secondary',
          bgColor: 'bg-orange-50 dark:bg-orange-950',
          borderColor: 'border-orange-200 dark:border-orange-800',
          textColor: 'text-orange-700 dark:text-orange-300',
        };
      case 'unsaved':
        return {
          icon: Clock,
          variant: 'outline',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-700 dark:text-yellow-300',
        };
      default:
        return {
          icon: Save,
          variant: 'outline',
          bgColor: 'bg-muted',
          borderColor: 'border-border',
          textColor: 'text-muted-foreground',
        };
    }
  }

  const config = getStatusConfig();
  const IconComponent = config.icon;

  if (!showStatus) return null;

  const positionClasses = {
    fixed: 'fixed bottom-4 right-4 z-50',
    relative: 'relative',
    absolute: 'absolute bottom-4 right-4',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        className={cn(
          positionClasses[position],
          config.bgColor,
          config.borderColor,
          'border rounded-lg shadow-lg backdrop-blur-sm',
          compact ? 'p-2' : 'p-3',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <IconComponent 
            size={compact ? 14 : 16} 
            className={cn(config.textColor, config.iconProps?.className)}
          />
          
          {!compact && (
            <span className={cn('text-sm font-medium', config.textColor)}>
              {statusMessage}
            </span>
          )}
          
          {/* Retry button for errors */}
          {statusType === 'error' && onRetry && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 ml-1"
              onClick={onRetry}
            >
              Retry
            </Button>
          )}
          
          {/* Network status indicator */}
          {statusType !== 'offline' && (
            <div className="flex items-center">
              {isOnline ? (
                <Wifi size={12} className="text-green-500" />
              ) : (
                <WifiOff size={12} className="text-red-500" />
              )}
            </div>
          )}
        </div>
        
        {/* Progress bar for saving */}
        {statusType === 'saving' && (
          <motion.div
            className="mt-2 h-1 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
          >
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
