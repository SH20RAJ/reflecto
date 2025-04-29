"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Calendar, Image, Search, Clock, Bot, User, CalendarRange, X, Filter, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

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

  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    isActive: false
  });
  const [showDateFilter, setShowDateFilter] = useState(false);

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

      // Add assistant response to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          entries: data.entries || [],
          dateRange: dateRange.isActive ? {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          } : null
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

    // Add a system message about the date range change
    if (!dateRange.isActive && (dateRange.startDate || dateRange.endDate)) {
      const startDateStr = dateRange.startDate ? format(dateRange.startDate, 'PPP') : 'the beginning';
      const endDateStr = dateRange.endDate ? format(dateRange.endDate, 'PPP') : 'today';

      setMessages(prev => [
        ...prev,
        {
          role: "system",
          content: `Date range filter activated. I'll only search notebooks from ${startDateStr} to ${endDateStr}.`
        }
      ]);
    } else if (dateRange.isActive) {
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

  return (
    <Card className="w-full h-[calc(100vh-12rem)] flex flex-col">
      <CardHeader className="px-4 py-3 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Bot className="h-5 w-5 mr-2 text-primary" />
            Notebook Assistant
          </CardTitle>

          <div className="flex items-center gap-2">
            {dateRange.isActive && (
              <Badge variant="outline" className="flex items-center gap-1 bg-primary/10">
                <CalendarRange className="h-3 w-3" />
                <span className="text-xs">
                  {dateRange.startDate ? format(dateRange.startDate, 'MMM d, yyyy') : 'Start'} -
                  {dateRange.endDate ? format(dateRange.endDate, 'MMM d, yyyy') : 'End'}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={clearDateRange}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            <Popover open={showDateFilter} onOpenChange={setShowDateFilter}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  <span className="text-xs">Date Range</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Filter by Date Range</h4>
                    <p className="text-xs text-muted-foreground">
                      Limit your search to notebooks within a specific date range.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start-date" className="text-xs">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="start-date"
                            variant="outline"
                            className="justify-start text-left font-normal h-8 text-xs"
                          >
                            {dateRange.startDate ? (
                              format(dateRange.startDate, 'PPP')
                            ) : (
                              <span className="text-muted-foreground">Pick a date</span>
                            )}
                            <CalendarComponent className="h-4 w-4 ml-auto opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={dateRange.startDate}
                            onSelect={(date) => handleDateRangeChange('startDate', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="end-date" className="text-xs">End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="end-date"
                            variant="outline"
                            className="justify-start text-left font-normal h-8 text-xs"
                          >
                            {dateRange.endDate ? (
                              format(dateRange.endDate, 'PPP')
                            ) : (
                              <span className="text-muted-foreground">Pick a date</span>
                            )}
                            <CalendarComponent className="h-4 w-4 ml-auto opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={dateRange.endDate}
                            onSelect={(date) => handleDateRangeChange('endDate', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <Label htmlFor="activate-filter" className="text-xs mb-1">Activate Filter</Label>
                      <span className="text-xs text-muted-foreground">
                        Apply date range to searches
                      </span>
                    </div>
                    <Switch
                      id="activate-filter"
                      checked={dateRange.isActive}
                      onCheckedChange={toggleDateRangeFilter}
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearDateRange}
                      className="text-xs"
                    >
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowDateFilter(false)}
                      className="text-xs"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
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
                        : message.role === "system"
                        ? "bg-muted/50 border border-dashed"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>

                    {message.dateRange && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarRange className="h-3 w-3" />
                        <span>
                          Filtered: {message.dateRange.startDate ? format(message.dateRange.startDate, 'MMM d, yyyy') : 'Start'} -
                          {message.dateRange.endDate ? format(message.dateRange.endDate, 'MMM d, yyyy') : 'End'}
                        </span>
                      </div>
                    )}
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
