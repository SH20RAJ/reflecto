'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';

// Context for storing Daksha's memory and conversation history
const DakshaContext = createContext();

export function useDaksha() {
    return useContext(DakshaContext);
}

export function DakshaProvider({ children }) {
    // Store chat history for persistent context
    const [chatHistory, setChatHistory] = useState([]);

    // Enhanced user profile with learning capabilities
    const [userProfile, setUserProfile] = useState({
        name: '',
        interests: [],
        preferences: {
            communicationStyle: 'balanced', // casual, formal, technical, balanced
            responseLength: 'medium', // short, medium, detailed, comprehensive
            personalityMatch: 'adaptive', // friendly, professional, creative, analytical, adaptive
        },
        learningData: {
            topics: [], // Topics the user frequently asks about
            patterns: [], // Communication patterns Daksha has noticed
            goals: [], // User's stated or inferred goals
            context: [], // Important context to remember
        },
        interactionStats: {
            totalMessages: 0,
            sessionsCount: 0,
            averageSessionLength: 0,
            lastActive: null,
            favoriteFeatures: [],
        }
    });

    // Daksha's personality and mood system
    const [dakshaState, setDakshaState] = useState({
        currentMood: 'focused', // focused, creative, analytical, friendly, empathetic
        confidence: 0.85,
        learningMode: true,
        personalityTraits: {
            curiosity: 0.9,
            helpfulness: 0.95,
            creativity: 0.8,
            analytical: 0.9,
            empathy: 0.85,
        },
        capabilities: {
            memoryRecall: true,
            contextAwareness: true,
            personalityAdaptation: true,
            learningFromFeedback: true,
        }
    });

    // Store user preferences and settings
    const [userPreferences, setUserPreferences] = useState({
        tonePreference: 'balanced', // balanced, formal, casual, technical
        responseLength: 'medium', // short, medium, long, comprehensive
        creativeLevel: 'balanced', // factual, balanced, creative
        rememberedContext: [],
    });

    // Store analysis history
    const [analysisHistory, setAnalysisHistory] = useState([]);

    // Store creation history
    const [creationHistory, setCreationHistory] = useState([]);

    // Store visualization history
    const [visualizationHistory, setVisualizationHistory] = useState([]);

    // Load from localStorage on component mount
    useEffect(() => {
        try {
            const savedChatHistory = localStorage.getItem('daksha_chat_history');
            const savedUserProfile = localStorage.getItem('daksha_user_profile');
            const savedDakshaState = localStorage.getItem('daksha_state');
            const savedPreferences = localStorage.getItem('daksha_preferences');
            const savedAnalysisHistory = localStorage.getItem('daksha_analysis_history');
            const savedCreationHistory = localStorage.getItem('daksha_creation_history');
            const savedVisualizationHistory = localStorage.getItem('daksha_visualization_history');

            if (savedChatHistory) setChatHistory(JSON.parse(savedChatHistory));
            if (savedUserProfile) setUserProfile(prev => ({ ...prev, ...JSON.parse(savedUserProfile) }));
            if (savedDakshaState) setDakshaState(prev => ({ ...prev, ...JSON.parse(savedDakshaState) }));
            if (savedPreferences) setUserPreferences(JSON.parse(savedPreferences));
            if (savedAnalysisHistory) setAnalysisHistory(JSON.parse(savedAnalysisHistory));
            if (savedCreationHistory) setCreationHistory(JSON.parse(savedCreationHistory));
            if (savedVisualizationHistory) setVisualizationHistory(JSON.parse(savedVisualizationHistory));
        } catch (error) {
            console.error('Error loading Daksha context:', error);
            // If there's an error, we'll just use the default state
        }
    }, []);

    // Save to localStorage when state changes
    useEffect(() => {
        try {
            localStorage.setItem('daksha_chat_history', JSON.stringify(chatHistory));
            localStorage.setItem('daksha_user_profile', JSON.stringify(userProfile));
            localStorage.setItem('daksha_state', JSON.stringify(dakshaState));
            localStorage.setItem('daksha_preferences', JSON.stringify(userPreferences));
            localStorage.setItem('daksha_analysis_history', JSON.stringify(analysisHistory));
            localStorage.setItem('daksha_creation_history', JSON.stringify(creationHistory));
            localStorage.setItem('daksha_visualization_history', JSON.stringify(visualizationHistory));
        } catch (error) {
            console.error('Error saving Daksha context:', error);
        }
    }, [chatHistory, userProfile, dakshaState, userPreferences, analysisHistory, creationHistory, visualizationHistory]);

    // Add a new message to chat history
    const addChatMessage = (message) => {
        setChatHistory(prev => [...prev, message]);
    };

    // Add a new analysis result
    const addAnalysisResult = (result) => {
        setAnalysisHistory(prev => [...prev, result]);
    };

    // Add a new creation result
    const addCreationResult = (result) => {
        setCreationHistory(prev => [...prev, result]);
    };

    // Add a new visualization result
    const addVisualizationResult = (result) => {
        setVisualizationHistory(prev => [...prev, result]);
    };

    // Update user preferences
    const updatePreferences = (newPreferences) => {
        setUserPreferences(prev => ({ ...prev, ...newPreferences }));
    };

    // Update user profile with new insights from Daksha
    const updateUserProfile = (insights) => {
        setUserProfile(prev => {
            const updated = { ...prev };

            // Update interaction stats
            updated.interactionStats.totalMessages += 1;
            updated.interactionStats.lastActive = new Date().toISOString();

            // Add new interests if discovered
            if (insights.newInterests) {
                insights.newInterests.forEach(interest => {
                    if (!updated.interests.includes(interest)) {
                        updated.interests.push(interest);
                    }
                });
            }

            // Add new topics to learning data
            if (insights.topics) {
                insights.topics.forEach(topic => {
                    const existingTopic = updated.learningData.topics.find(t => t.name === topic);
                    if (existingTopic) {
                        existingTopic.frequency += 1;
                    } else {
                        updated.learningData.topics.push({ name: topic, frequency: 1, lastMentioned: new Date().toISOString() });
                    }
                });
            }

            // Add communication patterns
            if (insights.patterns) {
                updated.learningData.patterns.push({
                    pattern: insights.patterns,
                    timestamp: new Date().toISOString()
                });
            }

            // Add goals if mentioned
            if (insights.goals) {
                insights.goals.forEach(goal => {
                    if (!updated.learningData.goals.find(g => g.goal === goal)) {
                        updated.learningData.goals.push({
                            goal: goal,
                            timestamp: new Date().toISOString(),
                            status: 'active'
                        });
                    }
                });
            }

            // Add important context
            if (insights.context) {
                updated.learningData.context.push({
                    context: insights.context,
                    timestamp: new Date().toISOString(),
                    importance: insights.importance || 'medium'
                });
            }

            return updated;
        });
    };

    // Update Daksha's state and mood
    const updateDakshaState = (newState) => {
        setDakshaState(prev => ({ ...prev, ...newState }));
    };

    // Add a specific concept or fact to remembered context
    const rememberContext = (contextItem) => {
        setUserPreferences(prev => ({
            ...prev,
            rememberedContext: [...prev.rememberedContext, {
                item: contextItem,
                timestamp: new Date().toISOString()
            }]
        }));
    };

    // Clear all history (for privacy or reset)
    const clearAllHistory = () => {
        setChatHistory([]);
        setAnalysisHistory([]);
        setCreationHistory([]);
        setVisualizationHistory([]);

        // Reset user profile interaction stats but keep learned preferences
        setUserProfile(prev => ({
            ...prev,
            interactionStats: {
                ...prev.interactionStats,
                totalMessages: 0,
                sessionsCount: 0,
                averageSessionLength: 0,
                lastActive: null
            }
        }));
    };

    const value = {
        chatHistory,
        userProfile,
        dakshaState,
        userPreferences,
        analysisHistory,
        creationHistory,
        visualizationHistory,
        addChatMessage,
        addAnalysisResult,
        addCreationResult,
        addVisualizationResult,
        updatePreferences,
        updateUserProfile,
        updateDakshaState,
        rememberContext,
        clearAllHistory
    };

    return (
        <DakshaContext.Provider value={value}>
            {children}
        </DakshaContext.Provider>
    );
}
