"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Tag,
  MessageCircle,
  PenLine,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Send,
  Lightbulb,
  Smile,
  TrendingUp,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';

export default function PremiumAISidebar({ isExpanded, toggleExpand, notebookContent = "" }) {
  const [activeTab, setActiveTab] = useState("insights");
  const [queryInput, setQueryInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  
  const handleAskQuestion = (e) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    
    setIsThinking(true);
    
    // Simulate thinking state
    setTimeout(() => {
      setIsThinking(false);
    }, 2000);
    
    // Here you would handle the AI query with the content
    console.log(`Asked: ${queryInput}`);
    setQueryInput("");
  };

  // Animation variants for the sidebar
  const sidebarVariants = {
    expanded: { width: "350px", transition: { duration: 0.3 } },
    collapsed: { width: "50px", transition: { duration: 0.3 } }
  };
  
  // Dummy data for insights
  const topThemes = ["creativity", "work-life balance", "productivity", "reflection", "goals"];
  const moodData = [
    { date: "Mon", value: 75, label: "Positive" },
    { date: "Tue", value: 85, label: "Very Positive" },
    { date: "Wed", value: 60, label: "Neutral" },
    { date: "Thu", value: 45, label: "Slightly Negative" },
    { date: "Fri", value: 90, label: "Very Positive" },
    { date: "Sat", value: 70, label: "Positive" },
    { date: "Sun", value: 65, label: "Positive" }
  ];
  
  const conversations = [
    { 
      id: 1,
      question: "What are the main themes in my writing?", 
      answer: "Your writing mainly focuses on creative projects, professional growth, and work-life balance. You frequently mention finding inspiration and implementing new ideas."
    },
    { 
      id: 2,
      question: "How has my mood changed over time?", 
      answer: "Your mood has been generally positive with some fluctuations. There's a noticeable improvement in sentiment when discussing creative projects and a slight decrease when mentioning work deadlines."
    }
  ];
  
  return (
    <motion.div 
      className={cn(
        "h-full border-l overflow-hidden bg-background flex flex-col",
        isExpanded ? "w-[350px]" : "w-[50px]"
      )}
      variants={sidebarVariants}
      animate={isExpanded ? "expanded" : "collapsed"}
      initial={false}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b p-3 flex justify-between items-center">
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <Sparkles className="h-4 w-4 text-primary mr-2" />
                <span className="font-semibold">AI Assistant</span>
                <Badge variant="outline" className="ml-2 bg-primary/5 h-5 text-xs">
                  Premium
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpand}
            className="p-1 h-8 w-8"
          >
            {isExpanded ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </Button>
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="insights" className="flex-1">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Insights
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex-1">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Ask AI
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <TabsContent value="insights" className="space-y-4 mt-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-primary" />
                      Top Themes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {topThemes.map((theme, i) => (
                        <Badge 
                          key={theme}
                          variant="secondary"
                          className="bg-primary/10 hover:bg-primary/20 transition-colors"
                        >
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Smile className="h-4 w-4 mr-2 text-primary" />
                      Mood Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 w-full flex items-end justify-between gap-1 mt-2">
                      {moodData.map((day, i) => (
                        <div 
                          key={i} 
                          className="flex flex-col items-center flex-1"
                        >
                          <motion.div 
                            className={cn(
                              "w-full rounded-t-sm",
                              day.value >= 75 ? "bg-green-500/80" : 
                              day.value >= 60 ? "bg-green-500/50" : 
                              day.value >= 50 ? "bg-amber-500/50" : "bg-red-500/50"
                            )}
                            initial={{ height: 0 }}
                            animate={{ height: `${day.value}%` }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                          />
                          <span className="text-xs mt-1 text-muted-foreground">{day.date}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 text-xs text-muted-foreground flex items-center justify-between px-1">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></div>
                        <span>Positive</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-amber-500 mr-1.5"></div>
                        <span>Neutral</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-red-500 mr-1.5"></div>
                        <span>Negative</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                      Writing Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Total words</span>
                      <span className="font-medium">12,458</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Avg. words per entry</span>
                      <span className="font-medium">389</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Most productive day</span>
                      <span className="font-medium">Tuesday</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Writing streak</span>
                      <span className="font-medium">5 days</span>
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <BarChart3 className="h-3.5 w-3.5 mr-2" />
                      View detailed analytics
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                      AI Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mr-2 shrink-0 mt-0.5">
                        <Lightbulb className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm">Consider exploring how your creative ideas connect to your professional goals</span>
                    </div>
                    <div className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mr-2 shrink-0 mt-0.5">
                        <Lightbulb className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm">Your entries are most reflective on Sundays - this might be a good day for deeper journaling</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chat" className="space-y-4 mt-2">
                <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px]">
                  {conversations.map((conversation) => (
                    <div key={conversation.id} className="space-y-3">
                      <div className="flex items-start">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 shrink-0 mt-0.5">
                          <PenLine className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="bg-muted/50 rounded-lg rounded-tl-none p-3 text-sm flex-1">
                          {conversation.question}
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-2 shrink-0 mt-0.5">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="bg-primary/5 rounded-lg rounded-tl-none p-3 text-sm flex-1">
                          {conversation.answer}
                          
                          <div className="flex items-center justify-end mt-2 space-x-2">
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                              <ThumbsUp className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                              <ThumbsDown className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <form onSubmit={handleAskQuestion} className="mt-auto">
                  <div className="relative">
                    <Input
                      placeholder="Ask about your notebook..."
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                      className="pr-10"
                      disabled={isThinking}
                    />
                    <Button 
                      type="submit" 
                      size="sm" 
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      disabled={!queryInput.trim() || isThinking}
                    >
                      {isThinking ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 flex justify-between">
                    <span>Powered by AI</span>
                    <span className="text-primary cursor-pointer hover:underline">Example questions</span>
                  </div>
                </form>
              </TabsContent>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isExpanded && (
          <div className="flex-1 flex flex-col items-center pt-4 space-y-6">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
              if (!isExpanded) toggleExpand();
              setActiveTab("insights");
            }}>
              <Lightbulb className="h-4 w-4 text-primary" />
            </Button>
            
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
              if (!isExpanded) toggleExpand();
              setActiveTab("chat");
            }}>
              <MessageCircle className="h-4 w-4 text-primary" />
            </Button>
            
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
              if (!isExpanded) toggleExpand();
            }}>
              <BarChart3 className="h-4 w-4 text-primary" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
