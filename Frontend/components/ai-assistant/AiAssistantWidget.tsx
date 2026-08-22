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
        return <Clock className="h-3.5 w-3.5 text-accent" />;
      case 'leave':
        return <Calendar className="h-3.5 w-3.5 text-accent" />;
      case 'payroll':
        return <DollarSign className="h-3.5 w-3.5 text-accent" />;
      case 'employee':
        return <Users className="h-3.5 w-3.5 text-accent" />;
      default:
        return <Sparkles className="h-3.5 w-3.5 text-accent" />;
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
                className="h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-2xl hover:scale-105 hover:bg-accent/90 transition-all duration-300 border-2 border-white/20 relative group cursor-pointer"
              >
                <Bot className="h-7 w-7 group-hover:rotate-12 transition-transform duration-300" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-background"></span>
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="font-semibold text-xs bg-popover text-popover-foreground shadow-lg border">
              Dayflow HR Assistant
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <Card
        className={`w-[380px] sm:w-[420px] shadow-2xl border-accent/30 backdrop-blur-xl bg-card transition-all duration-300 overflow-hidden flex flex-col ${
          isMinimized ? 'h-[64px]' : 'h-[580px] max-h-[85vh]'
        }`}
      >
        {/* Dayflow Theme Header */}
        <div className="p-3.5 bg-accent text-accent-foreground flex items-center justify-between border-b border-accent/20 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shadow-inner">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-sm tracking-wide text-white">Dayflow HR Assistant</h3>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-white/40 text-white bg-white/15 font-semibold">
                  <Sparkles className="h-2.5 w-2.5 mr-0.5 text-white" /> AI Powered
                </Badge>
              </div>
              <p className="text-[11px] text-white/80 flex items-center space-x-1 font-medium">
                <ShieldCheck className="h-3 w-3 text-emerald-300 shrink-0" />
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
                      className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/15 rounded-lg cursor-pointer"
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
              className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/15 rounded-lg cursor-pointer"
              onClick={toggleMinimize}
            >
              {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/15 rounded-lg cursor-pointer"
              onClick={toggleOpen}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Area when expanded */}
        {!isMinimized && (
          <div className="flex-1 flex flex-col min-h-0 bg-background">
            {/* Quick Prompt Pills */}
            {suggestions.length > 0 && messages.length <= 2 && (
              <div className="p-3 border-b border-border/60 bg-muted/30 shrink-0">
                <div className="text-[11px] font-bold text-muted-foreground mb-2 flex items-center justify-between">
                  <span>Quick HR Queries</span>
                  <span className="text-[10px] text-accent font-semibold">Click to ask</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                  {suggestions.map((sugg) => (
                    <button
                      key={sugg.id}
                      onClick={() => sendMessage(sugg.query)}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-card border border-border hover:border-accent/50 hover:bg-accent/10 text-foreground transition-all duration-200 flex items-center space-x-1 shadow-2xs text-left cursor-pointer"
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
                    className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-foreground border border-border'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5 text-accent" />}
                  </div>

                  <div className="max-w-[82%] flex flex-col">
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-accent text-accent-foreground rounded-tr-xs font-medium'
                          : 'bg-card text-foreground border border-border/80 rounded-tl-xs'
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
                  <div className="h-7 w-7 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="p-3 rounded-2xl bg-card border border-border/80 rounded-tl-xs text-xs text-muted-foreground flex items-center space-x-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-accent" />
                    <span>Analyzing MongoDB HR Intelligence context...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-border bg-card shrink-0">
              <div className="flex items-center space-x-2 bg-muted/30 rounded-xl p-1.5 border border-input focus-within:border-accent transition-colors">
                <input
                  type="text"
                  placeholder="Ask HR Assistant (Attendance, Leave, Payroll...)..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-0 px-2 py-1 text-xs focus:outline-none placeholder:text-muted-foreground text-foreground"
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={isLoading || !inputQuery.trim()}
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm shrink-0 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground px-1">
                <span>Press Enter to send query</span>
                <span className="text-accent font-bold">Dayflow AI v1.0</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
