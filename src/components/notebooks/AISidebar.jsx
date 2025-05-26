"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AISidebarHeader from './AISidebarHeader';
import AISidebarContent from './AISidebarContent';

export default function AISidebar({ notebook, content, selectedTags, setSelectedTags }) {
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    // Simulated API call to analyze content
    const analyzeContent = async () => {
      try {
        // Replace this with your actual API call
        const fakeAnalysis = {
          sentiment: 'Positive',
          readingTime: '3',
          mainTopics: ['Journal', 'Reflection', 'Growth'],
          keyInsights: [
            'Regular journaling pattern observed',
            'Focus on personal development',
            'Goal-oriented content'
          ],
          recommendations: [
            'Consider adding more specific examples',
            'Try incorporating reflective questions',
            'Link to previous entries for continuity'
          ],
          wordCount: content?.split(' ').length || 0,
          suggestedTags: ['journaling', 'reflection', 'personal-growth']
        };

        setTimeout(() => {
          setInsights(fakeAnalysis);
          setIsLoading(false);
        }, 2000);
      } catch (error) {
        console.error('Error analyzing content:', error);
        setIsLoading(false);
      }
    };

    if (content) {
      analyzeContent();
    }
  }, [content]);

  const handleAddSuggestedTag = (tagName) => {
    const newTag = {
      id: Date.now().toString(),
      name: tagName,
    };
    if (!selectedTags.some(tag => tag.name.toLowerCase() === tagName.toLowerCase())) {
      setSelectedTags([...selectedTags, newTag]);
    }
  };

  return (
    <motion.div 
      className="h-full overflow-auto"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AISidebarHeader />
      
      <div className="p-5">
        {isLoading ? (
          <AISidebarLoading />
        ) : insights && (
          <AISidebarContent 
            insights={insights} 
            notebook={notebook} 
            handleAddSuggestedTag={handleAddSuggestedTag}
          />
        )}
      </div>
    </motion.div>
  );
}
