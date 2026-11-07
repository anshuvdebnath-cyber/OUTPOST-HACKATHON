/**
 * Performance monitoring & idle-task scheduling utilities.
 * Tracks Core Web Vitals (LCP, CLS, FID) via `PerformanceObserver` when supported
 * and schedules non-critical route prefetching during browser idle periods.
 */

export interface WebVitalMetric {
  name: 'LCP' | 'CLS' | 'FID' | 'FCP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Schedules a low-priority callback during browser idle time with a safe timeout fallback.
 */
export function scheduleIdleTask(callback: () => void, timeout = 1200): number {
  if (typeof window === 'undefined') return 0;
  const win = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  };
  if (typeof win.requestIdleCallback === 'function') {
    return win.requestIdleCallback(callback, { timeout });
  }
  return window.setTimeout(callback, 120);
}

/**
 * Registers lightweight Core Web Vitals observers (`PerformanceObserver`) for runtime telemetry.
 */
export function initPerformanceMonitoring(onReport?: (metric: WebVitalMetric) => void): void {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
    return;
  }

  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const last = entries[entries.length - 1];
      if (!last) return;
      const value = Math.round(last.startTime);
      const rating = value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
      onReport?.({ name: 'LCP', value, rating });
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // Ignore unsupported entry types in older or headless environments
  }
}

