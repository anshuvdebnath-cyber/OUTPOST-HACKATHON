import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-ink text-surface shadow-card hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50',
  secondary:
    'glass-pill text-ink hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0',
  ghost:
    'text-ink-muted hover:bg-ink/10 hover:text-ink',
  danger:
    'bg-ink text-surface border border-ink/40 hover:opacity-85',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-xs gap-1.5',
  md: 'h-10 px-5 text-sm gap-2',
  lg: 'h-12 px-7 text-sm gap-2.5',
  icon: 'h-10 w-10 justify-center',
};

/** Accessible monochrome glass button with fluid motion. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-medium tracking-tight transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
});

/** Shared class list so <Link> elements can look like monochrome glass buttons. */
// eslint-disable-next-line react-refresh/only-export-components
export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className?: string): string {
  return cn(
    'inline-flex shrink-0 items-center justify-center rounded-full font-medium tracking-tight transition-all duration-300',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}
