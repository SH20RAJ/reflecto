"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Book, Save, ArrowLeft, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useTags } from '@/lib/hooks';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';

export default function NewNotebookPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [appendDate, setAppendDate] = useState(false);
  const { tags } = useTags();
  const [showTagSelector, setShowTagSelector] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title for your notebook');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // If appendDate is checked, add the current date to the title
      let finalTitle = title.trim();
      if (appendDate) {
        const currentDate = format(new Date(), 'MMM d, yyyy');
        finalTitle = `${finalTitle} - ${currentDate}`;
      }
      
      const response = await fetch('/api/notebooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: finalTitle,
          description: description.trim(),
          tags: selectedTags.map(tag => tag.id)
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create notebook');
      }
      
      const data = await response.json();
      toast.success('Notebook created successfully');
      router.push(`/notebooks/${data.id}`);
    } catch (error) {
      console.error('Error creating notebook:', error);
      toast.error('Failed to create notebook. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagToggle = (tag) => {
    if (selectedTags.some(t => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Generate a list of suggestions for notebook titles
  const notebookSuggestions = [
    "Daily Reflection",
    "Morning Pages",
    "Gratitude Journal",
    "Work Journal",
    "Personal Development",
    "Project Ideas",
    "Travel Memories",
    "Dream Journal",
    "Book Notes",
    "Meeting Notes"
  ];
  
  const useNotebookSuggestion = (suggestion) => {
    setTitle(suggestion);
    // Auto focus on the description field after selecting a title
    document.getElementById('description').focus();
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Create New Notebook</h1>
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>Creating...</>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Notebook
              </>
            )}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Book className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Notebook Details</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title *
                </label>
                <div className="relative">
                  <Input
                    id="title"
                    placeholder="Give your notebook a name..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                    required
                    className="pr-20 text-lg font-medium h-12 transition-all"
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center">
                    <span className="text-xs text-muted-foreground">
                      {title.length > 0 ? `${title.length} chars` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox 
                    id="appendDate"
                    checked={appendDate}
                    onCheckedChange={setAppendDate}
                  />
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <label
                      htmlFor="appendDate"
                      className="text-xs cursor-pointer"
                    >
                      Append current date to title ({format(new Date(), 'MMM d, yyyy')})
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  placeholder="Add a short description for your notebook..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[120px] p-3 text-base rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium">
                    Tags (optional)
                  </label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowTagSelector(!showTagSelector)}
                    type="button"
                    className="text-xs h-7"
                  >
                    {showTagSelector ? 'Hide Tags' : 'Select Tags'}
                  </Button>
                </div>
                
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTags.map(tag => (
                      <Badge 
                        key={tag.id}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag.name}
                        <span className="ml-1" aria-hidden="true">&times;</span>
                      </Badge>
                    ))}
                  </div>
                )}
                
                {showTagSelector && tags && tags.length > 0 && (
                  <div className="bg-muted/30 p-3 rounded-lg border border-border/30">
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <Badge 
                          key={tag.id}
                          variant={selectedTags.some(t => t.id === tag.id) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleTagToggle(tag)}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Notebook Title Suggestions</h3>
            <div className="flex flex-wrap gap-2">
              {notebookSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => useNotebookSuggestion(suggestion)}
                  className="text-sm"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

