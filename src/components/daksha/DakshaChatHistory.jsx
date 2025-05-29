'use client'
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDaksha } from './DakshaContext';
import {
  History,
  Brain,
  Trash2,
  Star,
  Clock,
  MessageSquare,
  TrendingUp,
  User,
  Settings
} from 'lucide-react';

export function DakshaChatHistory() {
  const {
    chatHistory,
    userProfile,
    dakshaState,
    clearAllHistory,
    updateUserProfile
  } = useDaksha();

  const [showDetails, setShowDetails] = useState(false);

  // Group messages by date
  const groupedHistory = chatHistory.reduce((groups, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  const totalMessages = chatHistory.length;
  const userMessages = chatHistory.filter(m => m.role === 'user').length;
  const assistantMessages = chatHistory.filter(m => m.role === 'assistant').length;

  return (
    <div className="w-80 h-full bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold text-white">Chat History</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-400 hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Card className="p-2 bg-gray-800/50 border-gray-600">
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-3 w-3 text-blue-400" />
              <span className="text-gray-300">{totalMessages} total</span>
            </div>
          </Card>
          <Card className="p-2 bg-gray-800/50 border-gray-600">
            <div className="flex items-center space-x-1">
              <Brain className="h-3 w-3 text-purple-400" />
              <span className="text-gray-300">{assistantMessages} responses</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Detailed Stats (expandable) */}
      {showDetails && (
        <div className="p-4 border-b border-gray-700 bg-gray-800/30">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Learning Progress</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Topics Discussed</span>
                  <span className="text-blue-400">{userProfile?.learningData?.topics?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Goals Tracked</span>
                  <span className="text-green-400">{userProfile?.learningData?.goals?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Daksha's Confidence</span>
                  <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300">
                    {Math.round((dakshaState?.confidence || 0.85) * 100)}%
                  </Badge>
                </div>
              </div>
            </div>

            {/* Top Topics */}
            {userProfile?.learningData?.topics?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Top Topics</h4>
                <div className="flex flex-wrap gap-1">
                  {userProfile.learningData.topics.slice(0, 3).map((topic, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-blue-500/20 text-blue-300"
                    >
                      {topic.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat History */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {Object.keys(groupedHistory).length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No conversation history yet</p>
              <p className="text-gray-600 text-xs mt-1">Start chatting with Daksha to see your history here</p>
            </div>
          ) : (
            Object.entries(groupedHistory)
              .reverse()
              .map(([date, messages]) => (
                <div key={date} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500 font-medium">{date}</span>
                  </div>

                  <div className="space-y-2">
                    {messages.map((message, index) => (
                      <Card
                        key={index}
                        className={`p-3 text-xs transition-all duration-200 hover:bg-gray-700/50 cursor-pointer ${message.role === 'user'
                            ? 'bg-purple-900/20 border-purple-700/50'
                            : 'bg-gray-800/50 border-gray-600/50'
                          }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {message.role === 'user' ? (
                            <User className="h-3 w-3 text-purple-400" />
                          ) : (
                            <Brain className="h-3 w-3 text-blue-400" />
                          )}
                          <span className="text-gray-400">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                          {message.mood && (
                            <Badge variant="outline" className="text-xs">
                              {message.mood}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-300 line-clamp-2">
                          {message.content.length > 80
                            ? message.content.substring(0, 80) + '...'
                            : message.content
                          }
                        </p>
                      </Card>
                    ))}
                  </div>

                  <Separator className="bg-gray-700/50" />
                </div>
              ))
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-700">
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllHistory}
          className="w-full text-red-400 border-red-500/30 hover:bg-red-500/10"
          disabled={totalMessages === 0}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All History
        </Button>
      </div>
    </div>
  );
}
