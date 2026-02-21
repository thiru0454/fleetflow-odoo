import { useState, useEffect } from 'react';

interface ExportOptions {
  format: 'csv' | 'pdf' | 'json';
  dateRange?: { start: Date; end: Date };
  includeMetrics?: string[];
}

/**
 * Enhanced Export & Reporting Hook
 * Handles CSV, JSON exports with animations and progress tracking
 */
export function useExportData() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportToCSV = async (data: unknown[], filename: string) => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 500));
      setExportProgress(30);

      // Convert to CSV
      const csv = convertToCSV(data);
      setExportProgress(70);

      // Download
      await downloadFile(csv, `${filename}.csv`, 'text/csv');
      setExportProgress(100);

      // Reset after brief delay
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const exportToJSON = async (data: unknown, filename: string) => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setExportProgress(50);

      const json = JSON.stringify(data, null, 2);
      await downloadFile(json, `${filename}.json`, 'application/json');

      setExportProgress(100);
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return {
    isExporting,
    exportProgress,
    exportToCSV,
    exportToJSON,
  };
}

function convertToCSV(data: unknown[]): string {
  if (!Array.isArray(data) || data.length === 0) return '';

  const headers = Object.keys(data[0] as Record<string, unknown>);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const value = (row as Record<string, unknown>)[header];
        return typeof value === 'string' && value.includes(',')
          ? `"${value}"`
          : String(value ?? '');
      })
      .join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

async function downloadFile(
  content: string,
  filename: string,
  type: string
): Promise<void> {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Enhanced Animations Hook
 * Provides utilities for complex animations
 */
export function useAnimations() {
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerAnimation = async (duration: number = 300) => {
    setIsAnimating(true);
    await new Promise((resolve) => setTimeout(resolve, duration));
    setIsAnimating(false);
  };

  return { isAnimating, triggerAnimation };
}

/**
 * Data Loading State Hook
 * Manages loading states with animations
 */
export function useDataLoader<T>(
  fetchFn: () => Promise<T>,
  dependencies: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error, refetch: () => fetchFn() };
}

/**
 * Smooth Number Counter Hook
 * Animates numbers counting up
 */
export function useCountUp(
  target: number,
  duration: number = 1000
): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    let timer: NodeJS.Timeout;
    const increment = target / (duration / 50);

    const counter = () => {
      start += increment;
      if (start >= target) {
        setCount(target);
      } else {
        setCount(Math.floor(start));
        timer = setTimeout(counter, 50);
      }
    };

    counter();
    return () => clearTimeout(timer);
  }, [target, duration]);

  return count;
}
