"use client";

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Sparkles, 
  MessageCircle, 
  Tag
} from 'lucide-react';

export default function AISidebarContent({ insights, notebook, handleAddSuggestedTag }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="space-y-5 mt-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 p-3 rounded-lg border border-border/10 hover:border-border/30 transition-colors">
                <div className="text-xs text-muted-foreground mb-1">Sentiment</div>
                <div className="font-medium text-sm flex items-center">
                  <motion.span 
                    className="h-2.5 w-2.5 bg-green-500 rounded-full mr-2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  ></motion.span>
                  {insights.sentiment}
                </div>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg border border-border/10 hover:border-border/30 transition-colors">
                <div className="text-xs text-muted-foreground mb-1">Reading Time</div>
                <div className="font-medium text-sm flex items-center">
                  <motion.span className="text-primary mr-1">📖</motion.span>
                  {insights.readingTime} min read
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center">
                <Tag className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                Main Topics
              </h4>
              <div className="flex flex-wrap gap-2">
                {insights.mainTopics.map((topic, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary" 
                    className="px-2 py-0.5 bg-gradient-to-r from-secondary/40 to-secondary hover:from-secondary/50 hover:to-secondary/90 transition-all duration-300"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Sparkles className="h-3.5 w-3.5 mr-2 text-amber-500" />
                Key Insights
              </h4>
              <ul className="space-y-2">
                {insights.keyInsights.map((insight, i) => (
                  <motion.li 
                    key={i} 
                    className="text-sm bg-muted/20 p-2.5 rounded-md border-l-2 border-primary/40 hover:bg-muted/40 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {insight}
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <MessageCircle className="h-3.5 w-3.5 mr-2 text-blue-500" />
                Recommendations
              </h4>
              <ul className="space-y-2">
                {insights.recommendations.map((rec, i) => (
                  <motion.li 
                    key={i} 
                    className="text-sm bg-muted/20 p-2.5 rounded-md border-l-2 border-blue-500/40 hover:bg-muted/40 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    {rec}
                  </motion.li>
                ))}
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-5 mt-0">
            <div>
              <h4 className="text-sm font-medium mb-2">Word Analysis</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-muted/20 p-2 rounded-sm">
                  <span className="text-xs">Word Count</span>
                  <span className="text-xs font-medium">{insights.wordCount} words</span>
                </div>
                <div className="flex justify-between items-center bg-muted/20 p-2 rounded-sm">
                  <span className="text-xs">Created</span>
                  <span className="text-xs font-medium">{notebook?.createdAt ? format(new Date(notebook.createdAt), 'MMM d, yyyy') : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center bg-muted/20 p-2 rounded-sm">
                  <span className="text-xs">Status</span>
                  <Badge variant={notebook?.isPublic ? "secondary" : "outline"} className="text-xs">
                    {notebook?.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Suggested Tags</h4>
              <div className="flex flex-wrap gap-2">
                {insights.suggestedTags.map((tag, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => handleAddSuggestedTag(tag)}
                  >
                    + {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="pt-3 border-t border-border/20">
        <Button variant="outline" className="w-full justify-center gap-2 text-primary hover:bg-primary/5 transition-colors">
          <MessageCircle className="h-4 w-4" />
          Ask Luna about this entry
        </Button>
      </div>
    </div>
  );
}
