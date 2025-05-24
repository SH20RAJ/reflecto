"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function LunaChatDemo() {
  const [chatState, setChatState] = useState("idle"); // idle, typing, loading, responding
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi there! I'm Luna, your AI journaling companion. Ask me anything about your entries or how I can help you reflect.",
      mood: "cheerful",
    }
  ]);
  const [typingText, setTypingText] = useState("");
  const [demoComplete, setDemoComplete] = useState(false);

  // Demo flow
  useEffect(() => {
    if (demoComplete) return;

    const runDemo = async () => {
      // Start typing user message
      setChatState("typing");
      
      const userMessage = "How have I been feeling this month?";
      let currentText = "";
      
      // Simulate typing
      for (let i = 0; i < userMessage.length; i++) {
        currentText += userMessage[i];
        setTypingText(currentText);
        await new Promise(resolve => setTimeout(resolve, 80));
      }
      
      // Add user message to chat
      await new Promise(resolve => setTimeout(resolve, 500));
      setMessages(prev => [...prev, { role: "user", content: userMessage }]);
      setTypingText("");
      
      // Show loading state
      setChatState("loading");
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show Luna's response
      setChatState("responding");
      
      const lunaResponse = "Based on your journal entries this month, you've been experiencing a mix of emotions. You've mentioned feeling proud about your work progress, but also some stress about deadlines. I noticed several entries where you expressed gratitude for your weekend activities and time with friends which seemed to boost your mood. Overall, your journaling shows a positive trend in the last week compared to the beginning of the month.";
      
      let words = lunaResponse.split(" ");
      let currentResponse = "";
      
      for (let i = 0; i < words.length; i++) {
        currentResponse += (i > 0 ? " " : "") + words[i];
        setMessages(prev => [
          ...prev.slice(0, -1),
          {
            role: "assistant", 
            content: currentResponse + (i < words.length - 1 ? "▋" : ""),
            mood: "thoughtful",
            isTyping: i < words.length - 1
          }
        ]);
        await new Promise(resolve => setTimeout(resolve, 40));
      }
      
      // Add final message without cursor
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: "assistant", content: lunaResponse, mood: "thoughtful" }
      ]);
      
      setChatState("idle");
      setDemoComplete(true);
    };

    // Start the demo with a delay
    const timer = setTimeout(() => {
      runDemo();
    }, 1500);

    return () => clearTimeout(timer);
  }, [demoComplete]);

  // Reset demo every 20 seconds
  useEffect(() => {
    if (!demoComplete) return;
    
    const resetTimer = setTimeout(() => {
      setMessages([
        {
          role: "assistant",
          content: "Hi there! I'm Luna, your AI journaling companion. Ask me anything about your entries or how I can help you reflect.",
          mood: "cheerful",
        }
      ]);
      setDemoComplete(false);
    }, 20000);
    
    return () => clearTimeout(resetTimer);
  }, [demoComplete]);

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        type: "spring", 
        damping: 12, 
        stiffness: 200, 
        duration: 0.4 
      } 
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  const userMessageVariants = {
    hidden: { opacity: 0, y: 20, x: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0, 
      scale: 1, 
      transition: { 
        type: "spring", 
        damping: 12, 
        stiffness: 200, 
        duration: 0.4 
      } 
    },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
  };

  const assistantMessageVariants = {
    hidden: { opacity: 0, y: 20, x: -20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0, 
      scale: 1, 
      transition: { 
        type: "spring", 
        damping: 12, 
        stiffness: 200, 
        duration: 0.4 
      } 
    },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  const loadingVariants = {
    start: { scale: 0.8, opacity: 0.3 },
    end: { scale: 1, opacity: 1 }
  };

  return (
    <Card className="w-full max-w-2xl bg-white dark:bg-slate-900/60 shadow-xl rounded-xl border-0 overflow-hidden backdrop-blur-sm">
      <div className="flex flex-col h-[400px]">
        <div className="bg-gradient-to-r from-indigo-100/80 to-purple-100/80 dark:from-indigo-900/20 dark:to-purple-900/30 px-4 py-3 border-b border-indigo-100/50 dark:border-indigo-800/30">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Luna</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your notebook companion</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/30 dark:to-slate-950/60">
          <div className="space-y-4 pb-4">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div 
                  key={index}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={messageVariants}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-xl p-3 ${
                      message.role === "user" 
                        ? "bg-indigo-600 text-white" 
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    
                    {message.isTyping && (
                      <motion.span 
                        className="inline-block h-4 w-2 -mb-0.5 bg-current opacity-70"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      >
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {chatState === "loading" && (
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={messageVariants}
                className="flex justify-start"
              >
                <div className="flex gap-1.5 items-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
                  <motion.div 
                    className="w-1.5 h-1.5 rounded-full bg-indigo-500" 
                    animate={{ scale: [0.8, 1, 0.8], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div 
                    className="w-1.5 h-1.5 rounded-full bg-purple-500" 
                    animate={{ scale: [0.8, 1, 0.8], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                  />
                  <motion.div 
                    className="w-1.5 h-1.5 rounded-full bg-pink-500" 
                    animate={{ scale: [0.8, 1, 0.8], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900/80">
          <div className="relative">
            <input 
              type="text" 
              className="w-full rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2.5 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
              placeholder="Ask Luna about your journal entries..."
              value={typingText}
              readOnly
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-7 h-7 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
