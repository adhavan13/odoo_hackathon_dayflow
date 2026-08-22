'use client';

import React, { useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange?: (dateString: string) => void;
  placeholder?: string;
  className?: string;
  formatString?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date...',
  className,
  formatString = 'dd-MM-yyyy',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedDate = value && isValid(parseISO(value)) ? parseISO(value) : undefined;

  const handleSelect = (date?: Date) => {
    if (date) {
      const formattedIso = format(date, 'yyyy-MM-dd');
      onChange?.(formattedIso);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-semibold text-xs h-9 px-3 gap-2 border-input bg-card text-foreground hover:bg-accent/10 hover:border-accent/40 hover:text-accent group transition-colors cursor-pointer shadow-2xs',
            !selectedDate && 'text-muted-foreground font-normal',
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 text-accent shrink-0 transition-colors" />
          <span className="text-foreground font-semibold group-hover:text-accent transition-colors">
            {selectedDate ? format(selectedDate, formatString) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-50 bg-popover border border-border shadow-xl rounded-xl" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
          className="rounded-xl border-none p-3"
        />
      </PopoverContent>
    </Popover>
  );
}
