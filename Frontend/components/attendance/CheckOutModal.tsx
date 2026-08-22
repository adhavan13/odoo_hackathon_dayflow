'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Clock, LogOut, FileText, CheckCircle2 } from 'lucide-react';
import { useAttendanceStore } from '@/store';
import { snackbar } from '@/utils/snackbar';

interface CheckOutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckOutModal({ isOpen, onClose }: CheckOutModalProps) {
  const { checkOut, checkInTimestamp, isLoading } = useAttendanceStore();
  const [workSummary, setWorkSummary] = useState('');
  const [elapsedText, setElapsedText] = useState('00h 00m 00s');

  useEffect(() => {
    if (checkInTimestamp) {
      const diffMs = Math.max(0, Date.now() - checkInTimestamp);
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const hh = String(hours).padStart(2, '0');
      const mm = String(minutes).padStart(2, '0');
      const ss = String(seconds).padStart(2, '0');
      setElapsedText(`${hh}h ${mm}m ${ss}s`);
    } else {
      setElapsedText('Active Shift');
    }
  }, [checkInTimestamp, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workSummary.trim() || workSummary.trim().length < 5) {
      snackbar.error('Please enter a brief summary of your work done today (at least 5 characters).');
      return;
    }

    try {
      await checkOut(workSummary.trim());
      setWorkSummary('');
      onClose();
    } catch (err: any) {
      snackbar.error('Failed to complete check-out.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl">
        <DialogHeader className="space-y-2 border-b border-border/60 pb-4">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center border border-rose-500/30">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-emerald-500 animate-spin" />
              Worked: {elapsedText}
            </span>
          </div>

          <DialogTitle className="text-xl font-black tracking-tight text-foreground">
            End Shift & Check-Out
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Please submit a summary note of your deliverables and key tasks completed during today's shift before checking out.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-3">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-accent" />
              Work Summary & Daily Deliverables <span className="text-rose-500">*</span>
            </Label>
            <textarea
              required
              rows={4}
              value={workSummary}
              onChange={(e) => setWorkSummary(e.target.value)}
              placeholder="Example: Completed sprint user stories, fixed header navigation bug, attended team sync meeting..."
              className="w-full rounded-2xl border border-input bg-muted/20 p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all shadow-2xs resize-none"
            />
            <p className="text-[11px] text-muted-foreground">
              This summary note will be submitted directly to HR & Management for daily work verification.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs hover:bg-muted text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700 font-extrabold text-xs gap-1.5 px-5 cursor-pointer shadow-md"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isLoading ? 'Checking Out...' : 'Submit & Check-Out'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
