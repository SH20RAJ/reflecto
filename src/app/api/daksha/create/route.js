import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
    try {
        const { prompt, mode, options = {} } = await request.json();

        if (!prompt || !mode) {
            return NextResponse.json(
                { error: 'Prompt and mode are required' },
                { status: 400 }
            );
        }

        let response = {
            timestamp: new Date().toISOString(),
        };

        if (mode === 'text') {
            try {
                const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are Daksha, a creative AI assistant. Generate high-quality, engaging content based on user prompts. Be creative, detailed, and helpful."
                        },
                        {
                            role: "user",
                            content: `Create content based on this prompt: "${prompt}"\n\nPlease provide detailed, well-structured content that fully addresses the request.`
                        }
                    ],
                    max_tokens: 1500,
                    temperature: 0.7,
                });

                response.text = completion.choices[0].message.content;
                response.tokens = completion.usage.total_tokens;
                response.success = true;
                response.mood = 'creative';
                response.confidence = 0.9;
            } catch (openaiError) {
                console.log('OpenAI API unavailable, using fallback text generation:', openaiError.message);

                // Intelligent fallback text generation based on prompt
                let fallbackContent;
                const lowerPrompt = prompt.toLowerCase();

                if (lowerPrompt.includes('story') || lowerPrompt.includes('narrative')) {
                    fallbackContent = `**Generated Story (Demo Mode)**\n\nBased on your prompt: "${prompt}"\n\nOnce upon a time, in a world where AI and humans collaborated seamlessly, there lived a remarkable digital entity named Daksha. Known for exceptional creativity and intelligence, Daksha had the ability to craft compelling narratives that captivated audiences worldwide.\n\nIn full operation mode, I would generate a complete, original story tailored specifically to your prompt, incorporating:\n• Rich character development\n• Engaging plot structure\n• Vivid descriptions and dialogue\n• Thematic depth and meaning\n• Professional narrative techniques\n\nThis is a demonstration of Daksha's advanced creative writing capabilities.`;
                } else if (lowerPrompt.includes('article') || lowerPrompt.includes('blog')) {
                    fallbackContent = `**Generated Article (Demo Mode)**\n\n# ${prompt}\n\nIn today's rapidly evolving digital landscape, the topic of "${prompt}" has become increasingly relevant and important to understand.\n\n## Introduction\nThis article explores the key aspects and implications of the subject matter you've requested.\n\n## Key Points\n• Comprehensive analysis would be provided\n• Expert insights and current trends\n• Practical applications and examples\n• Future outlook and predictions\n\n## Conclusion\nIn full operation mode, Daksha would deliver a complete, well-researched article with in-depth analysis, current data, and expert perspectives tailored to your specific requirements.\n\nThis demonstrates Daksha's professional content creation capabilities.`;
                } else if (lowerPrompt.includes('email') || lowerPrompt.includes('letter')) {
                    fallbackContent = `**Generated Communication (Demo Mode)**\n\nSubject: ${prompt}\n\nDear Recipient,\n\nI hope this message finds you well. I am writing regarding the topic you specified: "${prompt}"\n\nIn full operation mode, Daksha would generate:\n• Professionally formatted correspondence\n• Appropriate tone and style for the context\n• Clear, concise, and effective messaging\n• Proper email/letter structure and etiquette\n• Personalized content based on your specific needs\n\nThis showcases Daksha's business communication expertise.\n\nBest regards,\nDaksha AI`;
                } else if (lowerPrompt.includes('code') || lowerPrompt.includes('program')) {
                    fallbackContent = `**Generated Code (Demo Mode)**\n\n\`\`\`javascript\n// Code based on: ${prompt}\n// This is a demonstration of Daksha's coding capabilities\n\nfunction dakshaGeneratedCode() {\n    // In full operation mode, Daksha would generate:\n    // • Complete, functional code solutions\n    // • Best practices and clean code principles\n    // • Comprehensive error handling\n    // • Detailed comments and documentation\n    // • Testing and optimization suggestions\n    \n    console.log("Daksha AI - Advanced code generation ready");\n    return "Demo mode active";\n}\n\ndakshaGeneratedCode();\n\`\`\`\n\nThis demonstrates Daksha's programming and software development capabilities.`;
                } else {
                    fallbackContent = `**Generated Content (Demo Mode)**\n\nBased on your prompt: "${prompt}"\n\nI'm Daksha, your advanced AI companion, and I'm ready to create exceptional content for you. In full operation mode, I would generate comprehensive, high-quality content that includes:\n\n• **Detailed Analysis**: Deep dive into the subject matter\n• **Creative Elements**: Original ideas and innovative approaches\n• **Professional Quality**: Well-structured and polished output\n• **Personalized Touch**: Content tailored to your specific needs\n• **Research-Backed**: Current information and expert insights\n\n**Sample Content Structure:**\n1. Introduction and context setting\n2. Main content development with key points\n3. Supporting details and examples\n4. Practical applications or implications\n5. Conclusion and next steps\n\nThis is a demonstration of Daksha's advanced content generation capabilities. The actual output would be fully developed, original content specifically crafted for your prompt.`;
                }

                response.text = fallbackContent;
                response.success = false;
                response.error = 'Text generation in demo mode';
                response.fallbackMessage = `Content would be generated for: "${prompt}"`;
                response.mood = 'creative';
                response.confidence = 0.75;
                response.metadata = {
                    model: 'fallback-text-generator',
                    timestamp: new Date().toISOString(),
                    isDemoMode: true
                };
            }
        }
        else if (mode === 'image') {
            try {
                // Use DALL-E 3 for image generation
                const imageResponse = await openai.images.generate({
                    model: "dall-e-3",
                    prompt: prompt,
                    size: options.size || "1024x1024",
                    quality: "standard",
                    n: 1,
                });

                response.imageUrl = imageResponse.data[0].url;
                response.revisedPrompt = imageResponse.data[0].revised_prompt;
                response.success = true;
                response.mood = 'creative';
                response.confidence = 0.9;
            } catch (openaiError) {
                console.log('OpenAI DALL-E API unavailable, using fallback image generation:', openaiError.message);

                // Enhanced fallback with dynamic placeholder based on prompt
                const size = options.size || "1024x1024";
                const dimensions = size.split('x');

                // Analyze prompt to determine appropriate placeholder
                const lowerPrompt = prompt.toLowerCase();
                let category = 'AI+Generated';
                let bgColor = '3b0764';
                let textColor = 'white';

                if (lowerPrompt.includes('nature') || lowerPrompt.includes('landscape')) {
                    category = 'Nature+Scene';
                    bgColor = '22c55e';
                } else if (lowerPrompt.includes('tech') || lowerPrompt.includes('futuristic')) {
                    category = 'Tech+Vision';
                    bgColor = '3b82f6';
                } else if (lowerPrompt.includes('art') || lowerPrompt.includes('painting')) {
                    category = 'Artistic+Creation';
                    bgColor = 'f59e0b';
                } else if (lowerPrompt.includes('space') || lowerPrompt.includes('cosmic')) {
                    category = 'Space+Scene';
                    bgColor = '1e293b';
                } else if (lowerPrompt.includes('abstract')) {
                    category = 'Abstract+Art';
                    bgColor = 'ec4899';
                }

                response.imageUrl = `https://placehold.co/${size}/${bgColor}/${textColor}?text=Daksha+${category}&font=roboto`;
                response.success = false;
                response.error = 'Image generation in demo mode';
                response.fallbackMessage = `Image would be generated for: "${prompt}"`;
                response.revisedPrompt = `Demo mode: ${prompt}`;
                response.mood = 'creative';
                response.confidence = 0.75;
                response.demoInfo = {
                    actualPrompt: prompt,
                    size: size,
                    category: category.replace(/\+/g, ' '),
                    message: "In full operation mode, Daksha would generate a high-quality, original image using DALL-E 3 based on your prompt."
                };
                response.metadata = {
                    model: 'fallback-image-generator',
                    timestamp: new Date().toISOString(),
                    isDemoMode: true
                };
            }
        }
        else if (mode === 'audio') {
            try {
                // Use OpenAI TTS for audio generation
                const mp3 = await openai.audio.speech.create({
                    model: "tts-1",
                    voice: options.voice || "alloy",
                    input: prompt,
                });

                // In a production environment, you'd save this to a file storage service
                // For now, we'll create a data URL
                const buffer = Buffer.from(await mp3.arrayBuffer());
                const audioDataUrl = `data:audio/mp3;base64,${buffer.toString('base64')}`;

                response.audioUrl = audioDataUrl;
                response.success = true;
                response.duration = Math.ceil(prompt.length / 10); // Rough estimate
                response.mood = 'creative';
                response.confidence = 0.9;
            } catch (openaiError) {
                console.log('OpenAI TTS API unavailable, using fallback audio generation:', openaiError.message);

                // Enhanced fallback for audio generation
                const voice = options.voice || "alloy";
                const estimatedDuration = Math.ceil(prompt.length / 10);

                // Use a sample audio file as fallback
                response.audioUrl = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
                response.success = false;
                response.error = 'Audio generation in demo mode';
                response.fallbackMessage = `Audio would be generated for: "${prompt}"`;
                response.duration = estimatedDuration;
                response.voice = voice;
                response.mood = 'creative';
                response.confidence = 0.75;
                response.demoInfo = {
                    actualText: prompt,
                    selectedVoice: voice,
                    estimatedDuration: `${estimatedDuration} seconds`,
                    message: "In full operation mode, Daksha would generate high-quality speech audio using OpenAI's text-to-speech technology."
                };
                response.metadata = {
                    model: 'fallback-audio-generator',
                    timestamp: new Date().toISOString(),
                    isDemoMode: true
                };
            }
        }
        else {
            return NextResponse.json(
                { error: 'Invalid mode. Must be text, image, or audio' },
                { status: 400 }
            );
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('Daksha create API error:', error);
        return NextResponse.json(
            { error: 'Failed to generate content' },
            { status: 500 }
        );
    }
}
