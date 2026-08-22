'use client';

import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const LOADING_PHRASES = [
  'Looking into the data...',
  'Gathering workspace records...',
  'Analyzing HR records...',
  'Retrieving employee details...',
];

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
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<Record<string, string>>({});

  // Cycle loading phrases dynamically
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
      }, 1400);
    } else {
      setLoadingPhraseIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Stream newest assistant message text
  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, fetchHistory]);

  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.sender === 'user') {
        setDisplayedMessages((prev) => ({ ...prev, [msg.id]: msg.message }));
      } else if (!displayedMessages[msg.id]) {
        // Stream text for new assistant messages
        const fullText = msg.message;
        let currentLen = 0;
        const speed = Math.max(8, Math.floor(2500 / Math.max(fullText.length, 1)));

        const timer = setInterval(() => {
          currentLen += Math.min(6, fullText.length - currentLen);
          setDisplayedMessages((prev) => ({
            ...prev,
            [msg.id]: fullText.slice(0, currentLen),
          }));
          if (currentLen >= fullText.length) {
            clearInterval(timer);
          }
        }, speed);
      }
    });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, displayedMessages, isOpen, isMinimized]);

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
        return <Users className="h-3.5 w-3.5 text-muted-foreground" />;
      default:
        return <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

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
        className={`w-[400px] sm:w-[460px] shadow-2xl border border-border bg-card text-card-foreground transition-all duration-200 overflow-hidden flex flex-col rounded-xl ${
          isMinimized ? 'h-[56px]' : 'h-[580px] max-h-[85vh]'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-muted/60 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center text-foreground shrink-0">
              <MessageSquare className="h-4 w-4" />
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

        {/* Content Body */}
        {!isMinimized && (
          <div className="flex-1 flex flex-col min-h-0 bg-background">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const textToRender = displayedMessages[msg.id] ?? msg.message;

                return (
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

                    <div className="max-w-[88%] flex flex-col">
                      <div
                        className={`p-3.5 rounded-lg text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 font-sans'
                            : 'bg-card text-foreground border border-border shadow-xs'
                        }`}
                      >
                        {msg.sender === 'user' ? (
                          <div className="whitespace-pre-wrap font-sans">{textToRender}</div>
                        ) : (
                          <div className="prose prose-xs dark:prose-invert max-w-none text-foreground text-xs leading-relaxed space-y-2">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                table: ({ children }) => (
                                  <div className="my-2.5 overflow-x-auto rounded-lg border border-border bg-card">
                                    <table className="w-full text-left text-xs border-collapse">{children}</table>
                                  </div>
                                ),
                                thead: ({ children }) => (
                                  <thead className="bg-muted/80 border-b border-border font-semibold text-foreground">
                                    {children}
                                  </thead>
                                ),
                                th: ({ children }) => <th className="p-2 border-r border-border font-semibold text-foreground">{children}</th>,
                                td: ({ children }) => <td className="p-2 border-t border-r border-border/60 text-foreground">{children}</td>,
                                code: ({ children }) => (
                                  <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-[11px] text-foreground border border-border font-semibold">
                                    {children}
                                  </code>
                                ),
                                p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-1.5">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-1.5">{children}</ol>,
                                h3: ({ children }) => <h3 className="font-semibold text-sm text-foreground mt-2 mb-1">{children}</h3>,
                                h4: ({ children }) => <h4 className="font-semibold text-xs text-foreground mt-2 mb-1">{children}</h4>,
                              }}
                            >
                              {textToRender}
                            </ReactMarkdown>
                          </div>
                        )}
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
                );
              })}

              {isLoading && (
                <div className="flex items-start space-x-2.5">
                  <div className="h-7 w-7 rounded-md bg-muted border border-border flex items-center justify-center shrink-0">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border text-xs text-muted-foreground flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-slate-500 animate-pulse"></div>
                    <span className="font-medium text-foreground">{LOADING_PHRASES[loadingPhraseIndex]}</span>
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
                  placeholder="Ask a question..."
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
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
