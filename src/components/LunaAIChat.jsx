"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, X, Zap, Lightbulb, MoreHorizontal, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';

const LunaAIChat = ({ 
  initialMessages = [], 
  notebook = null,
  onSendMessage,
  onClose,
  showClose = true,
  fullHeight = false,
  embedded = false
}) => {
  const [messages, setMessages] = useState(initialMessages.length > 0 ? initialMessages : [
    {
      role: 'assistant',
      content: 'Hi there! I\'m Luna, your AI assistant. How can I help you with your journaling and reflection today?',
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input on initial load
  useEffect(() => {
    if (!embedded) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [embedded]);

  // Sample suggestions based on the notebook content or general journaling
  const suggestions = notebook ? [
    "Summarize the key emotions in this entry",
    "What patterns do you notice in my writing?",
    "Suggest some reflection questions about this topic",
    "Help me expand on this idea"
  ] : [
    "How can I improve my journaling practice?",
    "What are good reflection prompts for today?",
    "Help me process a difficult emotion I'm feeling",
    "Find patterns in my recent writing"
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      if (onSendMessage) {
        // Use provided callback for handling messages
        const response = await onSendMessage(inputValue.trim(), messages);
        
        if (response) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: response,
            timestamp: new Date()
          }]);
        }
      } else {
        // Mock response for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Create mock response based on input
        let mockResponse = '';
        
        if (inputValue.toLowerCase().includes('help')) {
          mockResponse = "I'm here to help! You can ask me about your journal entries, get insights about your writing patterns, or request guidance on reflection techniques.";
        } else if (inputValue.toLowerCase().includes('summary')) {
          mockResponse = "Looking at your recent entries, I notice themes of personal growth and reflection. You've been writing about work challenges but also making time for activities that bring you joy.";
        } else if (inputValue.toLowerCase().includes('suggest') || inputValue.toLowerCase().includes('prompt')) {
          mockResponse = "Here are some journaling prompts you might find helpful:\n\n1. What brought you joy today, and why?\n2. What's a challenge you're facing, and what resources do you have to overcome it?\n3. What's something you're grateful for right now?";
        } else {
          mockResponse = "Thank you for sharing that. Reflecting on what you've written, I notice this seems important to you. Would you like to explore this topic further, or would you prefer some journaling prompts related to it?";
        }
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: mockResponse,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className={`border rounded-lg shadow-sm overflow-hidden ${fullHeight ? 'h-full' : ''}`}>
      <CardHeader className="border-b bg-muted/40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/images/luna-avatar.png" alt="Luna" />
              <AvatarFallback className="bg-primary">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base flex items-center">
                Luna AI
                <Badge variant="secondary" className="ml-2 text-xs font-normal">
                  <Sparkles className="h-3 w-3 mr-1" /> Assistant
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">Journaling companion</CardDescription>
            </div>
          </div>
          
          {showClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
        <TabsList className="grid grid-cols-2 mx-4 my-2">
          <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
          <TabsTrigger value="insights" className="text-xs">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex flex-col data-[state=active]:flex-1">
          <ScrollArea className={`flex-1 p-4 ${fullHeight ? 'h-[400px]' : 'h-[320px]'}`}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`rounded-lg p-3 max-w-[80%] ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    {message.content}
                    <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {message.timestamp && formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-lg p-3 bg-muted flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!inputValue.trim() || isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {suggestions.map((suggestion, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion}
                </Button>
              )).slice(0, 2)}
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    <MoreHorizontal className="h-3.5 w-3.5 mr-1" /> More
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64 p-2">
                  <div className="grid gap-1">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="h-auto py-1.5 px-2 justify-start font-normal text-xs"
                        onClick={() => {
                          handleSuggestionClick(suggestion);
                          document.body.click(); // Close popover
                        }}
                      >
                        <ChevronRight className="h-3.5 w-3.5 mr-1.5" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="flex-1 flex flex-col data-[state=active]:flex-1">
          <ScrollArea className={`flex-1 p-4 ${fullHeight ? 'h-[400px]' : 'h-[320px]'}`}>
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <h3 className="flex items-center text-sm font-medium mb-2">
                  <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                  Writing Analysis
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Based on your recent entries, here are some patterns I've noticed in your writing:
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex">
                    <span className="mr-2">•</span>
                    <span>You frequently mention work-related stress (7 entries this month)</span>
                  </li>
                  <li className="flex">
                    <span className="mr-2">•</span>
                    <span>There's a positive emotional trend on weekends</span>
                  </li>
                  <li className="flex">
                    <span className="mr-2">•</span>
                    <span>Words like "hope" and "progress" appear often</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h3 className="flex items-center text-sm font-medium mb-2">
                  <Sparkles className="h-4 w-4 mr-2 text-violet-500" />
                  Reflection Prompts
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Try these reflection questions based on your recent writing:
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex">
                    <span className="mr-2">1.</span>
                    <span>What specific aspects of work create the most stress for you?</span>
                  </li>
                  <li className="flex">
                    <span className="mr-2">2.</span>
                    <span>How can you incorporate weekend activities into weekdays?</span>
                  </li>
                  <li className="flex">
                    <span className="mr-2">3.</span>
                    <span>What does "progress" mean to you right now?</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h3 className="flex items-center text-sm font-medium mb-2">
                  <Zap className="h-4 w-4 mr-2 text-amber-500" />
                  Suggestions
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Try these to enhance your journaling practice:
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start text-left h-auto py-2">
                    <div>
                      <div className="font-medium text-xs">Add a gratitude section</div>
                      <div className="text-xs text-muted-foreground">Balance work reflections</div>
                    </div>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-left h-auto py-2">
                    <div>
                      <div className="font-medium text-xs">Try morning journaling</div>
                      <div className="text-xs text-muted-foreground">Set positive intent for the day</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default LunaAIChat;
