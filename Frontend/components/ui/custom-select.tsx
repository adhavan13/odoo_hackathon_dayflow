'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SelectOption {
  label: string;
  value: string;
}

export interface CustomSelectProps {
  value: string;
  onValueChange?: (val: string) => void;
  onChange?: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'default';
}

export function CustomSelect({
  value,
  onValueChange,
  onChange,
  options,
  placeholder = 'Select option...',
  className = 'w-full text-xs h-9',
  size = 'default',
}: CustomSelectProps) {
  const handleValueChange = (val: string) => {
    onValueChange?.(val);
    onChange?.(val);
  };

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger size={size} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="z-50 bg-popover border border-border shadow-md rounded-xl text-xs">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="cursor-pointer text-xs focus:bg-accent focus:text-accent-foreground">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
