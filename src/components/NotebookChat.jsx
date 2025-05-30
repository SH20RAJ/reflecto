"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { LUNA_PERSONALITIES, SAMPLE_QUESTIONS } from "@/lib/luna-personalities";
import { format } from "date-fns";
import { motion } from "framer-motion";

// Import modular components
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput, SampleQuestions } from "@/components/chat/chat-input";
import { LunaMessage, UserMessage } from "@/components/chat/messages";

/**
 * LoadingMessage component for displaying a loading state while waiting for Luna's response
 */
function LoadingMessage() {
  return (
    <div className="flex justify-start">
      <div className="flex items-start gap-3 max-w-[80%]">
        <Avatar className="bg-muted">
          <AvatarFallback>
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px] rounded-lg" />
          <Skeleton className="h-4 w-[200px] rounded-lg" />
          <Skeleton className="h-4 w-[170px] rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * NotebookChat - Main chat component for interacting with notebooks
 * Uses modular components for better maintainability
 */
export default function NotebookChat() {
  const { data: session } = useSession();
  const messagesEndRef = useRef(null);
  
  // Get a random personality for initial load
  const getRandomPersonality = () => {
    const personalities = Object.keys(LUNA_PERSONALITIES);
    return personalities[Math.floor(Math.random() * personalities.length)];
  };
  
  // State management
  const initialPersonality = getRandomPersonality();
  const [currentPersonality, setCurrentPersonality] = useState(initialPersonality);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: LUNA_PERSONALITIES[initialPersonality].greeting || 
        "✨ Hi there! I'm Luna, your magical notebook companion! I'm here to help you explore your memories, discover patterns in your thoughts, or just be a friendly ear when you need someone to talk to. What's on your mind today? You can ask me about your entries, share how you're feeling, or we can just chat about your day! 💫",
      mood: initialPersonality,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const [lastErrorTime, setLastErrorTime] = useState(null);
  const [showMoodSelector, setShowMoodSelector] = useState(false);

  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    isActive: false
  });
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      const scrollContainer = messagesEndRef.current.parentNode.parentNode;
      
      // Force layout recalculation to ensure accurate heights
      setTimeout(() => {
        // Using both methods to ensure scroll works consistently
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        
        // Manually scroll to bottom as a fallback
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }, 150); // Slightly longer delay to ensure content is fully rendered
    }
  }, [messages]);

  // Randomly select 3 sample questions
  useEffect(() => {
    const randomQuestions = [...SAMPLE_QUESTIONS]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    setSelectedQuestions(randomQuestions);
  }, []);

  // Handle sending a message
  const handleSend = async (userMessage) => {
    if (!userMessage.trim()) return;

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);

    // Show loading state
    setIsLoading(true);

    try {
      // Prepare request body with message and date range if active
      const requestBody = { message: userMessage };

      if (dateRange.isActive) {
        requestBody.dateRange = {
          startDate: dateRange.startDate ? dateRange.startDate.toISOString() : null,
          endDate: dateRange.endDate ? dateRange.endDate.toISOString() : null
        };
      }

      // Call API to get response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      // Format date for display if available
      const formattedDateRange = dateRange.isActive ? {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      } : null;

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          entries: data.entries || [],
          dateRange: formattedDateRange,
          query: data.query,
          usedFallback: data.usedFallback,
          mood: determineMood(data.message, data.entries || [], userMessage)
        },
      ]);
      
      // Reset error tracking on successful request
      setErrorCount(0);
      setLastErrorTime(null);
    } catch (error) {
      console.error("Error in chat:", error);
      
      // Error tracking logic
      const now = new Date();
      if (lastErrorTime && (now - lastErrorTime) < 60000) {
        setErrorCount(prev => prev + 1);
      } else {
        setErrorCount(1);
      }
      setLastErrorTime(now);
      
      // Different error messages based on error count
      let errorMessage = "Sorry, I encountered an error while searching your notebooks. Please try again.";
      if (errorCount >= 2) {
        errorMessage = "I'm having trouble connecting to the server. This might be a temporary issue. You could try refreshing the page or coming back later.";
      }
      if (errorCount >= 3) {
        errorMessage = "We're experiencing technical difficulties. Please try refreshing the page or clearing your browser cache. If problems persist, please contact support.";
      }
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
          isError: true,
          mood: 'calm' // Using calm mood for errors to be reassuring
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle date range changes
  const handleDateRangeChange = (type, date) => {
    setDateRange(prev => ({
      ...prev,
      [type]: date
    }));
  };

  // Toggle date range filter
  const toggleDateRangeFilter = () => {
    setDateRange(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));

    // Add system message about date range change
    const wasActive = dateRange.isActive;
    if (!wasActive && (dateRange.startDate || dateRange.endDate)) {
      const startDateStr = dateRange.startDate ? format(dateRange.startDate, 'PPP') : 'the beginning';
      const endDateStr = dateRange.endDate ? format(dateRange.endDate, 'PPP') : 'today';

      setMessages(prev => [
        ...prev,
        {
          role: "system",
          content: `Date range filter activated. I'll only search notebooks from ${startDateStr} to ${endDateStr}.`
        }
      ]);
    } else if (wasActive) {
      setMessages(prev => [
        ...prev,
        {
          role: "system",
          content: "Date range filter deactivated. I'll search all your notebooks."
        }
      ]);
    }
  };

  // Clear date range
  const clearDateRange = () => {
    setDateRange({
      startDate: null,
      endDate: null,
      isActive: false
    });

    setMessages(prev => [
      ...prev,
      {
        role: "system",
        content: "Date range filter cleared. I'll search all your notebooks."
      }
    ]);
  };
  
  // Handle personality change
  const handlePersonalityChange = (personalityKey) => {
    setCurrentPersonality(personalityKey);
    setShowMoodSelector(false);
    setMessages(prev => [...prev, {
      role: "system",
      content: `Luna's mood has changed to ${LUNA_PERSONALITIES[personalityKey].name.split(" ")[0]}. How can I help you today?`,
      mood: personalityKey
    }]);
  };

  // Determine Luna's mood based on content and user input
  const determineMood = (message, entries, userMessage) => {
    // Default to user's preferred personality if they've selected one
    if (currentPersonality) {
      // 60% chance to stay with selected personality for consistency
      if (Math.random() < 0.6) {
        return currentPersonality;
      }
    }
    
    // Check for emotional keywords in user message to match mood
    const userMessageLower = userMessage.toLowerCase();
    
    if (/\b(happy|joy|excite|celebrate|good news|yay|hurray)\b/i.test(userMessageLower)) {
      return 'cheerful';
    }
    
    if (/\b(sad|upset|depressed|worried|anxious|stress)\b/i.test(userMessageLower)) {
      return 'calm'; // Calm and reassuring for emotional support
    }
    
    if (/\b(think|wonder|curious|question|ponder|reflect)\b/i.test(userMessageLower)) {
      return 'thoughtful';
    }
    
    if (/\b(relax|home|comfort|chill|rest|cozy)\b/i.test(userMessageLower)) {
      return 'cozy';
    }
    
    if (/\b(play|fun|game|joke|entertain|amuse)\b/i.test(userMessageLower)) {
      return 'playful';
    }
    
    // Content-based mood selection
    if (entries && entries.length > 3) {
      return Math.random() > 0.5 ? 'insightful' : 'thoughtful';
    }
    
    if (!entries || entries.length === 0) {
      return Math.random() > 0.5 ? 'friendly' : 'calm';
    }
    
    // Variability for natural conversation flow
    const moods = ['cheerful', 'cozy', 'playful', 'thoughtful', 'friendly'];
    return moods[Math.floor(Math.random() * moods.length)];
  };

  // Render the component
  return (
    <Card className="w-full h-full flex flex-col border-0 shadow-lg rounded-xl">
      <ChatHeader 
        currentPersonality={currentPersonality}
        dateRange={dateRange}
        showDateFilter={showDateFilter}
        setShowDateFilter={setShowDateFilter}
        showMoodSelector={showMoodSelector}
        setShowMoodSelector={setShowMoodSelector}
        handleDateRangeChange={handleDateRangeChange}
        toggleDateRangeFilter={toggleDateRangeFilter}
        clearDateRange={clearDateRange}
        handlePersonalityChange={handlePersonalityChange}
      />

      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-50 dark:from-slate-900/30 to-white dark:to-slate-950">
        <div className="space-y-6 pb-4 max-w-3xl mx-auto">
          {messages.map((message, index) => {
            if (message.role === "user") {
              return <UserMessage 
                key={index} 
                message={message} 
                avatarUrl={session?.user?.image}
                userName={session?.user?.name}
              />;
            } else if (message.role === "system") {
              return <LunaMessage key={index} message={{...message, role: "system"}} />;
            } else {
              return <LunaMessage key={index} message={message} />;
            }
          })}

          {isLoading && <LoadingMessage />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {selectedQuestions.length > 0 && (
        <SampleQuestions 
          questions={selectedQuestions}
          onSelect={handleSend}
        />
      )}

      <ChatInput 
        onSend={handleSend} 
        loading={isLoading}
        currentPersonality={currentPersonality}
        dateRangeActive={dateRange.isActive}
        className="p-5 pt-3 border-t bg-gradient-to-r from-indigo-50/30 to-purple-50/30 dark:from-indigo-950/30 dark:to-purple-950/30"
      />
    </Card>
  );
}