import { cn } from '@/lib/utils';

type StatusVariant = 'available' | 'on-trip' | 'maintenance' | 'in-shop' | 'retired' |
  'draft' | 'dispatched' | 'completed' | 'cancelled' |
  'new' | 'in-progress' |
  'on-duty' | 'off-duty' | 'suspended' |
  'approved' | 'pending';

const variantMap: Record<StatusVariant, string> = {
  available: 'status-available',
  'on-trip': 'status-on-trip',
  maintenance: 'status-maintenance',
  'in-shop': 'status-maintenance',
  retired: 'status-draft',
  draft: 'status-draft',
  dispatched: 'status-dispatched',
  completed: 'status-completed',
  cancelled: 'status-cancelled',
  new: 'status-dispatched',
  'in-progress': 'status-on-trip',
  'on-duty': 'status-available',
  'off-duty': 'status-draft',
  suspended: 'status-suspended',
  approved: 'status-completed',
  pending: 'status-on-trip',
};

function toVariant(status: string): StatusVariant {
  return status.toLowerCase().replace(/ /g, '-') as StatusVariant;
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const variant = toVariant(status);
  return (
    <span className={cn('status-pill', variantMap[variant] || 'status-draft', className)}>
      {status}
    </span>
  );
}
