import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

/** Editorial geometric heading inside a frosted glass header card. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="card mb-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
      <div>
        <h1 className="text-3xl font-light tracking-[-0.03em] text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
