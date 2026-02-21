import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  type?: 'card' | 'table' | 'list' | 'chart';
  count?: number;
  className?: string;
}

export function SkeletonLoader({
  type = 'card',
  count = 1,
  className,
}: SkeletonLoaderProps) {
  const skeletons = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className={cn('space-y-4', className)}>
        {skeletons.map((_, i) => (
          <div key={i} className="glass-card p-6 space-y-4 animate-pulse">
            <div className="skeleton skeleton-line w-3/4" />
            <div className="skeleton skeleton-line w-full" />
            <div className="skeleton skeleton-line w-5/6" />
            <div className="flex gap-2 pt-2">
              <div className="skeleton rounded h-10 w-24" />
              <div className="skeleton rounded h-10 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={cn('glass-card overflow-hidden', className)}>
        <div className="animate-pulse">
          {/* Header */}
          <div className="flex gap-4 p-4 border-b border-border/50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton skeleton-line flex-1" />
            ))}
          </div>
          {/* Rows */}
          {skeletons.map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border-b border-border/30">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="skeleton skeleton-line flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={cn('space-y-2', className)}>
        {skeletons.map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 glass-card animate-pulse"
          >
            <div className="skeleton skeleton-avatar" />
            <div className="flex-1 space-y-2">
              <div className="skeleton skeleton-line w-40" />
              <div className="skeleton skeleton-line w-32" />
            </div>
            <div className="skeleton rounded h-10 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className={cn('glass-card p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="skeleton skeleton-line w-1/3" />
          <div className="h-64 skeleton rounded-lg" />
          <div className="flex justify-around">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="skeleton skeleton-line w-16 mx-auto" />
                <div className="skeleton skeleton-line w-20 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
