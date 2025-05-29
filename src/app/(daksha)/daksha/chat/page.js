import React from 'react'
import { DakshaChat } from "@/components/daksha/DakshaChat";
import { DakshaChatHistory } from "@/components/daksha/DakshaChatHistory";

export default function DakshaChatPage() {
    return (
        <div className="flex h-full">
            <DakshaChatHistory />
            <div className="flex-1">
                <DakshaChat />
            </div>
        </div>
    );
}
