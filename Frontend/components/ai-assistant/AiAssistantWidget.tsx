'use client';

import React, { useEffect, useRef } from 'react';
import { useAiAssistantStore } from '@/store/useAiAssistantStore';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  User,
  Calendar,
  DollarSign,
  Clock,
  Users,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function AiAssistantWidget() {
  const {
    isOpen,
    isMinimized,
    messages,
    suggestions,
    isLoading,
    inputQuery,
    toggleOpen,
    toggleMinimize,
    setInputQuery,
    sendMessage,
    fetchSuggestions,
    fetchHistory,
    clearHistory,
  } = useAiAssistantStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
      fetchHistory();
    }
  }, [isOpen, fetchSuggestions, fetchHistory]);

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
        return <Clock className="h-3.5 w-3.5 text-amber-500" />;
      case 'leave':
        return <Calendar className="h-3.5 w-3.5 text-blue-500" />;
      case 'payroll':
        return <DollarSign className="h-3.5 w-3.5 text-emerald-500" />;
      case 'employee':
        return <Users className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return <Sparkles className="h-3.5 w-3.5 text-primary" />;
    }
  };

  if (!isOpen) {
    return (
      <TooltipProvider>
        <div className="fixed bottom-6 right-6 z-50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={toggleOpen}
                size="icon"
                className="h-14 w-14 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 shadow-2xl hover:scale-105 hover:shadow-violet-500/25 transition-all duration-300 border-2 border-white/20 relative group"
              >
                <Bot className="h-7 w-7 text-white group-hover:rotate-12 transition-transform duration-300" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-background"></span>
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="font-semibold text-xs bg-popover text-popover-foreground shadow-lg border">
              Dayflow HR AI Assistant
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <Card
        className={`w-[380px] sm:w-[420px] shadow-2xl border-primary/20 backdrop-blur-xl bg-card/95 transition-all duration-300 overflow-hidden flex flex-col ${
          isMinimized ? 'h-[64px]' : 'h-[580px] max-h-[85vh]'
        }`}
      >
        {/* Header */}
        <div className="p-3.5 bg-gradient-to-r from-violet-900/90 via-purple-900/90 to-slate-900/90 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center shadow-inner">
              <Bot className="h-5 w-5 text-violet-300" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-semibold text-sm tracking-wide text-white">Dayflow HR Assistant</h3>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-violet-400/40 text-violet-200 bg-violet-500/10">
                  <Sparkles className="h-2.5 w-2.5 mr-0.5" /> AI Powered
                </Badge>
              </div>
              <p className="text-[11px] text-violet-200/80 flex items-center space-x-1">
                <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                <span>MongoDB HR Intelligence Connected</span>
              </p>
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
                      className="h-7 w-7 text-violet-200 hover:text-white hover:bg-white/10 rounded-lg"
                      onClick={clearHistory}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear Chat</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-violet-200 hover:text-white hover:bg-white/10 rounded-lg"
              onClick={toggleMinimize}
            >
              {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-violet-200 hover:text-white hover:bg-white/10 rounded-lg"
              onClick={toggleOpen}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Area when expanded */}
        {!isMinimized && (
          <div className="flex-1 flex flex-col min-h-0 bg-background/50">
            {/* Quick Prompt Pills */}
            {suggestions.length > 0 && messages.length <= 2 && (
              <div className="p-3 border-b bg-muted/30 shrink-0">
                <div className="text-[11px] font-medium text-muted-foreground mb-2 flex items-center justify-between">
                  <span>Quick HR Queries</span>
                  <span className="text-[10px] text-violet-500 font-semibold">Click to ask</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                  {suggestions.map((sugg) => (
                    <button
                      key={sugg.id}
                      onClick={() => sendMessage(sugg.query)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-background border hover:border-violet-500/50 hover:bg-violet-500/10 text-foreground transition-all duration-200 flex items-center space-x-1 shadow-sm text-left"
                    >
                      {getCategoryIcon(sugg.category)}
                      <span className="truncate max-w-[170px]">{sugg.label}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2 ${
                    msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-gradient-to-tr from-violet-600 to-purple-600 text-white shadow'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>

                  <div className="max-w-[82%] flex flex-col">
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-xs'
                          : 'bg-muted/80 text-foreground border border-border/50 rounded-tl-xs backdrop-blur-sm'
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
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start space-x-2">
                  <div className="h-7 w-7 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="p-3 rounded-2xl bg-muted/80 border border-border/50 rounded-tl-xs text-xs text-muted-foreground flex items-center space-x-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-violet-500" />
                    <span>Analyzing MongoDB context...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t bg-card shrink-0">
              <div className="flex items-center space-x-2 bg-muted/40 rounded-xl p-1.5 border border-input focus-within:border-violet-500 transition-colors">
                <input
                  type="text"
                  placeholder="Ask HR Assistant (Attendance, Leave, Payroll...)..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-0 px-2 py-1 text-xs focus:outline-none placeholder:text-muted-foreground"
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={isLoading || !inputQuery.trim()}
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground px-1">
                <span>Press Enter to send</span>
                <span className="text-violet-500 font-medium">Dayflow AI v1.0</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
