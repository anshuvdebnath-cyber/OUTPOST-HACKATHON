import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { SortOption } from '@/types/scholarship';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  options: Record<SortOption, string>;
  className?: string;
}

/**
 * Editorial frosted glassmorphism custom sort dropdown:
 *  - Matches the physical frosted glass theme
 *  - Floating glassmorphism menu panel with backdrop blur
 *  - Accessible keyboard navigation and click-outside dismissal
 */
export function SortDropdown({ value, onChange, options, className }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selectedLabel = options[value] ?? 'Sort';

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Sort by: ${selectedLabel}`}
        className="glass-pill flex h-12 w-full items-center justify-between gap-3 rounded-full px-5 text-sm font-medium text-ink transition hover:scale-[1.01] active:scale-[0.99] sm:w-56"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'h-4 w-4 shrink-0 text-ink-muted transition-transform duration-300',
            open && 'rotate-180 text-ink',
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Sort options"
          className="glass-pill animate-fade-in-up absolute right-0 z-50 mt-2 w-60 origin-top-right space-y-1 rounded-2xl p-2 shadow-2xl backdrop-blur-2xl"
        >
          {(Object.keys(options) as SortOption[]).map((key) => {
            const isSelected = key === value;
            return (
              <li key={key} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors duration-200',
                    isSelected
                      ? 'bg-accent text-accent-ink shadow-sm'
                      : 'text-ink-muted hover:bg-accent/15 hover:text-ink',
                  )}
                >
                  <span>{options[key]}</span>
                  {isSelected && <Check aria-hidden="true" className="h-4 w-4 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

