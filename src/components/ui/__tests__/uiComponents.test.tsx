import { fireEvent, render, screen } from '@testing-library/react';
import { Compass } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { EmptyState } from '../EmptyState';
import { ErrorBoundary } from '../ErrorBoundary';
import { PageHeader } from '../PageHeader';
import { ProgressBar } from '../ProgressBar';
import { SortDropdown } from '../SortDropdown';
import type { SortOption } from '../../../types/scholarship';

const SORT_OPTIONS: Record<SortOption, string> = {
  'best-match': 'Best match',
  deadline: 'Deadline (soonest)',
  'amount-high': 'Award (high → low)',
  'amount-low': 'Award (low → high)',
  newest: 'Deadline (latest)',
};

describe('UI Components', () => {
  it('renders PageHeader title and description accessibly', () => {
    render(<PageHeader title="Discover scholarships" description="Search every opportunity in one place." />);
    expect(screen.getByRole('heading', { level: 1, name: 'Discover scholarships' })).toBeInTheDocument();
    expect(screen.getByText('Search every opportunity in one place.')).toBeInTheDocument();
  });

  it('renders EmptyState with icon, title, and description', () => {
    render(<EmptyState icon={Compass} title="No results" description="Try broadening your filters." />);
    expect(screen.getByRole('heading', { level: 2, name: 'No results' })).toBeInTheDocument();
    expect(screen.getByText('Try broadening your filters.')).toBeInTheDocument();
  });

  it('renders ProgressBar with accessible progressbar role and value', () => {
    render(<ProgressBar value={75} label="Profile completeness" showValue />);
    const bar = screen.getByRole('progressbar', { name: 'Profile completeness' });
    expect(bar).toHaveAttribute('aria-valuenow', '75');
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('opens SortDropdown listbox and selects a new sort option', () => {
    const onChange = vi.fn();
    render(<SortDropdown value="best-match" onChange={onChange} options={SORT_OPTIONS} />);

    const trigger = screen.getByRole('button', { name: /Sort by: Best match/i });
    fireEvent.click(trigger);

    const listbox = screen.getByRole('listbox', { name: 'Sort options' });
    expect(listbox).toBeInTheDocument();

    const deadlineOption = screen.getByRole('option', { name: 'Deadline (soonest)' });
    fireEvent.click(deadlineOption.querySelector('button') ?? deadlineOption);

    expect(onChange).toHaveBeenCalledWith('deadline');
  });

  it('catches rendering errors in ErrorBoundary and displays recovery UI', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Thrower = () => {
      throw new Error('Test render crash');
    };

    render(
      <ErrorBoundary fallbackTitle="Custom Error Heading">
        <Thrower />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Custom Error Heading')).toBeInTheDocument();
    expect(screen.getByText('Test render crash')).toBeInTheDocument();
    spy.mockRestore();
  });
});

