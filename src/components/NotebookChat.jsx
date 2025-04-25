"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Calendar, Image, Search, Clock, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

const SAMPLE_QUESTIONS = [
  "When did I first mention Sarah in my notebooks?",
  "Show me entries where I talked about my job interview",
  "What photos did I take during my vacation last summer?",
  "Find entries where I felt happy in January",
  "When was the last time I wrote about my goals?",
  "Show me all entries with photos from December 2024",
  "What did I write on my birthday last year?",
  "Find entries where I mentioned meeting my girlfriend for the first time",
  "Show me all photos I took on the first Saturday of January 2025",
  "What was I feeling on New Year's Eve?",
  "Find entries where I talked about my career plans",
  "When did I last update my fitness goals?",
];

export default function NotebookChat() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi there! I can help you search through your notebooks. What would you like to find?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Randomly select 3 sample questions
  useEffect(() => {
    const randomQuestions = [...SAMPLE_QUESTIONS]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    setSelectedQuestion(randomQuestions);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue("");
    
    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Call API to get response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });
      
      const data = await response.json();
      
      // Add assistant response to chat
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: data.message,
          entries: data.entries || [] 
        },
      ]);
    } catch (error) {
      console.error("Error in chat:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: "Sorry, I encountered an error while searching your notebooks. Please try again." 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleQuestion = (question) => {
    setInputValue(question);
  };

  return (
    <Card className="w-full h-[calc(100vh-12rem)] flex flex-col">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-lg flex items-center">
          <Bot className="h-5 w-5 mr-2 text-primary" />
          Notebook Assistant
        </CardTitle>
      </CardHeader>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 pb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start gap-3 max-w-[80%] ${
                  message.role === "user"
                    ? "flex-row-reverse"
                    : "flex-row"
                }`}
              >
                <Avatar className={message.role === "user" ? "bg-primary" : "bg-muted"}>
                  {message.role === "user" ? (
                    session?.user?.image ? (
                      <AvatarImage src={session.user.image} alt={session.user.name || "User"} />
                    ) : (
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    )
                  ) : (
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  
                  {message.entries && message.entries.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.entries.map((entry, i) => (
                        <Card key={i} className="p-3 text-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium">{entry.title}</div>
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(entry.date).toLocaleDateString()}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-xs line-clamp-2">
                            {entry.excerpt}
                          </p>
                          {entry.hasImage && (
                            <div className="mt-2">
                              <Badge variant="secondary" className="text-xs">
                                <Image className="h-3 w-3 mr-1" />
                                Contains images
                              </Badge>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
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
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {selectedQuestion && (
        <div className="px-4 py-2 border-t border-b bg-muted/50">
          <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {selectedQuestion.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleSampleQuestion(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <CardFooter className="p-4 pt-2">
        <form onSubmit={handleSend} className="flex w-full gap-2">
          <Input
            placeholder="Ask about your notebooks..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
