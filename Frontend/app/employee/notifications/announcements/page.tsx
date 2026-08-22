'use client';

import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { useAnnouncementStore, Announcement } from '@/store';
import {
  Bell,
  Search,
  Pin,
  Calendar,
  User,
  Megaphone,
  AlertTriangle,
  FileText,
  Sparkles,
  Building2,
  Tag,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function EmployeeAnnouncementsPage() {
  const { announcements, fetchAnnouncements } = useAnnouncementStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase()) ||
      a.authorName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' ? true : a.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Urgent':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'HR Policy':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'Event':
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30';
      default:
        return 'bg-accent/15 text-accent border-accent/30';
    }
  };

  return (
    <PageContainer
      title="Company Announcements"
      subtitle="Official enterprise broadcasts, policy updates, and company-wide notices"
      badge="Notifications"
    >
      <div className="space-y-6">
        {/* Top Search & Filter Bar */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search announcements by title, content, or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-muted/20"
            />
          </div>

          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border text-xs flex-wrap">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'Urgent', label: 'Urgent' },
              { id: 'HR Policy', label: 'HR Policy' },
              { id: 'Event', label: 'Events' },
              { id: 'General', label: 'General' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-card text-accent shadow-xs border border-accent/20'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Announcements Grid Card View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnouncements.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-border bg-card p-12 text-center space-y-3">
              <Megaphone className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
              <h3 className="text-base font-bold text-foreground">No Announcements Found</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                No company announcements match your current filter criteria. Check back later for official broadcasts.
              </p>
            </div>
          ) : (
            filteredAnnouncements.map((anc) => (
              <div
                key={anc.id}
                className={`rounded-2xl border bg-card p-5 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 ${
                  anc.isPinned
                    ? 'border-accent/50 bg-gradient-to-b from-accent/10 via-card to-card'
                    : 'border-border'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Category & Pin Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(
                        anc.category
                      )}`}
                    >
                      <Tag className="h-3 w-3" /> {anc.category}
                    </span>

                    {anc.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-accent bg-accent/15 px-2 py-0.5 rounded-full border border-accent/30">
                        <Pin className="h-3 w-3 fill-current" /> PINNED
                      </span>
                    )}
                  </div>

                  {/* Title & Body */}
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-extrabold text-foreground line-clamp-2 leading-snug">{anc.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-4 leading-relaxed">{anc.content}</p>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-medium truncate">
                    <User className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span className="truncate">{anc.authorName}</span>
                  </div>

                  <span className="font-mono text-[10px] bg-muted/60 px-2 py-0.5 rounded border border-border shrink-0">
                    {anc.createdAt}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageContainer>
  );
}
