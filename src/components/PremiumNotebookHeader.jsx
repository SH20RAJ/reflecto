"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, 
  Calendar, 
  Clock, 
  BarChart2, 
  Share2,
  Star, 
  Edit3, 
  Trash2, 
  Download, 
  Tag as TagIcon, 
  X, 
  Plus,
  MessageSquare,
  FileText,
  ChevronDown,
  Settings,
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';

export default function PremiumNotebookHeader({ 
  notebook = {
    title: "Creative Projects",
    emoji: "✨",
    aiSummary: "Ideas for creative projects and inspiration sources",
    tags: ['creative', 'ideas', 'inspiration'],
    updatedAt: new Date(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    wordCount: 12500,
    entryCount: 32,
    color: 'from-pink-500 to-rose-500'
  },
  activeTab = "editor",
  setActiveTab = () => {},
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(notebook.title);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [activeTags, setActiveTags] = useState(notebook.tags || []);
  const [isStarred, setIsStarred] = useState(false);
  
  const handleTitleSave = () => {
    // Here you would update the notebook title in your database
    setIsEditingTitle(false);
  };
  
  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !activeTags.includes(newTag.toLowerCase().trim())) {
      setActiveTags([...activeTags, newTag.toLowerCase().trim()]);
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setActiveTags(activeTags.filter(tag => tag !== tagToRemove));
  };
  
  return (
    <div className="w-full">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b pb-5 mb-4"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-3xl mr-3"
                >
                  {notebook.emoji}
                </motion.div>
                <div className="flex-1 mr-4">
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="text-2xl font-bold border-primary"
                    autoFocus
                  />
                </div>
                <Button size="sm" onClick={handleTitleSave}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingTitle(false)} className="ml-2">
                  Cancel
                </Button>
              </div>
            ) : (
              <motion.h1 
                className="text-3xl font-bold flex items-center cursor-pointer group"
                onClick={() => setIsEditingTitle(true)}
                whileHover={{ x: 2 }}
              >
                <span className="text-3xl mr-3">{notebook.emoji}</span>
                {notebook.title}
                <Edit3 className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-70 transition-opacity" />
              </motion.h1>
            )}
            <div className="text-muted-foreground text-sm mt-1">{notebook.aiSummary}</div>
          </div>
          
          <div className="flex space-x-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" onClick={() => setIsStarred(!isStarred)}>
                <Star className={cn(
                  "h-5 w-5", 
                  isStarred ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                )} />
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5 text-muted-foreground" />
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </Button>
            </motion.div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-wrap gap-2 items-center">
            {isEditingTags ? (
              <motion.form 
                className="flex items-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onSubmit={handleAddTag}
              >
                <TagIcon className="h-4 w-4 text-muted-foreground mr-1" />
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag..."
                  className="h-7 text-sm min-w-[100px] max-w-[160px] mr-2"
                  autoFocus
                />
                <Button type="submit" size="sm" className="h-7 text-xs">Add</Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditingTags(false)}
                  className="h-7 text-xs ml-1"
                >
                  Done
                </Button>
              </motion.form>
            ) : (
              <>
                <div className="flex items-center text-muted-foreground text-sm mr-2">
                  <TagIcon className="h-4 w-4 mr-1.5" />
                  <span>Tags:</span>
                </div>
                
                {activeTags.length > 0 ? (
                  activeTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs group">
                      #{tag}
                      <button 
                        onClick={() => handleRemoveTag(tag)} 
                        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No tags</span>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => setIsEditingTags(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-6 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1.5 opacity-70" />
              <span>Updated {format(notebook.updatedAt, "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center">
              <Book className="h-3.5 w-3.5 mr-1.5 opacity-70" />
              <span>{notebook.entryCount} entries</span>
            </div>
            <div className="flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1.5 opacity-70" />
              <span>{notebook.wordCount.toLocaleString()} words</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      <div className="flex justify-between items-center mb-5">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-background border">
            <TabsTrigger value="editor" className="data-[state=active]:bg-primary/5 relative group">
              <FileText className="h-4 w-4 mr-2" />
              <span>Editor</span>
              {activeTab === "editor" && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-primary/5 relative group">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span>Chat with AI</span>
              <Badge 
                variant="outline" 
                className="ml-2 py-0 h-5 bg-primary/5 text-xs hidden sm:inline-flex"
              >
                Premium
              </Badge>
              {activeTab === "chat" && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-primary/5 relative">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>AI Insights</span>
              <Badge 
                variant="outline" 
                className="ml-2 py-0 h-5 bg-primary/5 text-xs hidden sm:inline-flex"
              >
                Premium
              </Badge>
              {activeTab === "insights" && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex space-x-2 ml-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="destructive" size="sm" className="hidden sm:flex">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="default" size="sm">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Breadcrumb navigation */}
      <motion.div 
        className="text-xs text-muted-foreground mb-4 flex items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className="hover:text-foreground cursor-pointer">Notebooks</span>
        <ChevronRight className="h-3 w-3 mx-1" />
        <span className="text-foreground font-medium">{notebook.title}</span>
      </motion.div>
    </div>
  );
}
