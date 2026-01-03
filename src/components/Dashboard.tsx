import { Users, Send, Eye, CheckCircle } from 'lucide-react';
import { StatCard } from './StatCard';
import { Guest, Theme } from '@/types/invitation';

interface DashboardProps {
  guests: Guest[];
  themes: Theme[];
  selectedThemeId: string;
  onPreview: () => void;
}

export function Dashboard({ guests, themes, selectedThemeId, onPreview }: DashboardProps) {
  const stats = {
    totalGuests: guests.length,
    invitationsSent: guests.filter(g => g.status !== 'pending').length,
    invitationsOpened: guests.filter(g => ['opened', 'confirmed', 'declined'].includes(g.status)).length,
    confirmed: guests.filter(g => g.status === 'confirmed').length,
  };

  const selectedTheme = themes.find(t => t.id === selectedThemeId);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="animate-slide-up">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          Selamat Datang! 👋
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Kelola undangan digital Anda dengan mudah dan efisien.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tamu"
          value={stats.totalGuests}
          icon={Users}
          description="Tamu yang terdaftar"
          delay={100}
        />
        <StatCard
          title="Undangan Terkirim"
          value={stats.invitationsSent}
          icon={Send}
          description={`${Math.round((stats.invitationsSent / stats.totalGuests) * 100) || 0}% dari total`}
          delay={200}
        />
        <StatCard
          title="Undangan Dibuka"
          value={stats.invitationsOpened}
          icon={Eye}
          description={`${Math.round((stats.invitationsOpened / stats.totalGuests) * 100) || 0}% dari total`}
          delay={300}
        />
        <StatCard
          title="Konfirmasi Hadir"
          value={stats.confirmed}
          icon={CheckCircle}
          description={`${Math.round((stats.confirmed / stats.totalGuests) * 100) || 0}% dari total`}
          trend={{ value: 12, isPositive: true }}
          delay={400}
        />
      </div>

      {/* Current Theme */}
      {selectedTheme && (
        <div className="animate-slide-up rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card" style={{ animationDelay: '500ms' }}>
          <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground">
            Tema Aktif
          </h2>
          <div className="mt-4 flex flex-col gap-4 sm:gap-6 sm:flex-row">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg sm:w-48 lg:w-64">
              <img
                src={selectedTheme.thumbnail}
                alt={selectedTheme.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl sm:text-2xl font-semibold text-foreground">
                {selectedTheme.name}
              </h3>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                {selectedTheme.description}
              </p>
              <div className="mt-4">
                <span className="inline-flex rounded-full bg-champagne px-3 py-1 text-sm font-medium text-gold">
                  {selectedTheme.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="animate-slide-up rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card" style={{ animationDelay: '600ms' }}>
        <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground">
          Aksi Cepat
        </h2>
        <div className="mt-4 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-background p-4 transition-all hover:border-gold/30 hover:shadow-elegant">
            <Send className="h-6 w-6 sm:h-8 sm:w-8 text-gold" />
            <h3 className="mt-2 sm:mt-3 font-medium text-sm sm:text-base text-foreground">Kirim Undangan</h3>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Kirim undangan ke semua tamu sekaligus
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4 transition-all hover:border-gold/30 hover:shadow-elegant">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-gold" />
            <h3 className="mt-2 sm:mt-3 font-medium text-sm sm:text-base text-foreground">Impor Tamu</h3>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Impor daftar tamu dari file Excel
            </p>
          </div>
          <div
            onClick={onPreview}
            className="rounded-lg border border-border bg-background p-4 transition-all hover:border-gold/30 hover:shadow-elegant cursor-pointer"
          >
            <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-gold" />
            <h3 className="mt-2 sm:mt-3 font-medium text-sm sm:text-base text-foreground">Preview Undangan</h3>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Lihat tampilan undangan Anda
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
