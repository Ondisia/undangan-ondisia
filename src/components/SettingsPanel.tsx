import { Save, Camera, Heart, Gift, Music } from 'lucide-react';
import { InvitationSettings } from '@/types/invitation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ImageUpload } from '@/components/ImageUpload';
import { GalleryUpload } from '@/components/GalleryUpload';
import { MusicUpload } from '@/components/MusicUpload';

interface SettingsPanelProps {
  settings: InvitationSettings;
  onSaveSettings: (settings: InvitationSettings) => void;
  isSaving?: boolean;
}

export function SettingsPanel({ settings, onSaveSettings, isSaving = false }: SettingsPanelProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState(settings);
  const [groomPhoto, setGroomPhoto] = useState(settings.groomPhotoUrl);
  const [bridePhoto, setBridePhoto] = useState(settings.bridePhotoUrl);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>(settings.galleryPhotos || []);
  const [musicUrl, setMusicUrl] = useState(settings.musicUrl);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Helper to get form value or fall back to existing setting
    const getOrKeep = (fieldName: string, existingValue: any) => {
      const formValue = data.get(fieldName);
      // If form field exists and has value, use it; otherwise keep existing
      return formValue !== null && formValue !== '' ? formValue as string : existingValue;
    };

    const newSettings: InvitationSettings = {
      // Basic Info
      eventName: getOrKeep('eventName', settings.eventName) || '',
      selectedThemeId: formData.selectedThemeId,
      openingQuote: getOrKeep('openingQuote', settings.openingQuote) || undefined,
      closingMessage: getOrKeep('closingMessage', settings.closingMessage) || undefined,

      // Groom Information - fallback to existing or empty string
      groomName: getOrKeep('groomName', settings.groomName) || '',
      groomFullName: getOrKeep('groomFullName', settings.groomFullName) || '',
      groomTitle: getOrKeep('groomTitle', settings.groomTitle) || undefined,
      groomDescription: getOrKeep('groomDescription', settings.groomDescription) || '',
      groomFatherName: getOrKeep('groomFatherName', settings.groomFatherName) || '',
      groomMotherName: getOrKeep('groomMotherName', settings.groomMotherName) || '',
      groomPhotoUrl: groomPhoto || settings.groomPhotoUrl,

      // Bride Information - fallback to existing or empty string
      brideName: getOrKeep('brideName', settings.brideName) || '',
      brideFullName: getOrKeep('brideFullName', settings.brideFullName) || '',
      brideTitle: getOrKeep('brideTitle', settings.brideTitle) || undefined,
      brideDescription: getOrKeep('brideDescription', settings.brideDescription) || '',
      brideFatherName: getOrKeep('brideFatherName', settings.brideFatherName) || '',
      brideMotherName: getOrKeep('brideMotherName', settings.brideMotherName) || '',
      bridePhotoUrl: bridePhoto || settings.bridePhotoUrl,

      // Akad Nikah - fallback to existing or default values
      akadDate: getOrKeep('akadDate', settings.akadDate) || new Date().toISOString().split('T')[0],
      akadStartTime: getOrKeep('akadStartTime', settings.akadStartTime) || '08:00',
      akadEndTime: getOrKeep('akadEndTime', settings.akadEndTime) || '10:00',
      akadLocation: getOrKeep('akadLocation', settings.akadLocation) || '',

      // Resepsi - fallback to existing or default values
      resepsiDate: getOrKeep('resepsiDate', settings.resepsiDate) || new Date().toISOString().split('T')[0],
      resepsiStartTime: getOrKeep('resepsiStartTime', settings.resepsiStartTime) || '11:00',
      resepsiEndTime: getOrKeep('resepsiEndTime', settings.resepsiEndTime) || '13:00',
      resepsiLocation: getOrKeep('resepsiLocation', settings.resepsiLocation) || '',

      // Maps
      mapsUrl: getOrKeep('mapsUrl', settings.mapsUrl) || undefined,

      // Music
      musicUrl: musicUrl || settings.musicUrl,

      // Gallery
      galleryPhotos: galleryPhotos.length > 0 ? galleryPhotos : settings.galleryPhotos,

      // Love Story - keep existing if no new data
      loveStory: [
        {
          title: getOrKeep('story1Title', settings.loveStory[0]?.title) || '',
          date: getOrKeep('story1Date', settings.loveStory[0]?.date) || '',
          description: getOrKeep('story1Desc', settings.loveStory[0]?.description) || '',
          icon: getOrKeep('story1Icon', settings.loveStory[0]?.icon) || '💕'
        },
        {
          title: getOrKeep('story2Title', settings.loveStory[1]?.title) || '',
          date: getOrKeep('story2Date', settings.loveStory[1]?.date) || '',
          description: getOrKeep('story2Desc', settings.loveStory[1]?.description) || '',
          icon: getOrKeep('story2Icon', settings.loveStory[1]?.icon) || '💍'
        },
        {
          title: getOrKeep('story3Title', settings.loveStory[2]?.title) || '',
          date: getOrKeep('story3Date', settings.loveStory[2]?.date) || '',
          description: getOrKeep('story3Desc', settings.loveStory[2]?.description) || '',
          icon: getOrKeep('story3Icon', settings.loveStory[2]?.icon) || '💒'
        }
      ].filter(story => story.title || story.description), // Only keep stories with content

      // Gift Information - keep existing if no new data
      bankAccounts: [
        {
          bankName: getOrKeep('bank1Name', settings.bankAccounts[0]?.bankName) || '',
          accountNumber: getOrKeep('bank1Number', settings.bankAccounts[0]?.accountNumber) || '',
          accountHolder: getOrKeep('bank1Holder', settings.bankAccounts[0]?.accountHolder) || ''
        },
        {
          bankName: getOrKeep('bank2Name', settings.bankAccounts[1]?.bankName) || '',
          accountNumber: getOrKeep('bank2Number', settings.bankAccounts[1]?.accountNumber) || '',
          accountHolder: getOrKeep('bank2Holder', settings.bankAccounts[1]?.accountHolder) || ''
        }
      ].filter(bank => bank.bankName || bank.accountNumber), // Only keep banks with content

      // Legacy fields
      eventDate: getOrKeep('akadDate', settings.akadDate) || new Date().toISOString().split('T')[0],
      eventTime: getOrKeep('akadStartTime', settings.akadStartTime) || '08:00',
      eventLocation: getOrKeep('akadLocation', settings.akadLocation) || '',
    };

    onSaveSettings(newSettings);
    setFormData(newSettings);
    // Removed duplicate toast here. Let the parent component handle success/fail feedback.
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-slide-up flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Pengaturan Undangan
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Atur semua detail undangan pernikahan Anda secara lengkap.
          </p>
        </div>
      </div>

      {/* Settings Form with Tabs */}
      <form onSubmit={handleSubmit} className="animate-slide-up space-y-6" style={{ animationDelay: '100ms' }}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 h-auto">
            <TabsTrigger value="basic">Umum</TabsTrigger>
            <TabsTrigger value="couple">Mempelai</TabsTrigger>
            <TabsTrigger value="event">Acara</TabsTrigger>
            <TabsTrigger value="gallery">Galeri</TabsTrigger>
            <TabsTrigger value="music">Musik</TabsTrigger>
            <TabsTrigger value="story">Love Story</TabsTrigger>
            <TabsTrigger value="gift">Amplop</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6 mt-6">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card">
              <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-4">
                Informasi Umum
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="eventName">Judul Undangan</Label>
                  <Input
                    id="eventName"
                    name="eventName"
                    defaultValue={settings.eventName}
                    placeholder="Contoh: Pernikahan Andi & Maya"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openingQuote">Quote Pembuka (Opsional)</Label>
                  <Input
                    id="openingQuote"
                    name="openingQuote"
                    defaultValue={settings.openingQuote}
                    placeholder="Contoh: Bismillahirrahmanirrahim"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closingMessage">Pesan Penutup</Label>
                  <Textarea
                    id="closingMessage"
                    name="closingMessage"
                    defaultValue={settings.closingMessage}
                    placeholder="Pesan terima kasih untuk tamu..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Couple Info Tab */}
          <TabsContent value="couple" className="space-y-6 mt-6">
            {/* Groom */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card">
              <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-4">
                Informasi Mempelai Pria
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="groomName">Nama Panggilan *</Label>
                  <Input
                    id="groomName"
                    name="groomName"
                    defaultValue={settings.groomName}
                    placeholder="Contoh: Andi"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Untuk tampilan utama</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="groomFullName">Nama Lengkap *</Label>
                  <Input
                    id="groomFullName"
                    name="groomFullName"
                    defaultValue={settings.groomFullName}
                    placeholder="Contoh: Andi Wijaya"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="groomTitle">Gelar (Opsional)</Label>
                  <Input
                    id="groomTitle"
                    name="groomTitle"
                    defaultValue={settings.groomTitle}
                    placeholder="Contoh: S.T, S.Pd"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="groomDescription">Deskripsi</Label>
                  <Input
                    id="groomDescription"
                    name="groomDescription"
                    defaultValue={settings.groomDescription}
                    placeholder="Contoh: Putra pertama dari"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="groomFatherName">Nama Ayah</Label>
                  <Input
                    id="groomFatherName"
                    name="groomFatherName"
                    defaultValue={settings.groomFatherName}
                    placeholder="Contoh: H. Ahmad"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="groomMotherName">Nama Ibu</Label>
                  <Input
                    id="groomMotherName"
                    name="groomMotherName"
                    defaultValue={settings.groomMotherName}
                    placeholder="Contoh: Hj. Siti"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Foto Mempelai Pria</Label>
                  <ImageUpload
                    bucket="couple-photos"
                    path={user ? `${user.id}/groom` : 'groom'}
                    currentImage={groomPhoto}
                    onUpload={(url) => setGroomPhoto(url)}
                    onDelete={() => setGroomPhoto(undefined)}
                    label="Upload Foto Pria"
                  />
                  {/* Hidden input to ensure FormData works if needed, though we handle state manually */}
                  <input type="hidden" name="groomPhotoUrl" value={groomPhoto || ''} />
                </div>
              </div>
            </div>

            {/* Bride */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card">
              <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-4">
                Informasi Mempelai Wanita
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brideName">Nama Panggilan *</Label>
                  <Input
                    id="brideName"
                    name="brideName"
                    defaultValue={settings.brideName}
                    placeholder="Contoh: Maya"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Untuk tampilan utama</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brideFullName">Nama Lengkap *</Label>
                  <Input
                    id="brideFullName"
                    name="brideFullName"
                    defaultValue={settings.brideFullName}
                    placeholder="Contoh: Maya Putri"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brideTitle">Gelar (Opsional)</Label>
                  <Input
                    id="brideTitle"
                    name="brideTitle"
                    defaultValue={settings.brideTitle}
                    placeholder="Contoh: S.Pd, S.E"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brideDescription">Deskripsi</Label>
                  <Input
                    id="brideDescription"
                    name="brideDescription"
                    defaultValue={settings.brideDescription}
                    placeholder="Contoh: Putri pertama dari"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brideFatherName">Nama Ayah</Label>
                  <Input
                    id="brideFatherName"
                    name="brideFatherName"
                    defaultValue={settings.brideFatherName}
                    placeholder="Contoh: H. Ahmad"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brideMotherName">Nama Ibu</Label>
                  <Input
                    id="brideMotherName"
                    name="brideMotherName"
                    defaultValue={settings.brideMotherName}
                    placeholder="Contoh: Hj. Siti"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Foto Mempelai Wanita</Label>
                  <ImageUpload
                    bucket="couple-photos"
                    path={user ? `${user.id}/bride` : 'bride'}
                    currentImage={bridePhoto}
                    onUpload={(url) => setBridePhoto(url)}
                    onDelete={() => setBridePhoto(undefined)}
                    label="Upload Foto Wanita"
                  />
                  <input type="hidden" name="bridePhotoUrl" value={bridePhoto || ''} />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Event Tab */}
          <TabsContent value="event" className="space-y-6 mt-6">
            {/* Akad Nikah */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card">
              <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-4">
                Akad Nikah
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="akadDate">Tanggal</Label>
                  <Input
                    id="akadDate"
                    name="akadDate"
                    type="date"
                    defaultValue={settings.akadDate}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="akadStartTime">Waktu Mulai</Label>
                  <Input
                    id="akadStartTime"
                    name="akadStartTime"
                    type="time"
                    defaultValue={settings.akadStartTime}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="akadEndTime">Waktu Selesai</Label>
                  <Input
                    id="akadEndTime"
                    name="akadEndTime"
                    type="time"
                    defaultValue={settings.akadEndTime}
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-3">
                  <Label htmlFor="akadLocation">Lokasi</Label>
                  <Textarea
                    id="akadLocation"
                    name="akadLocation"
                    defaultValue={settings.akadLocation}
                    placeholder="Alamat lengkap akad nikah..."
                    rows={2}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Resepsi */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card">
              <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-4">
                Resepsi Pernikahan
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="resepsiDate">Tanggal</Label>
                  <Input
                    id="resepsiDate"
                    name="resepsiDate"
                    type="date"
                    defaultValue={settings.resepsiDate}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resepsiStartTime">Waktu Mulai</Label>
                  <Input
                    id="resepsiStartTime"
                    name="resepsiStartTime"
                    type="time"
                    defaultValue={settings.resepsiStartTime}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resepsiEndTime">Waktu Selesai</Label>
                  <Input
                    id="resepsiEndTime"
                    name="resepsiEndTime"
                    type="time"
                    defaultValue={settings.resepsiEndTime}
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-3">
                  <Label htmlFor="resepsiLocation">Lokasi</Label>
                  <Textarea
                    id="resepsiLocation"
                    name="resepsiLocation"
                    defaultValue={settings.resepsiLocation}
                    placeholder="Alamat lengkap resepsi..."
                    rows={2}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Maps */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card">
              <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-4">
                Google Maps
              </h2>
              <div className="space-y-2">
                <Label htmlFor="mapsUrl">Link Google Maps (Opsional)</Label>
                <Input
                  id="mapsUrl"
                  name="mapsUrl"
                  type="url"
                  defaultValue={settings.mapsUrl}
                  placeholder="https://maps.google.com/..."
                />
                <p className="text-xs text-muted-foreground">
                  Salin link dari Google Maps untuk memudahkan tamu menemukan lokasi
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6 mt-6">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card">
              <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-4">
                Galeri Foto
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Upload foto-foto momen bahagia Anda untuk ditampilkan di galeri undangan.
              </p>

              <GalleryUpload
                bucket="gallery-photos"
                pathPrefix={user ? `${user.id}` : 'public'}
                photos={galleryPhotos}
                onPhotosChange={setGalleryPhotos}
              />
            </div>
          </TabsContent>

          {/* Music Tab */}
          <TabsContent value="music" className="space-y-6 mt-6">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card">
              <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-4">
                Musik Latar
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Pilih musik yang akan diputar saat undangan dibuka.
              </p>

              <MusicUpload
                bucket="invitation-music"
                path={user ? `${user.id}/music` : 'public/music'}
                currentMusic={musicUrl}
                onUpload={(url) => setMusicUrl(url)}
                onDelete={() => setMusicUrl(undefined)}
              />
              <div className="mt-4 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
                <p>💡 Tips:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Gunakan format MP3 untuk kompatibilitas terbaik</li>
                  <li>Ukuran file maksimal 10MB</li>
                  <li>Pilih musik instrumental agar tidak bertabrakan dengan suara acara</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Love Story Tab */}
          <TabsContent value="story" className="space-y-6 mt-6">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card">
              <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-4">
                Timeline Kisah Cinta
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Ceritakan 3 momen penting dalam perjalanan cinta Anda
              </p>

              {/* Story 1 */}
              <div className="mb-6 p-4 rounded-lg bg-muted/30">
                <h3 className="font-semibold text-foreground mb-3">Momen 1</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="story1Title">Judul</Label>
                    <Input
                      id="story1Title"
                      name="story1Title"
                      defaultValue={settings.loveStory[0]?.title}
                      placeholder="Contoh: Awal Bertemu"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="story1Date">Tanggal/Periode</Label>
                    <Input
                      id="story1Date"
                      name="story1Date"
                      defaultValue={settings.loveStory[0]?.date}
                      placeholder="Contoh: Januari 2020"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="story1Desc">Deskripsi</Label>
                    <Textarea
                      id="story1Desc"
                      name="story1Desc"
                      defaultValue={settings.loveStory[0]?.description}
                      placeholder="Ceritakan momen ini..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="story1Icon">Icon/Emoji</Label>
                    <Input
                      id="story1Icon"
                      name="story1Icon"
                      defaultValue={settings.loveStory[0]?.icon || '💕'}
                      placeholder="💕"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>

              {/* Story 2 */}
              <div className="mb-6 p-4 rounded-lg bg-muted/30">
                <h3 className="font-semibold text-foreground mb-3">Momen 2</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="story2Title">Judul</Label>
                    <Input
                      id="story2Title"
                      name="story2Title"
                      defaultValue={settings.loveStory[1]?.title}
                      placeholder="Contoh: Lamaran"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="story2Date">Tanggal/Periode</Label>
                    <Input
                      id="story2Date"
                      name="story2Date"
                      defaultValue={settings.loveStory[1]?.date}
                      placeholder="Contoh: Februari 2024"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="story2Desc">Deskripsi</Label>
                    <Textarea
                      id="story2Desc"
                      name="story2Desc"
                      defaultValue={settings.loveStory[1]?.description}
                      placeholder="Ceritakan momen ini..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="story2Icon">Icon/Emoji</Label>
                    <Input
                      id="story2Icon"
                      name="story2Icon"
                      defaultValue={settings.loveStory[1]?.icon || '💍'}
                      placeholder="💍"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>

              {/* Story 3 */}
              <div className="p-4 rounded-lg bg-muted/30">
                <h3 className="font-semibold text-foreground mb-3">Momen 3</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="story3Title">Judul</Label>
                    <Input
                      id="story3Title"
                      name="story3Title"
                      defaultValue={settings.loveStory[2]?.title}
                      placeholder="Contoh: Menikah"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="story3Date">Tanggal/Periode</Label>
                    <Input
                      id="story3Date"
                      name="story3Date"
                      defaultValue={settings.loveStory[2]?.date}
                      placeholder="Contoh: 15 Juni 2024"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="story3Desc">Deskripsi</Label>
                    <Textarea
                      id="story3Desc"
                      name="story3Desc"
                      defaultValue={settings.loveStory[2]?.description}
                      placeholder="Ceritakan momen ini..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="story3Icon">Icon/Emoji</Label>
                    <Input
                      id="story3Icon"
                      name="story3Icon"
                      defaultValue={settings.loveStory[2]?.icon || '💒'}
                      placeholder="💒"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Gift Tab */}
          <TabsContent value="gift" className="space-y-6 mt-6">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card">
              <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-4">
                Informasi Amplop Digital
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Tambahkan informasi rekening untuk menerima amplop digital dari tamu
              </p>

              {/* Bank 1 */}
              <div className="mb-6 p-4 rounded-lg bg-muted/30">
                <h3 className="font-semibold text-foreground mb-3">Rekening 1</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bank1Name">Nama Bank</Label>
                    <Input
                      id="bank1Name"
                      name="bank1Name"
                      defaultValue={settings.bankAccounts[0]?.bankName}
                      placeholder="Contoh: Bank BCA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank1Number">Nomor Rekening</Label>
                    <Input
                      id="bank1Number"
                      name="bank1Number"
                      defaultValue={settings.bankAccounts[0]?.accountNumber}
                      placeholder="1234567890"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="bank1Holder">Atas Nama</Label>
                    <Input
                      id="bank1Holder"
                      name="bank1Holder"
                      defaultValue={settings.bankAccounts[0]?.accountHolder}
                      placeholder="Nama pemilik rekening"
                    />
                  </div>
                </div>
              </div>

              {/* Bank 2 */}
              <div className="p-4 rounded-lg bg-muted/30">
                <h3 className="font-semibold text-foreground mb-3">Rekening 2</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bank2Name">Nama Bank</Label>
                    <Input
                      id="bank2Name"
                      name="bank2Name"
                      defaultValue={settings.bankAccounts[1]?.bankName}
                      placeholder="Contoh: Bank Mandiri"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank2Number">Nomor Rekening</Label>
                    <Input
                      id="bank2Number"
                      name="bank2Number"
                      defaultValue={settings.bankAccounts[1]?.accountNumber}
                      placeholder="0987654321"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="bank2Holder">Atas Nama</Label>
                    <Input
                      id="bank2Holder"
                      name="bank2Holder"
                      defaultValue={settings.bankAccounts[1]?.accountHolder}
                      placeholder="Nama pemilik rekening"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button - Outside tabs, always visible */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="submit"
            variant="gold"
            size="xl"
            className="gap-2 flex-1 sm:flex-initial"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Simpan Pengaturan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
