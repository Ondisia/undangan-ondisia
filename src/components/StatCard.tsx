import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  className,
  delay = 0 
}: StatCardProps) {
  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card transition-all duration-300 hover:shadow-elegant hover:border-gold/30",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 sm:space-y-2 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
            {value}
          </p>
          {description && (
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{description}</p>
          )}
          {trend && (
            <p className={cn(
              "text-[10px] sm:text-xs font-medium",
              trend.isPositive ? "text-green-600" : "text-red-500"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}% dari bulan lalu
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-champagne transition-colors group-hover:bg-gold/20 flex-shrink-0">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-gold" />
        </div>
      </div>
      
      {/* Decorative gradient */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-gold/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
