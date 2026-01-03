import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { ThemeGallery } from '@/components/ThemeGallery';
import { GuestTable } from '@/components/GuestTable';
import { SettingsPanel } from '@/components/SettingsPanel';
import { PreviewInvitation } from '@/components/PreviewInvitation';
import { mockThemes, mockGuests } from '@/data/mockData';
import { Guest, InvitationSettings } from '@/types/invitation';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { getInvitation, createOrUpdateInvitation } from '@/services/invitationService';
import { getGuests, addGuest, deleteGuest } from '@/services/guestService';
import { getThemes, getUserProfile } from '@/services/adminService';
import { Theme } from '@/types/invitation';
import { AdminThemeManager } from '@/components/admin/AdminThemeManager';
import { AdminUserManager } from '@/components/admin/AdminUserManager';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { Loader2 } from 'lucide-react';

const defaultSettings: InvitationSettings = {
  eventName: '',
  selectedThemeId: '1',
  groomName: '',
  groomFullName: '',
  groomDescription: '',
  groomFatherName: '',
  groomMotherName: '',
  brideName: '',
  brideFullName: '',
  brideDescription: '',
  brideFatherName: '',
  brideMotherName: '',
  akadDate: new Date().toISOString().split('T')[0], // Default to today
  akadStartTime: '08:00',
  akadEndTime: '10:00',
  akadLocation: 'Lokasi Akad',
  resepsiDate: new Date().toISOString().split('T')[0],
  resepsiStartTime: '11:00',
  resepsiEndTime: '13:00',
  resepsiLocation: '',
  loveStory: [],
  bankAccounts: [],
  galleryPhotos: [],
  // Legacy
  eventDate: '',
  eventTime: '',
  eventLocation: ''
};

const Index = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState('1');
  const [settings, setSettings] = useState<InvitationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [dbThemes, setDbThemes] = useState<Theme[]>([]);
  const [assignedThemeId, setAssignedThemeId] = useState<string | null>(null);

  useEffect(() => {
    const initData = async () => {
      if (!user) return;

      // --- OPTIMIZATION: Admin doesn't need invitation or global themes ---
      if (isAdmin) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Parallel fetch for Regular User - get invitation, themes, and user profile
        const [invitationData, themesData, userProfile] = await Promise.all([
          getInvitation(user.id),
          getThemes(),
          getUserProfile(user.id)
        ]);

        if (invitationData) {
          setSettings(invitationData);
          setSelectedThemeId(invitationData.selectedThemeId);
        } else {
          // Auto-create for new user to ensure ID exists
          try {
            const newInv = await createOrUpdateInvitation(user.id, defaultSettings);
            if (newInv) {
              setSettings({ ...defaultSettings, id: newInv.id, userId: user.id });
            }
          } catch (error) {
            console.error("Auto-create failed", error);
          }
        }

        // Get assigned theme from user profile
        if (userProfile && userProfile.assigned_theme_id) {
          setAssignedThemeId(userProfile.assigned_theme_id);
        }

        if (themesData) {
          const mappedThemes: Theme[] = themesData.map((t: any) => ({
            id: t.id,
            name: t.name,
            description: t.description || '',
            thumbnail: t.thumbnail_url || '',
            category: t.category as any || 'minimalist',
            isActive: t.is_active
          }));
          setDbThemes(mappedThemes);
        }
      } catch (error: any) {
        console.error(error);
        // Don't show error toast on 404 for new users
        if (error?.code !== 'PGRST116') {
          toast.error(`Gagal memuat data: ${error.message || 'Error'}`);
        }
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [user, isAdmin]); // Add isAdmin to dependency

  // Fetch guests when we have an invitation ID
  useEffect(() => {
    const loadGuests = async () => {
      if (settings.id && !isAdmin) {
        try {
          const fetchedGuests = await getGuests(settings.id);
          setGuests(fetchedGuests);
        } catch (error) {
          console.error("Failed to load guests", error);
        }
      }
    };
    loadGuests();
  }, [settings.id, isAdmin]);

  const handleAddGuest = async (newGuest: Omit<Guest, 'id' | 'createdAt' | 'status'>) => {
    if (!settings.id) {
      toast.error("Simpan pengaturan terlebih dahulu untuk menambahkan tamu.");
      return;
    }
    try {
      const added = await addGuest(settings.id, newGuest);
      setGuests([added, ...guests]);
      toast.success("Tamu berhasil ditambahkan!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menambahkan tamu.");
    }
  };

  const handleDeleteGuest = async (id: string) => {
    try {
      await deleteGuest(id);
      setGuests(guests.filter(g => g.id !== id));
      toast.success('Tamu berhasil dihapus');
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus tamu");
    }
  };

  const handleSelectTheme = (id: string) => {
    // If user has assigned theme, they can only use that theme
    if (assignedThemeId && id !== assignedThemeId) {
      toast.error(`Admin telah menentukan tema untuk Anda. Anda hanya dapat menggunakan tema tersebut.`);
      return;
    }

    setSelectedThemeId(id);
    const newSettings = { ...settings, selectedThemeId: id };
    setSettings(newSettings);
    // Auto save theme selection if we have an invitation created?
    // For now, let user save manually in Settings tab or we simple save it
    // But handleSaveSettings expects full object and triggers DB update
    if (user) {
      handleSaveSettings(newSettings);
    }
  };

  const handleSaveSettings = async (newSettings: InvitationSettings) => {
    if (!user) return;

    setSaving(true);
    try {
      await createOrUpdateInvitation(user.id, newSettings);
      setSettings(newSettings);
      toast.success('Pengaturan berhasil disimpan!');
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <span className="ml-2">Memuat data...</span>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return isAdmin ? <AdminDashboard /> : (
          <Dashboard
            guests={guests}
            themes={mockThemes}
            selectedThemeId={selectedThemeId}
            onPreview={() => setIsPreviewOpen(true)}
          />
        );
      case 'themes':
        return isAdmin ? (
          <AdminThemeManager />
        ) : (
          <ThemeGallery
            themes={dbThemes.length > 0 ? dbThemes : mockThemes}
            selectedThemeId={selectedThemeId}
            onSelectTheme={handleSelectTheme}
            assignedThemeId={assignedThemeId}
          />
        );
      case 'users':
        return isAdmin ? <AdminUserManager /> : null;
      case 'guests':
        return (
          <GuestTable
            guests={guests}
            onAddGuest={handleAddGuest}
            onDeleteGuest={handleDeleteGuest}
            baseUrl={window.location.origin}
            invitationId={settings.id}
          />
        );
      case 'settings':
        return isAdmin ? (
          <AdminSettings />
        ) : (
          <SettingsPanel
            settings={settings}
            onSaveSettings={handleSaveSettings}
            isSaving={saving}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Undangan Digital - Kelola Undangan Anda</title>
        <meta name="description" content="Kelola undangan digital Anda dengan mudah. Pilih tema, atur daftar tamu, dan kirim undangan via WhatsApp." />
      </Helmet>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <PreviewInvitation
          settings={settings}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}

      <div className="min-h-screen bg-background">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main content with responsive padding */}
        <main className="pt-16 lg:pt-0 lg:pl-64">
          <div className="container px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </>
  );
};

export default Index;
