import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonLoaderProps {
  type: 'card' | 'table' | 'map' | 'dashboard' | 'modal';
  rows?: number;
}

export const SkeletonLoader = ({ type, rows = 5 }: SkeletonLoaderProps) => {
  switch (type) {
    case 'card':
      return <CardSkeleton />;
    case 'table':
      return <TableSkeleton rows={rows} />;
    case 'map':
      return <MapSkeleton />;
    case 'dashboard':
      return <DashboardSkeleton />;
    case 'modal':
      return <ModalSkeleton />;
    default:
      return <CardSkeleton />;
  }
};

export const CardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    ))}
  </div>
);

export const MapSkeleton = () => (
  <div className="w-full h-full bg-muted animate-pulse rounded-lg" />
);

export const DashboardSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <Skeleton className="h-64" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton className="h-48" />
      <Skeleton className="h-48" />
    </div>
  </div>
);

export const ModalSkeleton = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <div className="w-full max-w-2xl max-h-[90vh] bg-card border border-border rounded-lg p-6 space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-64 w-full" />
      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  </div>
);
