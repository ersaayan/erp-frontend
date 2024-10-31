'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input } from './input';

interface TagInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    placeholder?: string;
    tags?: string[];
    onTagsChange?: (tags: string[]) => void;
    className?: string;
}

export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
    ({ placeholder = 'Enter a value...', tags = [], onTagsChange, className, ...props }, ref) => {
        const [inputValue, setInputValue] = React.useState('');
        const inputRef = React.useRef<HTMLInputElement>(null);

        const addTag = (tag: string) => {
            const trimmedTag = tag.trim();
            if (trimmedTag && !tags.includes(trimmedTag)) {
                const newTags = [...tags, trimmedTag];
                onTagsChange?.(newTags);
                setInputValue('');
            }
        };

        const removeTag = (tagToRemove: string) => {
            const newTags = tags.filter(tag => tag !== tagToRemove);
            onTagsChange?.(newTags);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && inputValue) {
                e.preventDefault();
                addTag(inputValue);
            } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
                removeTag(tags[tags.length - 1]);
            }
        };

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setInputValue(e.target.value);
        };

        return (
            <div
                className={cn(
                    'flex flex-wrap gap-2 border rounded-md p-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                    className
                )}
                onClick={() => inputRef.current?.focus()}
            >
                {tags.map((tag, index) => (
                    <span
                        key={`${tag}-${index}`}
                        className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                    >
                        {tag}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeTag(tag);
                            }}
                        >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {tag}</span>
                        </Button>
                    </span>
                ))}
                <Input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="flex-1 !border-0 !ring-0 !ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[200px]"
                    placeholder={placeholder}
                    {...props}
                />
            </div>
        );
    }
);

TagInput.displayName = 'TagInput';