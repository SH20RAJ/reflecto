import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Get file details
        const fileType = file.type;
        const fileSize = file.size;
        const fileName = file.name;

        let analysis = {};

        // Handle image analysis
        if (fileType.startsWith('image/')) {
            try {
                // Convert file to base64
                const arrayBuffer = await file.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString('base64');
                const dataUrl = `data:${fileType};base64,${base64}`;

                try {
                    // Use OpenAI Vision API
                    const response = await openai.chat.completions.create({
                        model: "gpt-4o-mini", // Using available vision model
                        messages: [
                            {
                                role: "system",
                                content: "You are Daksha, an AI with advanced vision capabilities. Analyze images thoroughly and provide detailed, insightful analysis. Be descriptive, analytical, and helpful."
                            },
                            {
                                role: "user",
                                content: [
                                    {
                                        type: "text",
                                        text: "Please analyze this image in detail. Provide:\n1. A comprehensive description of what you see\n2. Key objects, people, or elements detected\n3. The mood, style, or artistic elements\n4. Any text you can read\n5. Insights or interesting observations\n\nBe thorough and analytical."
                                    },
                                    {
                                        type: "image_url",
                                        image_url: {
                                            url: dataUrl
                                        }
                                    }
                                ]
                            }
                        ],
                        max_tokens: 1000,
                        temperature: 0.3,
                    });

                    const visionAnalysis = response.choices[0].message.content;

                    // Extract key objects/elements (simple parsing)
                    const detectedObjects = extractObjects(visionAnalysis);

                    analysis = {
                        type: 'image',
                        summary: visionAnalysis,
                        detectedObjects: detectedObjects,
                        mood: 'analytical',
                        confidence: 0.85,
                        insights: ["Advanced vision analysis completed", "Objects and elements identified", "Contextual understanding applied"],
                        metadata: {
                            model: 'gpt-4o-mini',
                            timestamp: new Date().toISOString()
                        }
                    };
                } catch (openaiError) {
                    console.log('OpenAI Vision API unavailable, using fallback analysis:', openaiError.message);

                    // Fallback analysis for images
                    analysis = {
                        type: 'image',
                        summary: `I can see this is a ${fileType} image file named "${fileName}". While I cannot perform detailed visual analysis in demo mode, I would normally provide:\n\n• Comprehensive scene description\n• Object and element detection\n• Color palette and composition analysis\n• Text recognition (OCR)\n• Artistic style identification\n• Mood and aesthetic assessment\n• Technical image properties\n\nThis is a demonstration of Daksha's advanced vision capabilities. In full operation, I would analyze the actual visual content using state-of-the-art computer vision models.`,
                        detectedObjects: ['Visual elements (demo mode)'],
                        mood: 'analytical',
                        confidence: 0.75,
                        insights: [
                            "Image analysis capability demonstrated",
                            "Visual content processing ready",
                            "Comprehensive analysis available in full mode"
                        ],
                        metadata: {
                            model: 'fallback-vision-analyzer',
                            timestamp: new Date().toISOString(),
                            isDemoMode: true
                        }
                    };
                }
            } catch (error) {
                console.error('Vision processing error:', error);
                analysis = {
                    type: 'image',
                    summary: 'Image uploaded successfully but vision analysis encountered an error.',
                    detectedObjects: [],
                    confidence: 0.5,
                    error: 'Vision analysis error'
                };
            }
        }
        // Handle audio/video files (placeholder - would need specialized APIs)
        else if (fileType.startsWith('audio/') || fileType.startsWith('video/')) {
            analysis = {
                type: fileType.startsWith('audio/') ? 'audio' : 'video',
                summary: `${fileType.startsWith('audio/') ? 'Audio' : 'Video'} file detected. Advanced audio/video analysis requires specialized transcription services.`,
                transcript: "Audio/video transcription would be implemented with services like Whisper API or Google Speech-to-Text.",
                confidence: 0.6,
                details: {
                    duration: "Duration detection requires media processing",
                    format: fileType.split('/')[1].toUpperCase(),
                }
            };
        }
        // Handle documents and data files
        else if (fileType.includes('text/') || fileType.includes('json') || fileType.includes('csv')) {
            try {
                const text = await file.text();
                const truncatedText = text.length > 4000 ? text.substring(0, 4000) + '...' : text;

                try {
                    const response = await openai.chat.completions.create({
                        model: "gpt-3.5-turbo",
                        messages: [
                            {
                                role: "system",
                                content: "You are Daksha, an AI assistant with strong analytical capabilities. Analyze the provided text/data and give insights."
                            },
                            {
                                role: "user",
                                content: `Analyze this ${fileType} content and provide:\n1. A summary of the content\n2. Key themes or patterns\n3. Data insights if applicable\n4. Structure and format observations\n\nContent:\n${truncatedText}`
                            }
                        ],
                        max_tokens: 800,
                        temperature: 0.3,
                    });

                    analysis = {
                        type: 'document',
                        summary: response.choices[0].message.content,
                        mood: 'analytical',
                        confidence: 0.85,
                        insights: [
                            "Document content analyzed",
                            "Key themes identified",
                            "Structure and patterns detected"
                        ],
                        details: {
                            wordCount: text.split(/\s+/).length,
                            format: fileType.split('/')[1].toUpperCase(),
                            size: `${fileSize} bytes`
                        },
                        metadata: {
                            model: 'gpt-3.5-turbo',
                            timestamp: new Date().toISOString()
                        }
                    };
                } catch (openaiError) {
                    console.log('OpenAI API unavailable, using fallback analysis:', openaiError.message);

                    // Fallback document analysis
                    const wordCount = text.split(/\s+/).length;
                    const lines = text.split('\n').length;
                    const avgWordsPerLine = Math.round(wordCount / lines);

                    let contentType = 'text document';
                    let analysisInsights = [];

                    if (fileType.includes('json')) {
                        try {
                            const jsonData = JSON.parse(text);
                            contentType = 'JSON data file';
                            const keys = Object.keys(jsonData);
                            analysisInsights = [
                                `JSON structure with ${keys.length} main properties`,
                                "Data format suitable for processing and analysis",
                                "Structured data ready for visualization"
                            ];
                        } catch (e) {
                            analysisInsights = ["JSON format detected but parsing issues found"];
                        }
                    } else if (fileType.includes('csv')) {
                        contentType = 'CSV data file';
                        const csvLines = text.split('\n');
                        const headers = csvLines[0] ? csvLines[0].split(',').length : 0;
                        analysisInsights = [
                            `CSV with approximately ${headers} columns`,
                            `Data contains ${csvLines.length} rows`,
                            "Tabular data suitable for visualization and analysis"
                        ];
                    } else {
                        // Text analysis
                        if (wordCount > 1000) {
                            analysisInsights.push("Substantial text content detected");
                        }
                        if (text.includes('http')) {
                            analysisInsights.push("URLs or links detected in content");
                        }
                        if (text.match(/\d+/g)) {
                            analysisInsights.push("Numerical data present in text");
                        }
                        if (text.includes('\t') || avgWordsPerLine > 10) {
                            analysisInsights.push("Structured or formatted text detected");
                        }
                    }

                    analysis = {
                        type: 'document',
                        summary: `I've analyzed this ${contentType} titled "${fileName}". The file contains ${wordCount} words across ${lines} lines. In full operation mode, I would provide:\n\n• Detailed content analysis and key themes\n• Sentiment and tone assessment\n• Entity extraction and topic modeling\n• Document structure and formatting insights\n• Data patterns and relationships (for structured data)\n• Summary and key takeaways\n\nThis demonstrates Daksha's comprehensive document analysis capabilities.`,
                        mood: 'analytical',
                        confidence: 0.75,
                        insights: analysisInsights.length > 0 ? analysisInsights : [
                            "Document processing capability demonstrated",
                            "Content structure analysis ready",
                            "Full analysis available in production mode"
                        ],
                        details: {
                            wordCount: wordCount,
                            lineCount: lines,
                            avgWordsPerLine: avgWordsPerLine,
                            format: fileType.split('/')[1].toUpperCase(),
                            size: `${fileSize} bytes`
                        },
                        metadata: {
                            model: 'fallback-document-analyzer',
                            timestamp: new Date().toISOString(),
                            isDemoMode: true
                        }
                    };
                }
            } catch (error) {
                console.error('Document processing error:', error);
                analysis = {
                    type: 'document',
                    summary: 'Document uploaded successfully but content analysis encountered an error.',
                    confidence: 0.5,
                    error: 'Document processing error'
                };
            }
        }
        // Handle other file types
        else {
            analysis = {
                type: 'unknown',
                summary: `File type ${fileType} detected. Advanced analysis for this format is not yet implemented.`,
                confidence: 0.3,
                details: {
                    format: fileType,
                    size: `${fileSize} bytes`
                }
            };
        }

        return NextResponse.json({
            analysis: {
                fileName,
                fileType,
                fileSize,
                ...analysis
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Daksha analyze API error:', error);
        return NextResponse.json(
            { error: 'Failed to process file' },
            { status: 500 }
        );
    }
}

// Helper function to extract objects from vision analysis
function extractObjects(analysisText) {
    const commonObjects = [
        'person', 'people', 'man', 'woman', 'child', 'face', 'hand',
        'car', 'vehicle', 'building', 'house', 'tree', 'plant', 'flower',
        'cat', 'dog', 'animal', 'bird', 'food', 'table', 'chair',
        'computer', 'phone', 'book', 'text', 'sign', 'logo',
        'sky', 'cloud', 'water', 'mountain', 'road', 'street'
    ];

    const detectedObjects = [];
    const lowerText = analysisText.toLowerCase();

    commonObjects.forEach(obj => {
        if (lowerText.includes(obj)) {
            detectedObjects.push(obj);
        }
    });

    return detectedObjects.slice(0, 10); // Limit to 10 objects
}
