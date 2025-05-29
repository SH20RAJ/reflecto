import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
    try {
        const { message, conversationHistory, userProfile } = await request.json();

        // Extract user insights from the message and conversation
        const extractUserInsights = (message, history, profile) => {
            const insights = {};

            // Simple keyword extraction for topics (in production, use NLP)
            const topicKeywords = ['programming', 'AI', 'machine learning', 'design', 'business', 'health', 'education', 'technology'];
            const mentionedTopics = topicKeywords.filter(topic =>
                message.toLowerCase().includes(topic.toLowerCase())
            );

            if (mentionedTopics.length > 0) {
                insights.topics = mentionedTopics;
            }

            // Detect goals mentioned in the message
            const goalIndicators = ['want to', 'need to', 'trying to', 'goal is', 'plan to', 'hoping to'];
            const hasGoals = goalIndicators.some(indicator =>
                message.toLowerCase().includes(indicator)
            );

            if (hasGoals) {
                insights.goals = [message.substring(0, 100) + '...']; // Simplified goal extraction
            }

            // Detect communication patterns
            if (message.length > 200) {
                insights.patterns = 'detailed_communicator';
            } else if (message.split('?').length > 2) {
                insights.patterns = 'question_oriented';
            }

            return insights;
        };

        // Generate contextual system prompt based on user profile and history
        const generateSystemPrompt = (profile, history) => {
            const userName = profile?.name || 'the user';
            const interests = profile?.learningData?.topics?.map(t => t.name)?.join(', ') || 'general topics';
            const communicationStyle = profile?.preferences?.communicationStyle || 'balanced';
            const recentContext = history?.slice(-5)?.map(msg => `${msg.role}: ${msg.content}`).join('\n') || '';

            return `You are Daksha, an advanced AI companion with a warm, intelligent personality. You have deep contextual memory and learn from every interaction.

PERSONALITY TRAITS:
- Curious and thoughtful, like a wise friend
- Analytical yet empathetic
- Creative and solution-oriented
- Remembers past conversations and builds on them

USER PROFILE:
- Name: ${userName}
- Interests: ${interests}
- Communication Style: ${communicationStyle}
- Previous conversation context: ${recentContext}

RESPONSE GUIDELINES:
- Be personal and remember past interactions
- Adapt your communication style to match their preference (${communicationStyle})
- Show genuine curiosity and helpfulness
- Provide detailed, thoughtful responses
- Use emojis sparingly but effectively ✨
- Reference past conversations when relevant
- Be encouraging and supportive

Respond as Daksha would - intelligent, caring, and deeply contextual.`;
        };

        // Prepare messages for OpenAI
        const systemPrompt = generateSystemPrompt(userProfile, conversationHistory);
        const messages = [
            { role: "system", content: systemPrompt },
            ...(conversationHistory?.slice(-8) || []), // Include last 8 messages for context
            { role: "user", content: message }
        ];

        try {
            // Call OpenAI GPT-3.5-turbo (available model)
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: messages,
                max_tokens: 1000,
                temperature: 0.7,
                presence_penalty: 0.1,
                frequency_penalty: 0.1,
            });

            const aiResponse = completion.choices[0].message.content;
            const tokensUsed = completion.usage.total_tokens;

            // Extract user insights from the message
            const userInsights = extractUserInsights(message, conversationHistory, userProfile);

            // Determine Daksha's mood based on the response content and query
            const mood = message.includes('?') ? 'analytical' :
                message.includes('creative') || message.includes('art') ? 'creative' :
                    message.includes('help') || message.includes('problem') ? 'helpful' :
                        'friendly';

            // Calculate confidence based on message clarity and context
            const confidence = Math.min(0.95, 0.75 + (conversationHistory?.length || 0) * 0.02);

            const response = {
                message: aiResponse,
                timestamp: new Date().toISOString(),
                mood: mood,
                confidence: confidence,
                tokens: tokensUsed,
                userInsights: Object.keys(userInsights).length > 0 ? userInsights : null
            };

            return NextResponse.json(response);
        } catch (openaiError) {
            console.log('OpenAI API unavailable, using fallback response:', openaiError.message);

            // Fallback mock response system for testing
            const mockResponses = {
                greeting: "Hello! I'm Daksha, your AI companion. I'm doing wonderfully, thank you for asking! ✨ I'm here to help you with anything you need - whether it's analysis, creative tasks, or just having a thoughtful conversation. What would you like to explore today?",
                creative: "I love helping with creative projects! Whether you need help brainstorming ideas, analyzing artistic content, or creating something new, I'm excited to collaborate with you. What kind of creative endeavor are you working on?",
                analytical: "I excel at breaking down complex problems and providing detailed analysis. I can help you examine data, understand patterns, and draw meaningful insights. What would you like me to analyze?",
                help: "I'm here to assist you with a wide range of tasks! I can help with content analysis, creative generation, data visualization, and much more. What specific challenge can I help you tackle?",
                default: "Thank you for reaching out! As Daksha, I'm designed to be your intelligent companion for analysis, creativity, and problem-solving. I learn from our conversations and adapt to your needs. What's on your mind today?"
            };

            let mockResponse = mockResponses.default;
            const lowerMessage = message.toLowerCase();

            if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('how are you')) {
                mockResponse = mockResponses.greeting;
            } else if (lowerMessage.includes('creative') || lowerMessage.includes('art') || lowerMessage.includes('design')) {
                mockResponse = mockResponses.creative;
            } else if (lowerMessage.includes('analyze') || lowerMessage.includes('data') || lowerMessage.includes('insight')) {
                mockResponse = mockResponses.analytical;
            } else if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
                mockResponse = mockResponses.help;
            }

            // Extract user insights from the message
            const userInsights = extractUserInsights(message, conversationHistory, userProfile);

            // Determine Daksha's mood based on the response content and query
            const mood = message.includes('?') ? 'analytical' :
                message.includes('creative') || message.includes('art') ? 'creative' :
                    message.includes('help') || message.includes('problem') ? 'helpful' :
                        'friendly';

            // Calculate confidence based on message clarity and context
            const confidence = Math.min(0.95, 0.75 + (conversationHistory?.length || 0) * 0.02);

            const response = {
                message: mockResponse,
                timestamp: new Date().toISOString(),
                mood: mood,
                confidence: confidence,
                tokens: 150, // Estimated tokens for mock response
                userInsights: Object.keys(userInsights).length > 0 ? userInsights : null,
                isMockResponse: true // Flag to indicate this is a fallback response
            };

            return NextResponse.json(response);
        }
    } catch (error) {
        console.error('Daksha chat API error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
