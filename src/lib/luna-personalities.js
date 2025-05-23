"use client";

import { Smile, Sun, Cloud, Lightbulb, Coffee, Star, Music } from "lucide-react";
import React from "react";

/**
 * Luna's various personalities with styling and themed elements
 */
export const LUNA_PERSONALITIES = {
  friendly: {
    name: "Friendly",
    icon: <Smile className="h-5 w-5 text-yellow-400" />,
    color: "bg-gradient-to-br from-yellow-100 to-amber-50 dark:from-yellow-900/40 dark:to-amber-900/30",
    borderColor: "border-yellow-200 dark:border-yellow-900/60",
    textColor: "text-amber-800 dark:text-amber-300",
    greeting: "Hi there! I'm here to help you explore your notebooks. What would you like to know?",
    messageBg: "bg-yellow-50/80 dark:bg-yellow-900/20",
  },
  cheerful: {
    name: "Cheerful",
    icon: <Sun className="h-5 w-5 text-orange-400" />,
    color: "bg-gradient-to-br from-orange-100 to-yellow-50 dark:from-orange-900/40 dark:to-yellow-900/30",
    borderColor: "border-orange-200 dark:border-orange-800/60",
    textColor: "text-orange-800 dark:text-orange-300",
    greeting: "✨ Hello! I'm so excited to chat with you about your notebooks today! What can I help you discover?",
    messageBg: "bg-orange-50/80 dark:bg-orange-900/20",
  },
  calm: {
    name: "Calm",
    icon: <Cloud className="h-5 w-5 text-sky-400" />,
    color: "bg-gradient-to-br from-sky-100 to-blue-50 dark:from-sky-900/40 dark:to-blue-900/30",
    borderColor: "border-sky-200 dark:border-sky-800/60",
    textColor: "text-sky-800 dark:text-sky-300",
    greeting: "Welcome. I'm here to help you explore your thoughts and memories in a peaceful way. How can I assist you today?",
    messageBg: "bg-sky-50/80 dark:bg-sky-900/20",
  },
  thoughtful: {
    name: "Thoughtful",
    icon: <Lightbulb className="h-5 w-5 text-violet-400" />,
    color: "bg-gradient-to-br from-violet-100 to-purple-50 dark:from-violet-900/40 dark:to-purple-900/30", 
    borderColor: "border-violet-200 dark:border-violet-900/60",
    textColor: "text-violet-800 dark:text-violet-300",
    greeting: "I wonder what insights we might discover in your notes today? What are you curious about?",
    messageBg: "bg-violet-50/80 dark:bg-violet-900/20",
  },
  cozy: {
    name: "Cozy",
    icon: <Coffee className="h-5 w-5 text-amber-500" />,
    color: "bg-gradient-to-br from-amber-100 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/30",
    borderColor: "border-amber-200 dark:border-amber-900/60",
    textColor: "text-amber-800 dark:text-amber-300",
    greeting: "Make yourself comfortable! I'm here to help you explore your notebooks in a relaxed way. What would you like to chat about?",
    messageBg: "bg-amber-50/80 dark:bg-amber-900/20",
  },
  insightful: {
    name: "Insightful",
    icon: <Star className="h-5 w-5 text-indigo-400" />,
    color: "bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-900/40 dark:to-blue-900/30",
    borderColor: "border-indigo-200 dark:border-indigo-800/60", 
    textColor: "text-indigo-800 dark:text-indigo-300",
    greeting: "I'm ready to help you uncover patterns and connections in your notebooks. What would you like to explore?",
    messageBg: "bg-indigo-50/80 dark:bg-indigo-900/20",
  },
  playful: {
    name: "Playful",
    icon: <Music className="h-5 w-5 text-pink-400" />,
    color: "bg-gradient-to-br from-pink-100 to-rose-50 dark:from-pink-900/40 dark:to-rose-900/30",
    borderColor: "border-pink-200 dark:border-pink-800/60",
    textColor: "text-pink-800 dark:text-pink-300",
    greeting: "Hey there! 🎵 Ready for a fun exploration of your notebooks? What shall we discover today?",
    messageBg: "bg-pink-50/80 dark:bg-pink-900/20",
  }
};

/**
 * Sample questions for Luna chat interface
 */
export const SAMPLE_QUESTIONS = [
    // Entry and date finding questions
    "When did I first mention Sarah in my notebooks?",
    "Show me entries where I talked about my job interview",
    "What photos did I take during my vacation last summer?",
    "Find entries where I felt happy in January",
    "When was the last time I wrote about my goals?",
    
    // Conversational and emotional questions
    "I'm feeling bored, can you talk to me?",
    "I've had a rough day, could you cheer me up?",
    "Tell me something interesting about journaling",
    "Can we just chat for a bit?",
    "I need some motivation today",
    
    // Advice and reflection questions
    "What should I write about today?",
    "Help me reflect on my recent entries",
    "I'm feeling stuck with my writing, any suggestions?",
    "Can you summarize how my mood has changed this month?",
    "What patterns do you notice in my journal entries?",
    
    // Original queries
    "Show me all entries with photos from December 2024",
    "What did I write on my birthday last year?",
    "Find entries where I mentioned meeting my girlfriend for the first time",
    "Show me all photos I took on the first Saturday of January 2025",
    "What was I feeling on New Year's Eve?",
    "Find entries where I talked about my career plans",
    "When did I last update my fitness goals?",
];

/**
 * Get a random personality for initial load
 */
export function getRandomPersonality() {
  const personalities = Object.keys(LUNA_PERSONALITIES);
  return personalities[Math.floor(Math.random() * personalities.length)];
}

/**
 * Determine a contextually appropriate mood based on the content and user's message
 */
export function determineMood(currentPersonality, message, entries, userMessage) {
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
}
