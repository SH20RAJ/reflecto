import React from 'react';
import Link from 'next/link';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DakshaHome() {
    const features = [
        {
            title: "Powerful AI Agent",
            description: "Access GPT-4 powered AI to complete complex tasks with contextual understanding",
            icon: "🤖",
            link: "/daksha/chat"
        },
        {
            title: "Contextual Memory",
            description: "Daksha remembers your conversations and preferences over time",
            icon: "🧠",
            link: "/daksha/chat"
        },
        {
            title: "Analyze Content",
            description: "Process images, videos, audio, and data for insights and information",
            icon: "🔍",
            link: "/daksha/analyze"
        },
        {
            title: "Creative Generation",
            description: "Create images, text content, and audio with simple prompts",
            icon: "✨",
            link: "/daksha/create"
        },
        {
            title: "Data Visualization",
            description: "Turn complex data into clear visualizations with AI assistance",
            icon: "📊",
            link: "/daksha/visualize"
        },
        {
            title: "Emotional Intelligence",
            description: "Get help parsing emotional nuances and improve communication",
            icon: "❤️",
            link: "/daksha/chat"
        }
    ];

    return (
        <div className="p-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-purple-400 mb-4">
                    Meet Daksha AI
                </h1>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Your personal AI assistant with powerful capabilities for analysis, creation,
                    visualization, and contextual conversation.
                </p>
                <div className="mt-8">
                    <Button className="bg-purple-600 hover:bg-purple-700" size="lg" asChild>
                        <Link href="/daksha/chat">
                            Start Chatting
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                {features.map((feature, index) => (
                    <Link href={feature.link} key={index} className="block group">
                        <Card className="p-6 h-full transition-all duration-200 hover:bg-gray-800/70 hover:border-purple-500/50">
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-gray-300">
                                {feature.description}
                            </p>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="mt-16 text-center">
                <h2 className="text-2xl font-bold mb-6">How Daksha Works</h2>
                <div className="flex flex-col md:flex-row justify-center gap-8 mt-6 text-left">
                    <Card className="p-6 flex-1 max-w-md">
                        <h3 className="text-xl font-semibold mb-2">1. Input Your Request</h3>
                        <p>Start by chatting with Daksha or uploading content for analysis. Ask anything or provide instructions for what you'd like to create.</p>
                    </Card>

                    <Card className="p-6 flex-1 max-w-md">
                        <h3 className="text-xl font-semibold mb-2">2. Daksha Processes</h3>
                        <p>The AI uses advanced models (GPT-4, DALL-E, etc.) to understand, analyze, or generate the requested content.</p>
                    </Card>

                    <Card className="p-6 flex-1 max-w-md">
                        <h3 className="text-xl font-semibold mb-2">3. Review & Iterate</h3>
                        <p>Get your results instantly and refine them with follow-up requests. Daksha learns from your feedback.</p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
