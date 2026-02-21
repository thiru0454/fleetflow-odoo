import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  colorClass?: string;
  delay?: number;
}

export function KpiCard({ title, value, icon, trend, colorClass = 'text-primary', delay = 0 }: KpiCardProps) {
  return (
    <div
      className="kpi-card opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className={cn('text-3xl font-bold tracking-tight', colorClass)}>{value}</p>
          {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
        </div>
        <div className={cn('p-3 rounded-lg bg-secondary', colorClass)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
