"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Loader2, Volume2, VolumeX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/**
 * Reusable Speech-to-Text Component
 * Provides comprehensive speech recognition with error handling and UI feedback
 **/
export default function STTComponent({ 
  onTranscriptChange, 
  onFinalTranscript,
  className = "",
  showConfidence = false,
  autoStart = false 
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Check browser support
    const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setIsSupported(supported);
    
    if (supported) {
      checkMicrophonePermission();
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (autoStart && isSupported && hasPermission === true) {
      startListening();
    }
  }, [autoStart, isSupported, hasPermission]);

  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' });
      setHasPermission(result.state === 'granted');
      
      result.addEventListener('change', () => {
        setHasPermission(result.state === 'granted');
      });
    } catch (error) {
      // Fallback for browsers that don't support permissions API
      setHasPermission(null);
    }
  };

  const initializeRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      setIsLoading(false);
      setIsListening(true);
      toast.success("Voice recording started", {
        description: "Speak clearly into your microphone",
        duration: 2000
      });
    };
    
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalText = '';
      let maxConfidence = 0;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence || 0;
        
        if (event.results[i].isFinal) {
          finalText += transcript + ' ';
          maxConfidence = Math.max(maxConfidence, confidence);
        } else {
          interimTranscript += transcript;
        }
      }
      
      setTranscript(interimTranscript);
      setConfidence(maxConfidence);
      
      if (finalText) {
        setFinalTranscript(prev => prev + finalText);
        if (onFinalTranscript) {
          onFinalTranscript(finalText.trim());
        }
      }
      
      if (onTranscriptChange) {
        onTranscriptChange(interimTranscript + finalText);
      }
    };
    
    recognition.onerror = (event) => {
      setIsLoading(false);
      setIsListening(false);
      
      let errorMessage = "Voice recognition error occurred";
      let description = "";
      
      switch (event.error) {
        case 'network':
          errorMessage = "Network connection failed";
          description = "Please check your internet connection and try again";
          break;
        case 'not-allowed':
          errorMessage = "Microphone access denied";
          description = "Please allow microphone access in your browser settings";
          setHasPermission(false);
          break;
        case 'audio-capture':
          errorMessage = "No microphone detected";
          description = "Please connect a microphone and try again";
          break;
        case 'no-speech':
          errorMessage = "No speech detected";
          description = "Please speak louder or check your microphone";
          break;
        case 'aborted':
          return; // Don't show error for intentional stops
        default:
          description = `Error: ${event.error}`;
      }
      
      toast.error(errorMessage, {
        description,
        duration: 4000
      });
    };
    
    recognition.onend = () => {
      setIsLoading(false);
      setIsListening(false);
      
      // Auto-restart if it was listening and stopped unexpectedly
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    
    return recognition;
  }, [onTranscriptChange, onFinalTranscript]);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      toast.error("Speech recognition not supported", {
        description: "Please use Chrome, Edge, or Safari for voice features",
        duration: 4000
      });
      return;
    }
    
    if (hasPermission === false) {
      toast.error("Microphone access required", {
        description: "Please allow microphone access in your browser settings",
        duration: 4000
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      recognitionRef.current = initializeRecognition();
      recognitionRef.current.start();
      
      // Timeout for loading state
      timeoutRef.current = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          toast.error("Failed to start voice recognition", {
            description: "Please try again or check your microphone",
            duration: 3000
          });
        }
      }, 5000);
      
    } catch (error) {
      setIsLoading(false);
      toast.error("Failed to start voice recognition", {
        description: error.message || "An unexpected error occurred",
        duration: 4000
      });
    }
  }, [isSupported, hasPermission, isLoading, initializeRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsListening(false);
    setIsLoading(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening || isLoading) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, isLoading, startListening, stopListening]);

  const clearTranscript = useCallback(() => {
    setTranscript("");
    setFinalTranscript("");
    setConfidence(0);
  }, []);

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg ${className}`}>
        <VolumeX className="h-4 w-4 text-amber-600" />
        <span className="text-sm text-amber-800">
          Voice features not available in this browser
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Button
          onClick={toggleListening}
          disabled={hasPermission === false}
          variant={isListening ? "destructive" : "default"}
          size="sm"
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
          {isLoading ? "Starting..." : isListening ? "Stop" : "Start Recording"}
        </Button>
        
        {(transcript || finalTranscript) && (
          <Button
            onClick={clearTranscript}
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
        
        {showConfidence && confidence > 0 && (
          <Badge variant="secondary" className="text-xs">
            {Math.round(confidence * 100)}% confident
          </Badge>
        )}
      </div>
      
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-red-800 font-medium">Recording...</span>
            </div>
            <Volume2 className="h-4 w-4 text-red-600" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {(transcript || finalTranscript) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-gray-50 border rounded-lg"
        >
          <div className="text-sm">
            {finalTranscript && (
              <span className="text-gray-900">{finalTranscript}</span>
            )}
            {transcript && (
              <span className="text-gray-500 italic">{transcript}</span>
            )}
          </div>
        </motion.div>
      )}
      
      {hasPermission === false && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <VolumeX className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800">
              Microphone access is required for voice features
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function STTComponent({
  onTranscript = () => {},
  onStart = () => {},
  onStop = () => {},
  onError = () => {},
  className = '',
  size = 'default', // 'sm', 'default', 'lg'
  variant = 'default', // 'default', 'outline', 'ghost'
  language = 'en-US',
  continuous = true,
  interimResults = true,
  autoStart = false,
  showStatus = true,
  showTranscript = false,
  maxTranscriptLength = 500,
}) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'granted', 'denied', 'prompt'
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  
  const recognitionRef = useRef(null);
  const lastProcessedIndex = useRef(0);
  const isInitializedRef = useRef(false);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined' || isInitializedRef.current) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    // Event handlers
    recognition.onstart = () => {
      setIsListening(true);
      setIsProcessing(false);
      setErrorCount(0);
      lastProcessedIndex.current = 0;
      onStart();
      
      // Haptic feedback for mobile
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
      onStop();
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
    };

    recognition.onresult = (event) => {
      setIsProcessing(true);
      
      try {
        const results = Array.from(event.results);
        const newResults = results.slice(lastProcessedIndex.current);
        
        // Process interim and final results
        const interimTranscript = newResults
          .filter(result => !result.isFinal)
          .map(result => result[0].transcript)
          .join(' ');
          
        const finalTranscript = newResults
          .filter(result => result.isFinal)
          .map(result => result[0].transcript)
          .join(' ');

        // Update current transcript for display
        if (showTranscript) {
          setCurrentTranscript(finalTranscript || interimTranscript);
        }

        // Update confidence score
        const lastResult = results[results.length - 1];
        if (lastResult && lastResult[0]) {
          setConfidence(Math.round(lastResult[0].confidence * 100) || 85);
        }

        // Send final results to parent
        if (finalTranscript) {
          onTranscript(finalTranscript.trim());
          lastProcessedIndex.current = results.length;
          
          // Clear current transcript after processing
          if (showTranscript) {
            setTimeout(() => setCurrentTranscript(''), 1000);
          }
        } else if (interimResults && interimTranscript) {
          // Send interim results if enabled
          onTranscript(interimTranscript.trim(), true);
        }
      } catch (error) {
        console.error('Error processing speech results:', error);
        onError(error);
      }
      
      setTimeout(() => setIsProcessing(false), 300);
    };

    recognition.onerror = (event) => {
      console.warn(`Speech recognition error: ${event.error}`);
      setIsListening(false);
      setIsProcessing(false);
      
      const newErrorCount = errorCount + 1;
      setErrorCount(newErrorCount);
      
      let shouldShowToast = true;
      let errorMessage = 'Speech recognition error';
      
      switch (event.error) {
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          shouldShowToast = newErrorCount <= 2; // Don't spam network errors
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please enable microphone permissions.';
          setPermissionStatus('denied');
          setIsSupported(false);
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking again.';
          shouldShowToast = false; // Don't show toast for no speech
          break;
        case 'audio-capture':
          errorMessage = 'Microphone unavailable. Please check if another app is using it.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service not allowed.';
          setIsSupported(false);
          break;
        case 'aborted':
          shouldShowToast = false; // User cancelled
          break;
        case 'language-not-supported':
          errorMessage = `Language "${language}" not supported.`;
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      if (shouldShowToast) {
        toast.error(errorMessage, { duration: 4000 });
      }
      
      onError({ error: event.error, message: errorMessage });
      
      // Haptic feedback for errors
      if (navigator.vibrate && event.error !== 'no-speech') {
        navigator.vibrate([100, 50, 100]);
      }
    };

    recognitionRef.current = recognition;
    isInitializedRef.current = true;

    // Auto-start if requested
    if (autoStart && isSupported) {
      startListening();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, continuous, interimResults, autoStart]);

  // Check microphone permissions
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' })
        .then(result => {
          setPermissionStatus(result.state);
          result.addEventListener('change', () => {
            setPermissionStatus(result.state);
          });
        })
        .catch(console.warn);
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      toast.error('Speech recognition not supported');
      return;
    }

    if (permissionStatus === 'denied') {
      toast.error('Microphone access denied. Please enable permissions in your browser settings.');
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (error) {
      if (error.name === 'InvalidStateError') {
        // Already running, stop and restart
        recognitionRef.current.stop();
        setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Failed to restart:', e);
            toast.error('Failed to start speech recognition');
          }
        }, 100);
      } else {
        console.error('Failed to start recognition:', error);
        toast.error('Failed to start speech recognition');
      }
    }
  }, [isSupported, permissionStatus]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 14,
    default: 18,
    lg: 22,
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Main button */}
      <Button
        variant={isListening ? "destructive" : variant}
        size="icon"
        className={`${sizeClasses[size]} transition-all duration-200 ${
          isListening ? 'animate-pulse shadow-lg' : ''
        }`}
        onClick={toggleListening}
        disabled={isProcessing || permissionStatus === 'denied'}
      >
        {isProcessing ? (
          <Loader2 className={`h-${iconSizes[size]} w-${iconSizes[size]} animate-spin`} />
        ) : isListening ? (
          <MicOff size={iconSizes[size]} />
        ) : (
          <Mic size={iconSizes[size]} />
        )}
      </Button>

      {/* Status indicators */}
      <AnimatePresence>
        {showStatus && isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center gap-1"
          >
            <Badge variant="secondary" className="text-xs">
              <motion.div
                className="w-2 h-2 rounded-full bg-red-500 mr-1"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              Listening...
            </Badge>
            
            {confidence > 0 && (
              <div className="text-xs text-muted-foreground">
                {confidence}% confident
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript display */}
      <AnimatePresence>
        {showTranscript && currentTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-xs p-2 bg-secondary rounded-lg text-sm"
          >
            {currentTranscript.length > maxTranscriptLength
              ? `${currentTranscript.substring(0, maxTranscriptLength)}...`
              : currentTranscript
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
