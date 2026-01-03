import { useSearchParams, useParams } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, MapPin, Heart, ChevronDown, Gift, MessageCircle, Camera, Loader2 } from 'lucide-react';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import FloatingElements from '@/components/invitation/FloatingElements';
import CountdownTimer from '@/components/invitation/CountdownTimer';
import RSVPForm from '@/components/invitation/RSVPForm';
import { useState, useEffect } from 'react';
import { InvitationSettings } from '@/types/invitation';
import { getInvitationById, getThemeById } from '@/services/invitationService';
import { getGuests, updateGuestStatus } from '@/services/guestService';
import { Guest } from '@/types/invitation';
import { previewSettings } from '@/data/mockData';
import DefaultTheme from '@/components/themes/DefaultTheme';
import ModernTheme from '@/components/themes/ModernTheme';
import RusticTheme from '@/components/themes/RusticTheme';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const Invitation = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const guestName = searchParams.get('to') || 'Tamu Undangan';
  const previewThemeId = searchParams.get('theme');
  
  const [settings, setSettings] = useState<InvitationSettings | null>(null);
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      // HANDLE PREVIEW MODE
      if (id === 'preview') {
        console.log('🔍 Invitation Preview Mode. Theme ID:', previewThemeId);
        let slug = 'default';
        if (previewThemeId) {
          try {
            const themeData = await getThemeById(previewThemeId);
            console.log('🔍 Theme Data fetched for preview:', themeData);
            if (themeData?.slug) {
              slug = themeData.slug;
            } else {
              console.warn('⚠️ No slug found for theme, using default');
            }
          } catch (e) {
            console.error("❌ Preview theme fetch error:", e);
          }
        }

        setSettings({
          ...previewSettings,
          selectedThemeId: previewThemeId || '1',
          themeSlug: slug
        });
        setLoading(false);
        return;
      }

      if (!id) {
        setError('Link undangan tidak valid');
        setLoading(false);
        return;
      }

      try {
        const data = await getInvitationById(id);
        if (data) {
          setSettings(data);
        } else {
          setError('Undangan tidak ditemukan atau belum dipublikasikan');
        }
      } catch (err) {
        console.error(err);
        setError('Terjadi kesalahan saat memuat undangan');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, previewThemeId]);

  // Handle Guest Lookup and 'Opened' Status
  useEffect(() => {
    const trackGuest = async () => {
      if (settings?.id && guestName && guestName !== 'Tamu Undangan') {
        try {
          // Find guest by matching name (fuzzy/exact match)
          const guests = await getGuests(settings.id);
          // Simple exact match for now, or could use ID if we passed it in URL
          const foundGuest = guests.find(g => g.name.toLowerCase() === guestName.toLowerCase());

          if (foundGuest) {
            setCurrentGuest(foundGuest);
            // Only update if not already opened/responded to avoid spamming upgrades
            if (foundGuest.status === 'pending' || foundGuest.status === 'sent') {
              await updateGuestStatus(foundGuest.id, 'opened');
            }
          }
        } catch (err) {
          console.error("Failed to track guest", err);
        }
      }
    };
    if (settings && !loading && id !== 'preview') {
      trackGuest();
    }
  }, [settings, guestName, loading, id]);

  const handleRSVPSubmit = async (attendance: 'attending' | 'not-attending', guestCount: number, message: string) => {
    if (id === 'preview') {
      toast.success('Preview RSVP Berhasil (Data tidak disimpan)');
      return;
    }

    if (!currentGuest) return;

    try {
      const newStatus = attendance === 'attending' ? 'confirmed' : 'declined';
      await updateGuestStatus(currentGuest.id, newStatus);
      // Note: We could also save the specific RSVP message/count to a separate table here if needed
      // For now, updating the status is the primary request.
    } catch (error) {
      console.error("Failed to update RSVP status", error);
      throw error; // Let form handle error display
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">{error || 'Undangan Tidak Tersedia'}</h1>
        <p className="text-muted-foreground mb-8">Pastikan link yang Anda gunakan sudah benar.</p>
        <Button onClick={() => window.location.href = '/'}>Kembali ke Beranda</Button>
      </div>
    );
  }

  // Render Theme based on slug
  const renderTheme = () => {
    const slug = settings.themeSlug || 'default';
    
    switch (slug) {
      case 'default':
      case 'elegant-gold':
        return (
          <DefaultTheme 
            settings={settings} 
            currentGuest={currentGuest} 
            onRSVPSubmit={handleRSVPSubmit} 
          />
        );
      case 'modern-minimalist':
        return (
          <ModernTheme 
            settings={settings} 
            currentGuest={currentGuest} 
            onRSVPSubmit={handleRSVPSubmit} 
          />
        );
      case 'rustic-floral':
        return (
          <RusticTheme 
            settings={settings} 
            currentGuest={currentGuest} 
            onRSVPSubmit={handleRSVPSubmit} 
          />
        );
      default:
        return (
          <DefaultTheme 
            settings={settings} 
            currentGuest={currentGuest} 
            onRSVPSubmit={handleRSVPSubmit} 
          />
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>{settings.eventName}</title>
        <meta name="description" content={`Undangan Digital ${settings.eventName}`} />
      </Helmet>
      
      {id === 'preview' && (
        <div className="fixed top-0 left-0 right-0 bg-gold text-white text-center text-xs py-1 z-[100] font-bold uppercase tracking-widest">
          Mode Preview Tema
        </div>
      )}

      {renderTheme()}
    </>
  );
};

export default Invitation;
