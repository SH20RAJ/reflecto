'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDaksha } from './DakshaContext';
import { Mic, MicOff, Settings, Brain, Sparkles, Zap, Send } from 'lucide-react';

export function DakshaChat() {
  const { chatHistory, addChatMessage, userProfile, updateUserProfile } = useDaksha();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "✨ Hello! I'm Daksha, your advanced AI companion. I'm designed to understand you deeply, remember our conversations, and grow more helpful over time. How can I assist you today?",
      timestamp: new Date().toISOString(),
      mood: "friendly"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState('');
  const scrollRef = useRef(null);

  // Initialize messages from context on first load
  useEffect(() => {
    if (chatHistory.length > 0 && messages.length === 1) {
      // If we only have the welcome message, load chat history
      setMessages(prev => [...prev, ...chatHistory]);
    }
  }, [chatHistory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [messages]);

  // Speech recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      window.dakshaRecognition = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      window.dakshaRecognition?.stop();
      setIsListening(false);
    } else {
      window.dakshaRecognition?.start();
      setIsListening(true);
    }
  };

  // Typing indicator effect
  useEffect(() => {
    if (isLoading) {
      const indicators = ['Analyzing...', 'Processing...', 'Thinking...', 'Understanding...'];
      let index = 0;
      const interval = setInterval(() => {
        setTypingIndicator(indicators[index % indicators.length]);
        index++;
      }, 800);
      return () => clearInterval(interval);
    } else {
      setTypingIndicator('');
    }
  }, [isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    // Update both local state and context
    setMessages(prev => [...prev, userMessage]);
    addChatMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      // API call to Daksha backend with enhanced context
      const response = await fetch('/api/daksha/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
          userProfile: userProfile
        }),
      });

      const data = await response.json();

      const assistantMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        mood: data.mood || 'friendly',
        tokens: data.tokens,
        confidence: data.confidence
      };

      // Update both local state and context
      setMessages(prev => [...prev, assistantMessage]);
      addChatMessage(assistantMessage);

      // Update user profile if Daksha learned something new
      if (data.userInsights) {
        updateUserProfile(data.userInsights);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        mood: 'calm'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[85vh] flex flex-col bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 rounded-lg">
      {/* Header with AI Status */}
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/30 backdrop-blur-sm rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-blue-400/50">
                <AvatarFallback className="bg-transparent text-white font-bold">
                  <Brain className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-white">Daksha AI</h3>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <p className="text-xs text-gray-400">Your Advanced AI Companion</p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>AI Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4 space-y-4">
        {messages.length === 1 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center border border-blue-500/30">
                <Brain className="h-12 w-12 text-blue-400" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-600/10 animate-pulse"></div>
              <div className="absolute -top-2 -right-2">
                <Zap className="h-6 w-6 text-yellow-400 animate-bounce" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Welcome to Daksha AI
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
              I'm your advanced AI companion with memory, personality, and deep understanding.
              I grow smarter with every conversation we have.
            </p>
            <div className="grid grid-cols-1 gap-3 w-full max-w-md">
              <Button
                variant="outline"
                onClick={() => setInput("Tell me about yourself and your capabilities")}
                className="text-left justify-start bg-gray-800/50 border-gray-600 hover:bg-gray-700/50 hover:border-blue-500/50"
              >
                <Sparkles className="h-4 w-4 mr-2 text-blue-400" />
                "Tell me about your capabilities"
              </Button>
              <Button
                variant="outline"
                onClick={() => setInput("Help me understand complex topics")}
                className="text-left justify-start bg-gray-800/50 border-gray-600 hover:bg-gray-700/50 hover:border-purple-500/50"
              >
                <Brain className="h-4 w-4 mr-2 text-purple-400" />
                "Help me understand complex topics"
              </Button>
              <Button
                variant="outline"
                onClick={() => setInput("Let's have a creative conversation")}
                className="text-left justify-start bg-gray-800/50 border-gray-600 hover:bg-gray-700/50 hover:border-green-500/50"
              >
                <Zap className="h-4 w-4 mr-2 text-green-400" />
                "Let's have a creative conversation"
              </Button>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <Card
              key={index}
              className={`p-4 transition-all duration-300 hover:shadow-lg ${message.role === 'user'
                  ? 'bg-gradient-to-br from-purple-900/40 to-blue-900/30 border-purple-700/50 ml-auto backdrop-blur-sm'
                  : 'bg-gradient-to-br from-gray-800/50 to-gray-900/30 border-gray-600/50 backdrop-blur-sm'
                } max-w-[85%] shadow-lg`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {message.role === 'user' ? (
                    <Avatar className="h-6 w-6 bg-gradient-to-br from-purple-500 to-pink-600">
                      <AvatarFallback className="bg-transparent text-white text-xs">You</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-6 w-6 bg-gradient-to-br from-blue-500 to-purple-600">
                      <AvatarFallback className="bg-transparent text-white text-xs">
                        <Brain className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <span className="text-xs font-medium text-gray-300">
                    {message.role === 'user' ? 'You' : 'Daksha'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {message.confidence && (
                  <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                    {Math.round(message.confidence * 100)}% confident
                  </Badge>
                )}
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              {message.tokens && (
                <div className="mt-2 text-xs text-gray-500 flex items-center space-x-2">
                  <Zap className="h-3 w-3" />
                  <span>{message.tokens} tokens processed</span>
                </div>
              )}
            </Card>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <Card className="p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/30 border-gray-600/50 max-w-[85%] backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <Avatar className="h-6 w-6 bg-gradient-to-br from-blue-500 to-purple-600">
                <AvatarFallback className="bg-transparent text-white text-xs">
                  <Brain className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                </div>
                <span className="text-sm text-gray-300">{typingIndicator}</span>
              </div>
            </div>
          </Card>
        )}
      </ScrollArea>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm rounded-b-lg">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Daksha anything... I remember our conversations!"
              className="pr-12 bg-gray-800/50 border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 placeholder:text-gray-500"
              disabled={isLoading}
            />
            {typeof window !== 'undefined' && 'webkitSpeechRecognition' in window && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={toggleListening}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 ${isListening ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      {isListening ? (
                        <MicOff className="h-4 w-4 animate-pulse" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isListening ? 'Stop listening' : 'Voice input'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                  size="icon"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send message</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Daksha learns from every conversation</span>
          <span>{messages.length - 1} messages in this session</span>
        </div>
      </form>
    </div>
  );
}
