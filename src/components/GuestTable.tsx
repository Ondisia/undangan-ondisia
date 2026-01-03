import { useState } from 'react';
import { Share2, MessageCircle, MoreHorizontal, UserPlus, Search, Trash2, Edit } from 'lucide-react';
import { Guest } from '@/types/invitation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

interface GuestTableProps {
  guests: Guest[];
  onAddGuest: (guest: Omit<Guest, 'id' | 'createdAt' | 'status'>) => void;
  onDeleteGuest: (id: string) => void;
  baseUrl: string;
  invitationId?: string;
}

const statusConfig: Record<Guest['status'], { label: string; className: string }> = {
  pending: { label: 'Menunggu', className: 'bg-muted text-muted-foreground' },
  sent: { label: 'Terkirim', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  opened: { label: 'Dibuka', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  confirmed: { label: 'Hadir', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  declined: { label: 'Tidak Hadir', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export function GuestTable({ guests, onAddGuest, onDeleteGuest, baseUrl, invitationId }: GuestTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', phone: '' });

  const filteredGuests = guests.filter((guest) =>
    guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.phone.includes(searchQuery)
  );

  const generateInvitationLink = (guest: Guest) => {
    if (!invitationId) return '';
    const encodedName = encodeURIComponent(guest.name);
    return `${baseUrl}/invitation/${invitationId}?to=${encodedName}`;
  };

  const handleShareLink = async (guest: Guest) => {
    const link = generateInvitationLink(guest);
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link undangan berhasil disalin!');
    } catch {
      toast.error('Gagal menyalin link');
    }
  };

  const handleWhatsApp = (guest: Guest) => {
    const link = generateInvitationLink(guest);
    const message = encodeURIComponent(
      `Kepada Yth. ${guest.name},\n\nKami mengundang Anda untuk menghadiri acara kami. Silakan buka undangan digital berikut:\n\n${link}\n\nTerima kasih.`
    );
    const phoneNumber = guest.phone.startsWith('62') ? guest.phone : `62${guest.phone.replace(/^0/, '')}`;
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleAddGuest = () => {
    if (!newGuest.name.trim() || !newGuest.phone.trim()) {
      toast.error('Mohon isi semua field');
      return;
    }
    onAddGuest(newGuest);
    setNewGuest({ name: '', phone: '' });
    setIsAddDialogOpen(false);
    toast.success('Tamu berhasil ditambahkan!');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau nomor telepon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gold" className="gap-2 w-full sm:w-auto">
              <UserPlus className="h-4 w-4" />
              Tambah Tamu
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 sm:mx-0">
            <DialogHeader>
              <DialogTitle className="font-display">Tambah Tamu Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  placeholder="Masukkan nama tamu"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor WhatsApp</Label>
                <Input
                  id="phone"
                  placeholder="628xxxxxxxxxx"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Format: 628xxxxxxxxxx (tanpa tanda + atau spasi)
                </p>
              </div>
              <Button variant="gold" className="w-full" onClick={handleAddGuest}>
                Tambah Tamu
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Nama
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  No. WhatsApp
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredGuests.map((guest) => (
                <tr
                  key={guest.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{guest.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground">{guest.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                      statusConfig[guest.status].className
                    )}>
                      {statusConfig[guest.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShareLink(guest)}
                        title="Salin Link"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleWhatsApp(guest)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                        title="Kirim via WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem className="gap-2">
                            <Edit className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => onDeleteGuest(guest.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredGuests.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Tidak ada tamu ditemukan</p>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-3 md:hidden">
        {filteredGuests.map((guest) => (
          <Card key={guest.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{guest.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{guest.phone}</p>
                  <span className={cn(
                    "inline-flex rounded-full px-3 py-1 text-xs font-medium mt-2",
                    statusConfig[guest.status].className
                  )}>
                    {statusConfig[guest.status].label}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleShareLink(guest)}
                    className="h-9 w-9"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleWhatsApp(guest)}
                    className="h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover">
                      <DropdownMenuItem className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 text-destructive focus:text-destructive"
                        onClick={() => onDeleteGuest(guest.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredGuests.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Tidak ada tamu ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
