import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDaksha } from './DakshaContext';

export function DakshaHeader() {
    const { clearAllHistory } = useDaksha();

    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center">
                <span className="text-2xl mr-2">🧠</span>
                <div>
                    <h2 className="text-xl font-semibold">Daksha AI</h2>
                    <p className="text-xs text-gray-400">Your intelligent assistant</p>
                </div>
            </div>
            <div className="flex space-x-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={clearAllHistory}>
                                <span className="mr-1">🧹</span> Clear History
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Clear all conversation and analysis history</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}

export function DakshaFooter() {
    return (
        <div className="text-center text-xs text-gray-400 p-2 border-t border-gray-700">
            <p>Daksha AI - Powered by GPT-4 and other advanced AI models</p>
            <p>Usage is subject to privacy policy and terms of service</p>
        </div>
    );
}

export function DakshaCard({ title, description, icon, className = '', children }) {
    return (
        <Card className={`p-6 ${className}`}>
            <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{icon}</span>
                <div>
                    <h3 className="text-xl font-bold">{title}</h3>
                    {description && <p className="text-sm text-gray-300">{description}</p>}
                </div>
            </div>
            {children}
        </Card>
    );
}

export function DakshaEmptyState({ title, description, icon, action }) {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8">
            <div className="text-5xl mb-4 opacity-70">{icon}</div>
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="text-gray-400 mb-6 max-w-md">{description}</p>
            {action}
        </div>
    );
}
