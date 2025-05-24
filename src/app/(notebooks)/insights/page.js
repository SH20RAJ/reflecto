"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  ChevronRight,
  Lightbulb,
  Sparkles,
  Calendar,
  Book,
  Tag,
  Clock,
  Star,
  Brain,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotebooks } from '@/lib/hooks';
import { format } from 'date-fns';

export default function InsightsPage() {
  const router = useRouter();
  const { notebooks, isLoading } = useNotebooks();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Sample insights data - in a real app, this would come from an API
  const [insightsData, setInsightsData] = useState({
    totalNotebooks: 0,
    totalWords: 0,
    mostActiveDay: "Monday",
    topTags: [],
    recentActivity: [],
    streakDays: 0
  });
  
  useEffect(() => {
    if (notebooks && notebooks.length > 0) {
      // Calculate insights from notebooks
      const totalNotebooks = notebooks.length;
      
      // Count words (this is an estimation since we don't have actual content)
      const totalWords = notebooks.reduce((sum, notebook) => {
        // In a real app, you'd count actual words from content
        return sum + (notebook.wordCount || 0);
      }, 0);
      
      // Get all tags and count occurrences
      const tagCounts = {};
      notebooks.forEach(notebook => {
        if (notebook.tags && Array.isArray(notebook.tags)) {
          notebook.tags.forEach(tag => {
            const tagName = typeof tag === 'string' ? tag : tag.name;
            tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
          });
        }
      });
      
      // Sort tags by count
      const topTags = Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Recent activity (based on updatedAt)
      const recentActivity = [...notebooks]
        .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
        .slice(0, 5)
        .map(notebook => ({
          id: notebook.id,
          title: notebook.title || 'Untitled Notebook',
          updatedAt: notebook.updatedAt,
          type: 'update'
        }));
      
      // Calculate streak (simplified version)
      // In a real app, you'd have a more accurate way to track user's daily usage
      const streakDays = Math.floor(Math.random() * 10) + 1; // Mock data
      
      setInsightsData({
        totalNotebooks,
        totalWords,
        mostActiveDay: "Wednesday", // This would be calculated from actual usage data
        topTags,
        recentActivity,
        streakDays
      });
    }
  }, [notebooks]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center px-4 text-center">
          <div className="relative mb-6">
            <div className="h-12 w-12 rounded-full border-4 border-violet-200/30 dark:border-violet-700/30"></div>
            <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-t-violet-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold mb-2">
            Generating your insights
          </h3>
          <p className="text-muted-foreground max-w-sm">
            Analyzing your notebooks to provide personalized insights...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Notebook Insights</h1>
        <p className="text-muted-foreground">
          Discover patterns and gain insights from your writing journey
        </p>
      </div>

      {/* Insights Tabs */}
      <Tabs defaultValue="overview" className="mb-8" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="pt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Stat Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Notebooks
                </CardTitle>
                <Book className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{insightsData.totalNotebooks}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {insightsData.totalNotebooks > 5 
                    ? "You're building a great collection!" 
                    : "Start creating more notebooks to build your collection"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Writing Streak
                </CardTitle>
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{insightsData.streakDays} days</div>
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div 
                      key={i}
                      className={`h-2 w-6 rounded-sm ${i < insightsData.streakDays % 7 ? 'bg-primary' : 'bg-muted'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep writing to maintain your streak
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Most Active Day
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insightsData.mostActiveDay}</div>
                <div className="flex gap-1 mt-1">
                  {['M','T','W','T','F','S','S'].map((day, i) => (
                    <div 
                      key={i}
                      className={`h-8 w-6 rounded-sm flex items-end justify-center pb-1 ${
                        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i] === insightsData.mostActiveDay 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      <span className="text-xs">{day}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Activity */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest notebook updates</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="space-y-2">
                  {insightsData.recentActivity.length > 0 ? (
                    insightsData.recentActivity.map((activity) => (
                      <div 
                        key={activity.id}
                        className="flex items-center p-2 hover:bg-muted rounded-md cursor-pointer"
                        onClick={() => router.push(`/notebooks/${activity.id}`)}
                      >
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-1">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Updated {activity.updatedAt ? format(new Date(activity.updatedAt), 'MMM dd, yyyy') : 'recently'}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No recent activity</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full text-sm" onClick={() => router.push('/notebooks')}>
                  View all notebooks
                </Button>
              </CardFooter>
            </Card>
            
            {/* Top Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Top Tags</CardTitle>
                <CardDescription>Your most used tags</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                {insightsData.topTags.length > 0 ? (
                  <div className="space-y-2">
                    {insightsData.topTags.map((tag, i) => (
                      <div key={i} className="flex items-center p-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                          <Tag className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{tag.name}</p>
                        </div>
                        <Badge variant="secondary">{tag.count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No tags yet</p>
                )}
              </CardContent>
              <CardFooter>
                <p className="text-xs text-center w-full text-muted-foreground">
                  Add tags to your notebooks to see patterns
                </p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Activity Tab */}
        <TabsContent value="activity" className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Activity Calendar</CardTitle>
                <CardDescription>Your writing activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                  <div className="text-center">
                    <BarChart3 className="h-10 w-10 mb-2 mx-auto text-muted-foreground" />
                    <p className="text-sm">Activity visualization coming soon</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      We're working on advanced activity analytics
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Topics Tab */}
        <TabsContent value="topics" className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Topic Analysis</CardTitle>
                <CardDescription>Common themes in your writing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                  <div className="text-center">
                    <Brain className="h-10 w-10 mb-2 mx-auto text-muted-foreground" />
                    <p className="text-sm">Topic analysis coming soon</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      We're working on AI-powered topic analysis
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Writing Style</CardTitle>
                <CardDescription>Analysis of your writing patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                  <div className="text-center">
                    <Layers className="h-10 w-10 mb-2 mx-auto text-muted-foreground" />
                    <p className="text-sm">Style analysis coming soon</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      We're developing advanced style analytics
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <CardTitle>Writing Suggestions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-2">
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-md">
                    <h4 className="font-medium mb-1">Try journaling daily</h4>
                    <p className="text-sm text-muted-foreground">
                      Regular journaling helps improve writing consistency and mental clarity.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-md">
                    <h4 className="font-medium mb-1">Add more tags</h4>
                    <p className="text-sm text-muted-foreground">
                      Organizing your notebooks with tags will help you track themes in your writing.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-md">
                    <h4 className="font-medium mb-1">Try AI-assisted writing</h4>
                    <p className="text-sm text-muted-foreground">
                      Use our Luna AI to help overcome writer's block and generate new ideas.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push('/notebooks/new')}>
                  Create a new notebook
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <CardTitle>Recommended Topics</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-2">
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-md">
                    <h4 className="font-medium mb-1">Gratitude Journal</h4>
                    <p className="text-sm text-muted-foreground">
                      Write about things you're grateful for to boost your mood and mindfulness.
                    </p>
                    <Button variant="link" className="px-0 py-1" onClick={() => router.push('/notebooks/new')}>
                      Start now
                    </Button>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-md">
                    <h4 className="font-medium mb-1">Creative Story</h4>
                    <p className="text-sm text-muted-foreground">
                      Let your imagination flow by writing a short fictional story.
                    </p>
                    <Button variant="link" className="px-0 py-1" onClick={() => router.push('/notebooks/new')}>
                      Start now
                    </Button>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-md">
                    <h4 className="font-medium mb-1">Goal Setting</h4>
                    <p className="text-sm text-muted-foreground">
                      Document your goals and create actionable plans to achieve them.
                    </p>
                    <Button variant="link" className="px-0 py-1" onClick={() => router.push('/notebooks/new')}>
                      Start now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
