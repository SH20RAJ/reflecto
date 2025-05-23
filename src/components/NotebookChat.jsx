"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Calendar, Image, Search, Clock, Bot, User, CalendarRange, X, Filter, Settings, ChevronDown, AlignLeft, Sparkles, Heart, Coffee, Sun, Moon, Cloud, CloudRain, Smile, Frown, Zap, Star, MessageCircle, Lightbulb, Music } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Function to render markdown to HTML with improved error handling
function renderMarkdownToHTML(markdown) {
  try {
    // Safety check for invalid input
    if (!markdown || typeof markdown !== 'string') {
      console.warn('Invalid markdown input:', markdown);
      return '';
    }

    // Use a simple regex-based approach if the unified/remark libraries aren't available
    if (typeof unified !== 'function') {
      return simpleMarkdownToHTML(markdown);
    }
    
    // Process the markdown with unified/remark
    const result = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkBreaks)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeSanitize)
      .use(rehypeRaw)
      .use(rehypeStringify)
      .processSync(markdown);
    
    return result.toString();
  } catch (error) {
    console.error('Error rendering markdown:', error);
    // Fallback to simple HTML escaping to avoid breaking the UI
    return simpleMarkdownToHTML(markdown);
  }
}

// Fallback simple markdown renderer that handles basic formatting
function simpleMarkdownToHTML(markdown) {
  if (!markdown) return '';
  
  // Safety check - ensure it's a string
  if (typeof markdown !== 'string') {
    try {
      markdown = String(markdown);
    } catch (e) {
      console.error('Failed to convert markdown to string:', e);
      return '<p>Error displaying content</p>';
    }
  }
  
  // Escape HTML to prevent XSS
  const escapeHTML = (str) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
    
  const escaped = escapeHTML(markdown);
  
  // Process markdown with improved regex patterns
  return escaped
    // Handle bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Handle italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Handle links - ensure they're safe
    .replace(/\[([^\[]+)\]\(([^\)]+)\)/g, (match, text, url) => {
      // Basic URL validation
      if (url.startsWith('javascript:')) {
        return `[${text}](unsafe link)`;
      }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    })
    // Handle headers (h3)
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    // Handle headers (h2)
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    // Handle headers (h1)
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Handle unordered lists
    .replace(/^\s*[\-\*] (.*$)/gm, '<li>$1</li>')
    // Handle ordered lists
    .replace(/^\s*(\d+)\. (.*$)/gm, '<li>$2</li>')
    // Wrap lists in ul/ol tags
    .replace(/(<li>.*<\/li>)\n(?![<]li>)/g, '<ul>$1</ul>')
    // Handle code blocks with language support
    .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="language-${lang || 'text'}"><code>${code}</code></pre>`;
    })
    // Handle inline code
    .replace(/`([^`]*?)`/g, '<code>$1</code>')
    // Handle blockquotes
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    // Handle horizontal rules
    .replace(/^\s*[\-=_]{3,}\s*$/gm, '<hr>')
    // Handle paragraphs - wrap text that isn't already wrapped
    .replace(/^([^<].*[^>])$/gm, '<p>$1</p>')
    // Handle paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Wrap in paragraph
    .replace(/^(.*)/, '<p>$1</p>');
}

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

// Assistant personalities and moods
const LUNA_PERSONALITIES = {
  friendly: {
    name: "Friendly Luna",
    icon: <Smile className="h-5 w-5 text-yellow-400" />,
    color: "bg-gradient-to-br from-yellow-100 to-amber-50",
    borderColor: "border-yellow-200",
    textColor: "text-amber-800"
  },
  cheerful: {
    name: "Cheerful Luna",
    icon: <Sun className="h-5 w-5 text-orange-400" />,
    color: "bg-gradient-to-br from-orange-100 to-yellow-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-800"
  },
  calm: {
    name: "Calm Luna",
    icon: <Cloud className="h-5 w-5 text-sky-400" />,
    color: "bg-gradient-to-br from-sky-100 to-blue-50",
    borderColor: "border-sky-200",
    textColor: "text-sky-800"
  },
  thoughtful: {
    name: "Thoughtful Luna",
    icon: <Lightbulb className="h-5 w-5 text-violet-400" />,
    color: "bg-gradient-to-br from-violet-100 to-purple-50", 
    borderColor: "border-violet-200",
    textColor: "text-violet-800"
  },
  cozy: {
    name: "Cozy Luna",
    icon: <Coffee className="h-5 w-5 text-amber-500" />,
    color: "bg-gradient-to-br from-amber-100 to-orange-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-800"
  },
  insightful: {
    name: "Insightful Luna",
    icon: <Star className="h-5 w-5 text-indigo-400" />,
    color: "bg-gradient-to-br from-indigo-100 to-blue-50",
    borderColor: "border-indigo-200", 
    textColor: "text-indigo-800"
  },
  playful: {
    name: "Playful Luna",
    icon: <Music className="h-5 w-5 text-pink-400" />,
    color: "bg-gradient-to-br from-pink-100 to-rose-50",
    borderColor: "border-pink-200",
    textColor: "text-pink-800"
  }
};

export default function NotebookChat() {
  const { data: session } = useSession();
  
  // Get a random personality for initial load
  const getRandomPersonality = () => {
    const personalities = Object.keys(LUNA_PERSONALITIES);
    return personalities[Math.floor(Math.random() * personalities.length)];
  };
  
  const [currentPersonality, setCurrentPersonality] = useState(getRandomPersonality());
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "✨ Hi there! I'm Luna, your magical notebook companion! I'm here to help you explore your memories, discover patterns in your thoughts, or just be a friendly ear when you need someone to talk to. What's on your mind today? You can ask me about your entries, share how you're feeling, or we can just chat about your day! 💫",
      mood: currentPersonality,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
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

      // Format date for display if available
      const formattedDateRange = dateRange.isActive ? {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      } : null;

      // Determine a contextually appropriate mood based on the content and user's message
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

      // Add assistant response to chat with additional metadata
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          entries: data.entries || [],
          dateRange: formattedDateRange,
          query: data.query, // Store original query
          usedFallback: data.usedFallback, // Flag if fallback search was used
          mood: determineMood(data.message, data.entries || [], userMessage)
        },
      ]);
    } catch (error) {
      console.error("Error in chat:", error);
      
      // Error tracking - check for repeated errors
      const now = new Date();
      
      // If last error was less than 1 minute ago, increment counter
      if (lastErrorTime && (now - lastErrorTime) < 60000) {
        setErrorCount(prev => prev + 1);
      } else {
        // Reset error count if it's been a while
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
      
      // Add error message with a concerned mood
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
    <Card className="w-full h-full flex flex-col p-0 m-0">
      <CardHeader className="p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-primary shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
                  {LUNA_PERSONALITIES[currentPersonality].icon}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
            </div>
            
            <div>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <span className="bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent">Luna</span>
                <Badge variant="outline" className="h-5 ml-1 text-xs font-normal">
                  {LUNA_PERSONALITIES[currentPersonality].name.split(" ")[0]}
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">Your Personal Notebook Companion</p>
            </div>
          </div>

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

            <Popover open={showMoodSelector} onOpenChange={setShowMoodSelector}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 border-dashed">
                  <Heart className="h-3.5 w-3.5 text-pink-500" />
                  <span className="text-xs">Luna's Mood</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3" align="end">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Choose Luna's Personality</h4>
                  <p className="text-xs text-muted-foreground">
                    Select how you'd like Luna to interact with you today.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {Object.entries(LUNA_PERSONALITIES).map(([key, personality]) => (
                      <Button
                        key={key}
                        variant={currentPersonality === key ? "default" : "outline"} 
                        size="sm"
                        className={`justify-start h-full ${currentPersonality === key ? 'border-2' : ''}`}
                        onClick={() => {
                          setCurrentPersonality(key);
                          setShowMoodSelector(false);
                          setMessages(prev => [...prev, {
                            role: "system",
                            content: `Luna's mood has changed to ${personality.name.split(" ")[0]}. How can I help you today?`,
                            mood: key
                          }]);
                        }}
                      >
                        <div className={`mr-2 p-1 rounded-full ${personality.color}`}>
                          {personality.icon}
                        </div>
                        <span className="text-xs">{personality.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

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

      <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="space-y-6 pb-4 max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start gap-3 max-w-[85%] ${
                  message.role === "user"
                    ? "flex-row-reverse"
                    : "flex-row"
                }`}
              >
                {message.role === "user" ? (
                  <Avatar className="h-9 w-9 border-2 border-indigo-100 bg-gradient-to-br from-indigo-500 to-blue-600 shadow-sm">
                    {session?.user?.image ? (
                      <AvatarImage src={session.user.image} alt={session.user.name || "You"} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                ) : (
                  <Avatar className={`h-9 w-9 border-2 ${message.mood && LUNA_PERSONALITIES[message.mood]?.borderColor || 'border-purple-200'} shadow-sm`}>
                    <AvatarFallback className={`${message.mood && LUNA_PERSONALITIES[message.mood]?.color || 'bg-gradient-to-br from-purple-400 to-indigo-500'} text-white`}>
                      {message.mood && LUNA_PERSONALITIES[message.mood]?.icon || <Sparkles className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`w-full ${message.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-lg px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : message.role === "system"
                        ? "bg-muted/50 border border-dashed text-muted-foreground"
                        : message.mood && LUNA_PERSONALITIES[message.mood]
                        ? `${LUNA_PERSONALITIES[message.mood].color} border ${LUNA_PERSONALITIES[message.mood].borderColor} shadow-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-300`
                        : "bg-card shadow-sm border animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
                    }`}
                  >
                    {message.role === "assistant" && message.mood && (
                      <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-dashed border-opacity-30">
                        <div className={`p-0.5 rounded-full ${LUNA_PERSONALITIES[message.mood].color}`}>
                          {LUNA_PERSONALITIES[message.mood].icon}
                        </div>
                        <span className={`text-xs font-medium ${LUNA_PERSONALITIES[message.mood].textColor}`}>
                          {LUNA_PERSONALITIES[message.mood].name}
                        </span>
                      </div>
                    )}
                    <div 
                      className={`text-sm prose prose-sm max-w-none dark:prose-invert overflow-hidden ${
                        message.role === "assistant" && message.mood && LUNA_PERSONALITIES[message.mood] 
                        ? LUNA_PERSONALITIES[message.mood].textColor 
                        : ""
                      }`}
                      dangerouslySetInnerHTML={{ 
                        __html: message.role === "assistant" || message.role === "system"
                          ? renderMarkdownToHTML(message.content) 
                          : (typeof message.content === 'string' 
                             ? message.content
                             : String(message.content)) 
                      }}
                    />

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
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-medium text-muted-foreground">Related Entries</h4>
                        <Badge variant="secondary" className="text-xs">
                          {message.entries.length} {message.entries.length === 1 ? 'entry' : 'entries'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {message.entries.map((entry, i) => (
                          <Card key={i} className="p-3 text-sm hover:border-primary/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium">{entry.title}</div>
                              <div className="flex gap-1">
                                {entry.similarity !== undefined && (
                                  <Badge variant="outline" className="text-xs bg-green-50">
                                    {entry.similarity}% match
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(entry.date).toLocaleDateString()}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-muted-foreground text-xs line-clamp-2">
                              {entry.excerpt}
                            </p>
                            <div className="mt-2 flex gap-2 flex-wrap">
                              {entry.hasImage && (
                                <Badge variant="secondary" className="text-xs">
                                  <Image className="h-3 w-3 mr-1" />
                                  Contains images
                                </Badge>
                              )}
                              <Button variant="link" size="sm" className="h-6 p-0 text-xs">
                                View notebook
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
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

      <CardFooter className="p-4 pt-2 border-t bg-gradient-to-r from-indigo-50/30 to-purple-50/30">
        <form onSubmit={handleSend} className="flex w-full gap-2 relative">
          <div className="relative flex-1 rounded-full border shadow-sm">
            <Input
              placeholder={`Chat with Luna... ${currentPersonality ? `(${LUNA_PERSONALITIES[currentPersonality].name})` : ''}`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 pl-5 pr-12 focus-visible:ring-1 focus-visible:ring-offset-0 rounded-full bg-white"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            {dateRange.isActive && (
              <Badge 
                className="absolute right-12 top-1/2 -translate-y-1/2 bg-primary/10 hover:bg-primary/20 text-xs"
                variant="outline"
              >
                <CalendarRange className="h-3 w-3 mr-1" /> Date filter active
              </Badge>
            )}
          </div>
          <Button 
            type="submit" 
            size="icon" 
            variant="default"
            className={`rounded-full shadow-sm ${
              currentPersonality && LUNA_PERSONALITIES[currentPersonality]
              ? LUNA_PERSONALITIES[currentPersonality].color.replace('from-', 'from-opacity-80 from-').replace('to-', 'to-opacity-80 to-')
              : ''
            }`}
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? (
              <span className="animate-spin h-4 w-4 border-t-2 border-primary-foreground rounded-full" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
