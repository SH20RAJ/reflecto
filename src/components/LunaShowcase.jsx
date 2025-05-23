"use client";

import React, { useState, useEffect } from "react";
import { Bot, ArrowRight, Sparkles, Smile, Sun, Cloud, Lightbulb, Coffee, Star, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LUNA_PERSONALITIES, SAMPLE_QUESTIONS } from "@/lib/luna-personalities";

export default function LunaShowcase() {
  const [currentPersonality, setCurrentPersonality] = useState("friendly");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Cycle through personalities
  useEffect(() => {
    const timer = setTimeout(() => {
      const personalities = Object.keys(LUNA_PERSONALITIES);
      const currentIndex = personalities.indexOf(currentPersonality);
      const nextIndex = (currentIndex + 1) % personalities.length;
      setCurrentPersonality(personalities[nextIndex]);
      setShowAnswer(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [currentPersonality]);

  // Cycle through questions
  useEffect(() => {
    if (!showAnswer) {
      const timer = setTimeout(() => {
        setCurrentQuestion((prev) => (prev + 1) % SAMPLE_QUESTIONS.length);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, showAnswer]);

  // Show answer effect
  useEffect(() => {
    if (!showAnswer) {
      const timer = setTimeout(() => {
        setShowAnswer(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentPersonality, currentQuestion]);

  const personality = LUNA_PERSONALITIES[currentPersonality];
  const question = SAMPLE_QUESTIONS[currentQuestion];

  // Generate a themed answer based on the personality
  const generateAnswer = (question, personality) => {
    // This is just for demonstration - in the real app, Luna would generate dynamic answers
    const personalityName = personality.name.toLowerCase();
    
    if (question.includes("journal") || question.includes("journaling")) {
      return personalityName === "thoughtful" 
        ? "Journaling is a powerful tool for self-reflection. Studies show it can enhance mindfulness and help process emotions. Have you noticed patterns in your own journaling practice?"
        : personalityName === "cheerful"
        ? "Journaling is amazing! It's like giving your brain a chance to play and explore ideas. Plus, it's super good for your mental health! Did you know keeping a journal can boost your mood by up to 20%?"
        : "Journaling helps connect your conscious and subconscious mind. It provides clarity during difficult times and preserves your memories for future reflection.";
    }
    
    if (question.includes("Sarah")) {
      return personalityName === "playful"
        ? "Let's see... 🕵️‍♀️ Found it! You first mentioned Sarah on March 15, 2024 when you had coffee together downtown. You talked about photography and Japan. Sounds like a fun conversation!"
        : personalityName === "calm"
        ? "I found three entries mentioning Sarah. The first appears to be from March 15, 2024, where you described meeting for coffee and discussing photography and travel."
        : "According to your notebooks, you first mentioned Sarah on March 15, 2024. You wrote about having coffee together and discovering shared interests in photography and travel.";
    }
    
    if (question.includes("job interview")) {
      return personalityName === "insightful"
        ? "I found 4 entries about your job interviews. There seems to be a pattern of increasing confidence in each entry. Your most recent interview at TechCorp had a notably positive tone compared to earlier ones."
        : personalityName === "cozy"
        ? "I found your job interview notes! You've written about your TechCorp interview most extensively. Would you like me to pull up the specific entries so we can review them together?"
        : "I found several entries mentioning job interviews. The most detailed one is from April 12, 2024, about the TechCorp position, where you noted feeling well-prepared and confident.";
    }
    
    return "I've searched through your notebooks and found several relevant entries. The most significant mention appears to be from recent months. Would you like me to show you the specific entries?";
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_40%_at_50%_60%,var(--primary-color-5,rgba(var(--primary-rgb),0.05))_0%,rgba(var(--background-end-rgb),0)_100%)]" />
      <div className="absolute top-40 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -ml-48" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48" />

      {/* Luna Section Content */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
            <Sparkles className="h-3.5 w-3.5 mr-2" />
            Meet Your Companion
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Luna, Your Notebook Assistant
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Luna is your AI-powered notebook companion with multiple personalities, designed to help you discover insights and make the most of your reflections.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Left column - Luna personalities */}
          <div className="lg:col-span-5 space-y-8">
            <div className="relative">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <span className="bg-primary/10 text-primary p-2 rounded-lg mr-3">
                  <Bot className="h-5 w-5" />
                </span>
                Personality That Matches Your Mood
              </h3>

              <p className="text-muted-foreground mb-8 leading-relaxed">
                Luna can adapt her personality to match your current mood and needs. Whether you need cheerful encouragement, thoughtful insight, or calm reassurance, Luna is there for you.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(LUNA_PERSONALITIES).map(([key, persona]) => (
                  <motion.div
                    key={key}
                    onClick={() => setCurrentPersonality(key)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className={`cursor-pointer rounded-xl border p-3 flex flex-col items-center text-center space-y-2 ${
                      currentPersonality === key ? `${persona.color} ${persona.borderColor} shadow-lg` : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${persona.color}`}>
                      {persona.icon}
                    </div>
                    <p className={`text-sm font-medium ${currentPersonality === key ? persona.textColor : ""}`}>
                      {persona.name}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Chat UI */}
          <div className="lg:col-span-7 relative">
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-xl" />

            {/* Luna Chat UI */}
            <div className="relative bg-card rounded-xl overflow-hidden shadow-2xl border border-border/50 backdrop-blur-sm">
              {/* Browser-like header */}
              <div className="p-4 border-b border-border/80 bg-muted/30 backdrop-blur-sm flex items-center">
                <div className="flex space-x-2 mr-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 text-center">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-background/80 text-foreground/80">
                    <Bot className="h-3.5 w-3.5 mr-1.5" />
                    Luna - {personality.name} Mode
                  </div>
                </div>
              </div>

              {/* Chat content */}
              <div className="p-6 bg-gradient-to-b from-background to-background/95">
                <div className="space-y-6 mb-6" style={{ minHeight: '320px' }}>
                  {/* Luna welcome message */}
                  <div className="flex items-start">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 border ${personality.color} ${personality.borderColor}`}
                    >
                      {personality.icon}
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`${personality.messageBg} p-4 rounded-2xl rounded-tl-none max-w-[80%] shadow-sm`}
                    >
                      <p className={`text-sm leading-relaxed ${personality.textColor}`}>
                        {personality.greeting}
                      </p>
                    </motion.div>
                  </div>

                  {/* User question */}
                  <div className="flex items-start justify-end">
                    <motion.div 
                      key={question}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-primary/90 text-primary-foreground p-4 rounded-2xl rounded-tr-none max-w-[80%] shadow-sm"
                    >
                      <p className="text-sm">{question}</p>
                    </motion.div>
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center ml-4 flex-shrink-0 border border-primary/20">
                      <span className="text-xs text-primary-foreground font-medium">You</span>
                    </div>
                  </div>

                  {/* Luna response */}
                  <AnimatePresence mode="wait">
                    {showAnswer && (
                      <div className="flex items-start">
                        <motion.div 
                          key={`${currentPersonality}-${currentQuestion}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 border ${personality.color} ${personality.borderColor}`}
                        >
                          {personality.icon}
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          className={`${personality.messageBg} p-4 rounded-2xl rounded-tl-none max-w-[80%] shadow-sm`}
                        >
                          <p className={`text-sm leading-relaxed ${personality.textColor}`}>
                            {generateAnswer(question, personality)}
                          </p>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Input area */}
                <div className="border-t border-border/50 pt-4 flex gap-2">
                  <div className="flex-1 bg-muted/50 backdrop-blur-sm rounded-lg px-4 py-3 text-sm text-muted-foreground border border-border/50">
                    Ask Luna anything about your notebooks...
                  </div>
                  <Button size="icon" className="h-10 w-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="border border-border hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Natural Language Search</h3>
              <p className="text-muted-foreground">
                Ask questions in everyday language and Luna will find exactly what you need from your notebooks.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border border-border hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Insightful Analysis</h3>
              <p className="text-muted-foreground">
                Luna identifies patterns and connections in your writing that you might have missed.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border border-border hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                <Coffee className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Emotional Support</h3>
              <p className="text-muted-foreground">
                Get encouragement, validation, and thoughtful responses that match your current emotional state.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
          >
            Meet Luna
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required. Free forever.
          </p>
        </div>
      </div>
    </section>
  );
}
