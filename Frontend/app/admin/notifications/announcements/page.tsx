'use client';

import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/ui/page-container';
import { useAnnouncementStore, Announcement } from '@/store';
import {
  Plus,
  Pin,
  Calendar,
  User,
  Megaphone,
  Tag,
  Building2,
  Trash2,
  Send,
  X,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomSelect } from '@/components/ui/custom-select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { snackbar } from '@/utils/snackbar';

export default function AdminAnnouncementsPage() {
  const { announcements, fetchAnnouncements, addAnnouncement, deleteAnnouncement } = useAnnouncementStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'General' | 'HR Policy' | 'Urgent' | 'Event' | 'Holiday'>('General');
  const [department, setDepartment] = useState('All Departments');
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      snackbar.error('Please fill in both Announcement Title and Content.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addAnnouncement({
        title: title.trim(),
        content: content.trim(),
        category,
        department,
        authorName: 'Sarah Jenkins (HR Admin)',
        isPinned,
      });

      setIsModalOpen(false);
      setTitle('');
      setContent('');
      setCategory('General');
      setIsPinned(false);
    } catch (err: any) {
      snackbar.error('Failed to publish announcement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAnnouncements = announcements.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.content.toLowerCase().includes(search.toLowerCase())
  );

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
      title="Company Announcements Management"
      subtitle="Publish broadcasts, company notices, policy updates, and employee alerts"
      badge="Admin"
      action={
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold gap-1 px-4 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          CREATE ANNOUNCEMENT
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Top Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Total Broadcasts</p>
              <p className="text-2xl font-black text-foreground font-mono mt-1">{announcements.length}</p>
              <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">Live on employee portals</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <Megaphone className="h-5 w-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Pinned Notices</p>
              <p className="text-2xl font-black text-foreground font-mono mt-1">
                {announcements.filter((a) => a.isPinned).length}
              </p>
              <p className="text-[11px] font-medium text-accent mt-0.5">Highlighted at top</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <Pin className="h-5 w-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Urgent Alerts</p>
              <p className="text-2xl font-black text-foreground font-mono mt-1">
                {announcements.filter((a) => a.category === 'Urgent').length}
              </p>
              <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 mt-0.5">High priority notices</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Tag className="h-5 w-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">HR Policies</p>
              <p className="text-2xl font-black text-foreground font-mono mt-1">
                {announcements.filter((a) => a.category === 'HR Policy').length}
              </p>
              <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 mt-0.5">Official policy updates</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search active announcements by title or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-muted/20"
            />
          </div>
          <span className="text-xs text-muted-foreground font-mono font-bold hidden sm:inline">
            Showing {filteredAnnouncements.length} of {announcements.length} cards
          </span>
        </div>

        {/* Announcements Grid Card View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnouncements.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-border bg-card p-12 text-center space-y-3">
              <Megaphone className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
              <h3 className="text-base font-bold text-foreground">No Announcements Found</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                No announcement cards match your search. Click "+ CREATE ANNOUNCEMENT" to publish a new broadcast.
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
                  {/* Top Bar: Category Pill & Pin Indicator */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(
                        anc.category
                      )}`}
                    >
                      <Tag className="h-3 w-3" /> {anc.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {anc.isPinned && (
                        <span
                          className="h-6 w-6 rounded-full bg-accent/15 text-accent flex items-center justify-center border border-accent/30"
                          title="Pinned to top"
                        >
                          <Pin className="h-3.5 w-3.5 fill-current" />
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteAnnouncement(anc.id)}
                        className="h-7 w-7 rounded-full bg-muted/60 hover:bg-rose-500/15 hover:text-rose-500 text-muted-foreground flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete Announcement Card"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Title & Content */}
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-extrabold text-foreground line-clamp-2 leading-snug">{anc.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-4 leading-relaxed">{anc.content}</p>
                  </div>
                </div>

                {/* Footer Metadata */}
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

      {/* Admin Create Announcement Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-accent" />
              Publish New Announcement
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Broadcast an official notice, policy update, or urgent alert to company employees.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-bold">Announcement Title</Label>
              <Input
                placeholder="e.g. 📌 Q3 Townhall Meeting & Performance Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Category</Label>
                <CustomSelect
                  value={category}
                  onChange={(val) => setCategory(val as any)}
                  options={[
                    { value: 'General', label: 'General Announcement' },
                    { value: 'HR Policy', label: 'HR Policy Update' },
                    { value: 'Urgent', label: 'Urgent Alert' },
                    { value: 'Event', label: 'Company Event' },
                    { value: 'Holiday', label: 'Holiday Notice' },
                  ]}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Target Department</Label>
                <CustomSelect
                  value={department}
                  onChange={setDepartment}
                  options={[
                    { value: 'All Departments', label: 'All Departments' },
                    { value: 'Software Engineering', label: 'Software Engineering' },
                    { value: 'Human Resources', label: 'Human Resources' },
                    { value: 'Sales', label: 'Sales' },
                    { value: 'Product', label: 'Product' },
                    { value: 'Marketing', label: 'Marketing' },
                  ]}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold">Message Content</Label>
              <textarea
                placeholder="Write the full announcement description, meeting link, or instructions here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full text-xs text-foreground bg-muted/20 border border-border rounded-lg p-3 resize-none h-28 focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pin-announcement"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent accent-accent cursor-pointer"
              />
              <label htmlFor="pin-announcement" className="text-xs font-bold text-foreground cursor-pointer">
                Pin this announcement at the top of employee feeds
              </label>
            </div>

            <DialogFooter className="pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-accent text-accent-foreground text-xs font-bold gap-1 px-5">
                <Send className="h-3.5 w-3.5" /> {isSubmitting ? 'Publishing...' : 'Broadcast Announcement'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
