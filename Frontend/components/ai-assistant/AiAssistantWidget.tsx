'use client';

import React, { useEffect, useRef } from 'react';
import { useAiAssistantStore } from '@/store/useAiAssistantStore';
import {
  MessageSquare,
  Send,
  X,
  Minus,
  Maximize2,
  Trash2,
  User,
  Clock,
  Calendar,
  CreditCard,
  Users,
  Database,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function AiAssistantWidget() {
  const {
    isOpen,
    isMinimized,
    messages,
    isLoading,
    inputQuery,
    toggleOpen,
    toggleMinimize,
    setInputQuery,
    sendMessage,
    fetchHistory,
    clearHistory,
  } = useAiAssistantStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, fetchHistory]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'attendance':
        return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
      case 'leave':
        return <Calendar className="h-3.5 w-3.5 text-muted-foreground" />;
      case 'payroll':
        return <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />;
      case 'employee':
        return <Users className="h-3.5 w-3.5 text-muted-foreground" />;
      default:
        return <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  // Trigger launcher button when closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleOpen}
          className="h-12 px-4 rounded-full bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border border-slate-700/40 dark:border-slate-300/40 flex items-center space-x-2 font-medium text-xs tracking-wide"
        >
          <MessageSquare className="h-4 w-4" />
          <span>HR Assistant</span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <Card
        className={`w-[380px] sm:w-[420px] shadow-xl border border-border bg-card text-card-foreground transition-all duration-200 overflow-hidden flex flex-col rounded-xl ${
          isMinimized ? 'h-[56px]' : 'h-[560px] max-h-[85vh]'
        }`}
      >
        {/* Classic Enterprise Header */}
        <div className="px-4 py-3 bg-muted/60 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center text-foreground shrink-0">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-xs tracking-tight text-foreground">Dayflow HR Assistant</h3>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Database className="h-2.5 w-2.5 mr-1" /> Live MongoDB
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">Real-time HR Knowledge Base</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {!isMinimized && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-md"
                      onClick={clearHistory}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">Clear Conversation</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-md"
              onClick={toggleMinimize}
            >
              {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-md"
              onClick={toggleOpen}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Body when expanded */}
        {!isMinimized && (
          <div className="flex-1 flex flex-col min-h-0 bg-background">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2.5 ${
                    msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 text-xs font-semibold ${
                      msg.sender === 'user'
                        ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 border border-slate-800'
                        : 'bg-muted border border-border text-foreground'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                  </div>

                  <div className="max-w-[85%] flex flex-col">
                    <div
                      className={`p-3 rounded-lg text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 font-sans'
                          : 'bg-card text-foreground border border-border shadow-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans">{msg.message}</div>
                    </div>

                    <div
                      className={`text-[10px] text-muted-foreground mt-1 flex items-center space-x-1 ${
                        msg.sender === 'user' ? 'justify-end pr-1' : 'pl-1'
                      }`}
                    >
                      {msg.category && getCategoryIcon(msg.category)}
                      <span className="capitalize">{msg.category || 'General'}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start space-x-2.5">
                  <div className="h-7 w-7 rounded-md bg-muted border border-border flex items-center justify-center shrink-0">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border text-xs text-muted-foreground flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-slate-400 animate-pulse"></div>
                    <span>Querying MongoDB database...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-border bg-card shrink-0">
              <div className="flex items-center space-x-2 bg-background rounded-lg p-1.5 border border-input focus-within:border-slate-500 transition-colors">
                <Search className="h-3.5 w-3.5 text-muted-foreground ml-1.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Ask any question from MongoDB database..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-0 px-1 py-1 text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={isLoading || !inputQuery.trim()}
                  size="icon"
                  className="h-7 w-7 rounded-md bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-slate-100 dark:text-slate-900 shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground px-1">
                <span>Press Enter to query MongoDB</span>
                <span>Dayflow Enterprise v1.0</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
