import { useState } from 'react';
import { Theme } from '@/types/invitation';
import { ThemeCard } from './ThemeCard';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ThemeGalleryProps {
  themes: Theme[];
  selectedThemeId: string;
  onSelectTheme: (id: string) => void;
  assignedThemeId?: string | null;
}

const categories = [
  { id: 'all', label: 'Semua' },
  { id: 'elegant', label: 'Elegan' },
  { id: 'modern', label: 'Modern' },
  { id: 'floral', label: 'Floral' },
  { id: 'rustic', label: 'Rustic' },
  { id: 'minimalist', label: 'Minimalis' },
];

export function ThemeGallery({ themes, selectedThemeId, onSelectTheme, assignedThemeId }: ThemeGalleryProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);

  // If user has assigned theme, show only that theme
  const themesToDisplay = assignedThemeId
    ? themes.filter(t => t.id === assignedThemeId)
    : themes;

  const filteredThemes = activeCategory === 'all'
    ? themesToDisplay
    : themesToDisplay.filter(theme => theme.category === activeCategory);

  const assignedTheme = assignedThemeId 
    ? themes.find(t => t.id === assignedThemeId)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          {assignedThemeId ? 'Tema Anda' : 'Pilih Tema Undangan'}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          {assignedThemeId 
            ? 'Berikut adalah tema yang telah ditentukan untuk Anda oleh admin.' 
            : 'Pilih tema yang sesuai dengan gaya acara Anda.'}
        </p>
      </div>

      {/* Show alert if user has assigned theme */}
      {assignedThemeId && assignedTheme && (
        <Alert className="border-gold/30 bg-gold/5">
          <AlertCircle className="h-4 w-4 text-gold" />
          <AlertDescription className="text-gold">
            Admin telah menentukan tema <strong>{assignedTheme.name}</strong> untuk Anda.
          </AlertDescription>
        </Alert>
      )}

      {/* Category Filter - Only show if no assigned theme */}
      {!assignedThemeId && (
        <div className="flex flex-wrap gap-2 animate-slide-up overflow-x-auto pb-2" style={{ animationDelay: '100ms' }}>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? 'gold' : 'elegant'}
              size="sm"
              onClick={() => setActiveCategory(category.id)}
              className="flex-shrink-0"
            >
              {category.label}
            </Button>
          ))}
        </div>
      )}

      {/* Theme Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredThemes.length > 0 ? (
          filteredThemes.map((theme, index) => (
            <div key={theme.id} className="animate-scale-in" style={{ animationDelay: `${(index + 2) * 100}ms` }}>
              <ThemeCard
                theme={theme}
                isSelected={selectedThemeId === theme.id}
                onSelect={onSelectTheme}
                onPreview={setPreviewTheme}
                isAssigned={assignedThemeId === theme.id}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Tidak ada tema tersedia</p>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTheme} onOpenChange={() => setPreviewTheme(null)}>
        <DialogContent className="max-w-4xl mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl sm:text-2xl">
              {previewTheme?.name}
            </DialogTitle>
          </DialogHeader>
          {previewTheme && (
            <div className="space-y-4">
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src={previewTheme.thumbnail}
                  alt={previewTheme.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">{previewTheme.description}</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button 
                  variant="gold" 
                  className="flex-1"
                  onClick={() => {
                    onSelectTheme(previewTheme.id);
                    setPreviewTheme(null);
                  }}
                  disabled={assignedThemeId && assignedThemeId !== previewTheme.id}
                >
                  {assignedThemeId && assignedThemeId !== previewTheme.id 
                    ? 'Tema Sudah Ditentukan' 
                    : 'Pilih Tema Ini'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setPreviewTheme(null)}
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
