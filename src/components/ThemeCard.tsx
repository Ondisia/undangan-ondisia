import { Check, Eye, Lock } from 'lucide-react';
import { Theme } from '@/types/invitation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ThemeCardProps {
  theme: Theme;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onPreview: (theme: Theme) => void;
  delay?: number;
  isAssigned?: boolean;
}

const categoryLabels: Record<Theme['category'], string> = {
  elegant: 'Elegan',
  modern: 'Modern',
  rustic: 'Rustic',
  minimalist: 'Minimalis',
  floral: 'Floral',
};

export function ThemeCard({ theme, isSelected, onSelect, onPreview, delay = 0, isAssigned = false }: ThemeCardProps) {
  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl border-2 bg-card shadow-card transition-all duration-300",
        isSelected 
          ? "border-gold shadow-elegant" 
          : "border-transparent hover:border-gold/30 hover:shadow-elegant"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={theme.thumbnail}
          alt={theme.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Preview button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            variant="gold"
            size="sm"
            onClick={() => onPreview(theme)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>

        {/* Selected badge */}
        {isSelected && (
          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-gold text-primary-foreground shadow-lg">
            <Check className="h-5 w-5" />
          </div>
        )}

        {/* Assigned badge */}
        {isAssigned && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-500/90 text-white px-3 py-1 text-xs font-medium shadow-lg">
            <Lock className="h-3 w-3" />
            Ditentukan
          </div>
        )}

        {/* Category badge */}
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
            {categoryLabels[theme.category]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          {theme.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {theme.description}
        </p>
        
        <Button
          variant={isSelected ? "gold" : "goldOutline"}
          size="sm"
          className="mt-4 w-full"
          onClick={() => onSelect(theme.id)}
          disabled={isAssigned}
        >
          {isAssigned ? 'Tema Ditentukan' : isSelected ? 'Tema Aktif' : 'Pilih Tema'}
        </Button>
      </div>
    </div>
  );
}
