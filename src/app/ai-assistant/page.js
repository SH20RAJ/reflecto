"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import LunaAIChat from '@/components/LunaAIChat';
import { Bot, MessageSquare, Sparkles, Settings } from 'lucide-react';

export default function AIAssistantPage() {
  const [chatOpen, setChatOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  
  // Mock notebook for demo
  const mockNotebook = {
    id: 'demo-notebook',
    title: 'Daily Reflections',
    content: 'Today was a productive day despite the challenges...'
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Assistant</h1>
        <p className="text-muted-foreground">
          Chat with Luna AI to get insights, suggestions, and help with your journaling
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {chatOpen ? (
            <LunaAIChat 
              fullHeight={true} 
              showClose={false}
              notebook={activeTab === "notebook" ? mockNotebook : null}
            />
          ) : (
            <Card className="flex items-center justify-center h-[400px]">
              <CardContent className="text-center">
                <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">Luna AI Assistant</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  Get insights about your journaling, ask questions, and receive personalized suggestions.
                </p>
                <Button onClick={() => setChatOpen(true)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Conversation
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Context Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Conversation Context</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 mb-2">
                  <TabsTrigger value="chat">General</TabsTrigger>
                  <TabsTrigger value="notebook">Notebook</TabsTrigger>
                </TabsList>
                <TabsContent value="chat" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Chat generally about journaling, writing, or get tips and suggestions.
                  </p>
                </TabsContent>
                <TabsContent value="notebook" className="space-y-4">
                  <div className="rounded-md border p-3">
                    <div className="font-medium text-sm">Daily Reflections</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Current notebook loaded as context
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Luna can analyze this notebook and provide specific insights.
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Smart Analysis</h4>
                  <p className="text-xs text-muted-foreground">
                    Luna analyzes your writing patterns, emotions, and topics over time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Guided Journaling</h4>
                  <p className="text-xs text-muted-foreground">
                    Get personalized prompts and questions to deepen your reflection.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <Settings className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Customizable Experience</h4>
                  <p className="text-xs text-muted-foreground">
                    Adjust Luna's personality and focus to match your preferences.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                All conversations with Luna are private and secure.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
