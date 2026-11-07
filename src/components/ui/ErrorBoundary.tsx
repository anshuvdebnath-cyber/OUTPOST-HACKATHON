import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { Button, buttonClasses } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Production Error Boundary that catches unexpected rendering errors
 * and presents an accessible frosted-glass recovery view.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Preserve structured diagnostic context without crashing the host shell
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.lastError = `${error.name}:${Boolean(errorInfo.componentStack)}`;
    }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="mx-auto flex min-h-[60dvh] max-w-xl items-center justify-center px-4 py-12"
        >
          <div className="card w-full p-8 text-center">
            <div className="glass-pill mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl text-ink">
              <AlertTriangle aria-hidden="true" className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-normal tracking-[-0.02em] text-ink">
              {this.props.fallbackTitle ?? 'Something went wrong'}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {this.state.error?.message ||
                'An unexpected error occurred while rendering this view. Your saved scholarships and profile data are safe.'}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button variant="secondary" onClick={this.handleReset}>
                <RotateCcw aria-hidden="true" className="h-4 w-4" /> Try again
              </Button>
              <a href="/dashboard" className={buttonClasses('primary')}>
                <Home aria-hidden="true" className="h-4 w-4" /> Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Route-level error fallback for React Router `errorElement`.
 */
export function RouteErrorFallback() {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="mx-auto flex min-h-[60dvh] max-w-xl items-center justify-center px-4 py-12"
    >
      <div className="card w-full p-8 text-center">
        <div className="glass-pill mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl text-ink">
          <AlertTriangle aria-hidden="true" className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-normal tracking-[-0.02em] text-ink">Unable to load this page</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          We encountered an unexpected navigation issue. Your saved applications and student profile remain intact.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href="/dashboard" className={buttonClasses('primary')}>
            <Home aria-hidden="true" className="h-4 w-4" /> Return to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

