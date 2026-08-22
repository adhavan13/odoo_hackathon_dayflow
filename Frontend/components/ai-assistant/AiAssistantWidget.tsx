'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAiAssistantStore } from '@/store/useAiAssistantStore';
import { useAuthStore } from '@/store/useAuthStore';
import {
  MessageSquare,
  Send,
  X,
  Trash2,
  Clock,
  Calendar,
  CreditCard,
  Users,
  Search,
  Sparkles,
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
    messages,
    isLoading,
    inputQuery,
    toggleOpen,
    setInputQuery,
    sendMessage,
    fetchHistory,
    clearHistory,
  } = useAiAssistantStore();

  const pathname = usePathname();
  const { user, role } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const isEmployee = pathname?.startsWith('/employee') || user?.role === 'employee' || role === 'employee';
  const assistantTitle = isEmployee ? 'User Assistant' : 'HR Assistant';
  const assistantSubtitle = isEmployee ? 'Personal AI Work Intelligence' : 'Enterprise HR Intelligence';

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Sync and stream chat messages
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
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, displayedMessages, isOpen]);

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

  const userAvatar = mounted && user?.avatarUrl ? user.avatarUrl : '/user.png';
  const userName = mounted && user?.name ? user.name : 'User';

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={toggleOpen}
                className="h-12 w-12 rounded-full bg-accent text-accent-foreground shadow-2xl hover:shadow-accent/40 hover:scale-110 transition-all duration-300 border border-accent/40 flex items-center justify-center p-0 cursor-pointer relative group"
              >
                {/* Dayflow Brand Logo Container */}
                <div className="h-7 w-7 rounded-full bg-card p-1 shadow-2xs flex items-center justify-center border border-border/60 overflow-hidden">
                  <img src="/logo.png" alt="Dayflow AI" className="h-full w-full object-contain" />
                </div>
                {/* Pulse Status Indicator Dot */}
                <span className="absolute top-0.5 right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs font-bold">
              {assistantTitle}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <Card className="w-[400px] sm:w-[460px] h-[580px] max-h-[85vh] shadow-2xl border border-border bg-card text-card-foreground transition-all duration-200 overflow-hidden flex flex-col rounded-3xl">
        {/* Dayflow Theme Header */}
        <div className="px-4 py-3.5 bg-accent text-accent-foreground border-b border-accent/30 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center space-x-3">
            {/* Odoo / Dayflow Logo Container */}
            <div className="relative h-9 w-9 rounded-2xl bg-card p-1 shadow-md border border-border flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Dayflow AI" className="h-full w-full object-contain" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-accent shadow-[0_0_6px_rgba(16,185,129,0.9)]"></span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <h3 className="font-extrabold text-xs tracking-tight text-accent-foreground">Dayflow {assistantTitle}</h3>
                <Sparkles className="h-3 w-3 text-accent-foreground/80" />
              </div>
              <p className="text-[10px] text-accent-foreground/85 font-medium">{assistantSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-accent-foreground/80 hover:text-accent-foreground hover:bg-accent-foreground/15 rounded-lg cursor-pointer transition-colors"
                    onClick={clearHistory}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Clear Conversation</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-accent-foreground/80 hover:text-accent-foreground hover:bg-accent-foreground/15 rounded-lg cursor-pointer transition-colors"
              onClick={toggleOpen}
              title="Close AI Assistant"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col min-h-0 bg-background">
          {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const textToRender = displayedMessages[msg.id] ?? msg.message;
                const isUser = msg.sender === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-2.5 ${
                      isUser ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    {/* Message Avatar */}
                    <div
                      className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-2xs border ${
                        isUser
                          ? 'bg-accent text-accent-foreground border-accent/40'
                          : 'bg-card border-border p-0.5'
                      }`}
                    >
                      {isUser ? (
                        <img
                          src={userAvatar}
                          alt={userName}
                          className="h-full w-full object-cover rounded-xl"
                          suppressHydrationWarning
                        />
                      ) : (
                        <img
                          src="/logo.png"
                          alt="Dayflow AI"
                          className="h-full w-full object-contain"
                        />
                      )}
                    </div>

                    <div className="max-w-[88%] flex flex-col">
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isUser
                            ? 'bg-accent text-accent-foreground font-sans shadow-xs'
                            : 'bg-card text-foreground border border-border shadow-2xs'
                        }`}
                      >
                        {isUser ? (
                          <div className="whitespace-pre-wrap font-medium">{textToRender}</div>
                        ) : (
                          <div className="prose prose-xs dark:prose-invert max-w-none text-foreground text-xs leading-relaxed space-y-2">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                table: ({ children }) => (
                                  <div className="my-2.5 overflow-x-auto rounded-xl border border-border bg-card">
                                    <table className="w-full text-left text-xs border-collapse">{children}</table>
                                  </div>
                                ),
                                thead: ({ children }) => (
                                  <thead className="bg-muted/80 border-b border-border font-bold text-foreground">
                                    {children}
                                  </thead>
                                ),
                                th: ({ children }) => <th className="p-2 border-r border-border font-bold text-foreground">{children}</th>,
                                td: ({ children }) => <td className="p-2 border-t border-r border-border/60 text-foreground">{children}</td>,
                                code: ({ children }) => (
                                  <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-[11px] text-foreground border border-border font-semibold">
                                    {children}
                                  </code>
                                ),
                                p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-1.5">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-1.5">{children}</ol>,
                                h3: ({ children }) => <h3 className="font-extrabold text-sm text-foreground mt-2 mb-1">{children}</h3>,
                                h4: ({ children }) => <h4 className="font-extrabold text-xs text-foreground mt-2 mb-1">{children}</h4>,
                              }}
                            >
                              {textToRender}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>

                      <div
                        className={`text-[10px] text-muted-foreground mt-1 flex items-center space-x-1 ${
                          isUser ? 'justify-end pr-1' : 'pl-1'
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
                  <div className="h-7 w-7 rounded-xl bg-card border border-border p-0.5 flex items-center justify-center shrink-0 shadow-2xs">
                    <img src="/logo.png" alt="Dayflow AI" className="h-full w-full object-contain" />
                  </div>
                  <div className="p-3 rounded-2xl bg-card border border-border text-xs text-muted-foreground flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse"></div>
                    <span className="font-medium text-foreground">{LOADING_PHRASES[loadingPhraseIndex]}</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-border bg-card shrink-0">
              <div className="flex items-center space-x-2 bg-muted/20 rounded-2xl p-1.5 border border-input focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
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
                  className="h-7 w-7 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shrink-0 cursor-pointer shadow-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }
