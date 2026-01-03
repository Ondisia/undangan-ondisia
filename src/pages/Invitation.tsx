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
import { getInvitationById } from '@/services/invitationService';
import { getGuests, updateGuestStatus } from '@/services/guestService';
import { Guest } from '@/types/invitation';

const Invitation = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const guestName = searchParams.get('to') || 'Tamu Undangan';
  const [settings, setSettings] = useState<InvitationSettings | null>(null);
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
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
  }, [id]);

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
    if (settings && !loading) {
      trackGuest();
    }
  }, [settings, guestName, loading]);

  const handleRSVPSubmit = async (attendance: 'attending' | 'not-attending', guestCount: number, message: string) => {
    if (!currentGuest) {
      // Fallback for non-listed guests (public link) - just allow submission without status update
      // or prevent submission. For now, we allow it but it won't update any guest record.
      return;
    }

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

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' as const }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Maaf</h1>
          <p className="text-muted-foreground">{error || 'Undangan tidak ditemukan'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{settings.eventName}</title>
        <meta name="description" content={`Undangan Pernikahan ${settings.groomName} & ${settings.brideName}`} />
      </Helmet>

      <MusicPlayer autoPlay musicUrl={settings.musicUrl} />
      <FloatingElements />

      <div className="min-h-screen bg-background overflow-x-hidden">
        {/* Hero Section */}
        <motion.section
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop"
              alt="Wedding Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
          </div>

          {/* Content */}
          <div className="relative z-20 text-center px-4 sm:px-6 max-w-3xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gold font-medium mb-4 text-sm sm:text-base"
            >
              Undangan Pernikahan
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-playfair font-bold text-foreground mb-2">
                {settings.groomName.split(' ')[0]}
              </h1>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block my-3 sm:my-4"
              >
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-gold fill-gold" />
              </motion.div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-playfair font-bold text-foreground">
                {settings.brideName.split(' ')[0]}
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 sm:mt-8 text-sm sm:text-lg text-muted-foreground"
            >
              Kepada Yth. Bapak/Ibu/Saudara/i
            </motion.p>
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className="text-xl sm:text-2xl md:text-3xl font-playfair font-semibold text-gold mt-2"
            >
              {guestName}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-8 sm:mt-12"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-gold mx-auto" />
              </motion.div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">Scroll ke bawah</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Couple Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="py-12 sm:py-20 px-4 sm:px-6 relative z-20"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-gold font-medium mb-4 text-sm sm:text-base"
            >
              Bismillahirrahmanirrahim
            </motion.p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan
              pernikahan putra-putri kami:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 mt-8 sm:mt-12">
              {/* Groom */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4 sm:mb-6 rounded-full overflow-hidden border-4 border-gold/30 shadow-elegant">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
                    alt={settings.groomName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-playfair font-bold text-foreground">
                  {settings.groomName}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">Putra dari Bapak & Ibu</p>
              </motion.div>

              {/* Bride */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4 sm:mb-6 rounded-full overflow-hidden border-4 border-gold/30 shadow-elegant">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face"
                    alt={settings.brideName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-playfair font-bold text-foreground">
                  {settings.brideName}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">Putri dari Bapak & Ibu</p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Event Details Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="py-12 sm:py-20 px-4 sm:px-6 bg-card/50 relative z-20"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-block mb-6 sm:mb-8"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
              </div>
            </motion.div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-foreground mb-8 sm:mb-12">
              Waktu & Tempat
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
              {/* Akad Nikah */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="p-6 sm:p-8 rounded-2xl bg-card border border-gold/20 shadow-elegant"
              >
                <h3 className="text-lg sm:text-xl font-playfair font-bold text-gold mb-4">Akad Nikah</h3>
                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                  <p className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="truncate">{formatDate(settings.eventDate)}</span>
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-gold flex-shrink-0" />
                    {settings.eventTime} WIB
                  </p>
                </div>
              </motion.div>

              {/* Resepsi */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 sm:p-8 rounded-2xl bg-card border border-gold/20 shadow-elegant"
              >
                <h3 className="text-lg sm:text-xl font-playfair font-bold text-gold mb-4">Resepsi</h3>
                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                  <p className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="truncate">{formatDate(settings.eventDate)}</span>
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-gold flex-shrink-0" />
                    12:00 WIB - Selesai
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 rounded-2xl bg-card border border-gold/20 shadow-elegant"
            >
              <div className="flex items-center justify-center gap-2 text-gold mb-4">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                <h3 className="text-lg sm:text-xl font-playfair font-bold">Lokasi</h3>
              </div>
              <p className="text-sm sm:text-base text-foreground font-medium mb-4">{settings.eventLocation}</p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(settings.eventLocation)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gold text-gold-foreground text-sm sm:text-base font-medium hover:bg-gold/90 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Buka di Google Maps
              </a>
            </motion.div>
          </div>
        </motion.section>

        {/* Love Story Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="py-12 sm:py-20 px-4 sm:px-6 relative z-20"
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6 sm:mb-8">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
              Kisah Cinta
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-12 max-w-lg mx-auto">
              Perjalanan cinta kami hingga menuju pelaminan
            </p>

            <div className="relative max-w-3xl mx-auto">
              {/* Vertical Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gold/30 -translate-x-1/2" />

              <div className="space-y-12">
                {settings.loveStory.map((story, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className={`relative flex items-center gap-8 ${index % 2 === 0 ? 'text-right flex-row-reverse' : 'text-left'
                      }`}
                  >
                    {/* Content */}
                    <div className="flex-1">
                      <div className="bg-card p-6 rounded-2xl shadow-elegant border border-gold/10 hover:border-gold/30 transition-colors">
                        <span className="text-gold font-medium text-sm">{story.date}</span>
                        <h3 className="text-lg font-playfair font-bold text-foreground mt-1 mb-2">
                          {story.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {story.description}
                        </p>
                      </div>
                    </div>

                    {/* Timeline Dot */}
                    <div className="relative flex-shrink-0 z-10">
                      <div className="w-8 h-8 rounded-full bg-background border-4 border-gold flex items-center justify-center text-xs">
                        {story.icon}
                      </div>
                    </div>

                    {/* Spacer for other side */}
                    <div className="flex-1" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Gallery Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="py-12 sm:py-20 px-4 sm:px-6 bg-card/50 relative z-20"
        >
          <div className="max-w-6xl mx-auto text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6 sm:mb-8">
              <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
              Galeri Momen
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-12 max-w-lg mx-auto">
              Potret kebahagiaan kami dalam bingkai kenangan
            </p>

            <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
              {settings.galleryPhotos.map((photo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group rounded-xl overflow-hidden shadow-elegant"
                >
                  <div className="aspect-[3/4]">
                    <img
                      src={photo}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Countdown Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="py-12 sm:py-20 px-4 sm:px-6 relative z-20"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
              Menghitung Hari
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-8 sm:mb-12">
              Menuju hari bahagia kami
            </p>
            <CountdownTimer targetDate={settings.eventDate} />
          </div>
        </motion.section>

        {/* RSVP Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="py-12 sm:py-20 px-4 sm:px-6 bg-card/50 relative z-20"
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6 sm:mb-8">
              <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
              Konfirmasi Kehadiran
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-8 sm:mb-12 max-w-lg mx-auto">
              Mohon konfirmasi kehadiran Anda untuk membantu kami mempersiapkan acara dengan lebih baik
            </p>
            <RSVPForm
              onConfirm={handleRSVPSubmit}
              guestName={currentGuest?.name}
            />
          </div>
        </motion.section>

        {/* Gift Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="py-12 sm:py-20 px-4 sm:px-6 relative z-20"
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6 sm:mb-8">
              <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
              Kirim Hadiah
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-8 sm:mb-12 max-w-lg mx-auto px-2">
              Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih, kami menyediakan informasi berikut:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
              {settings.bankAccounts.map((account, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 sm:p-6 rounded-2xl bg-card border border-gold/20 shadow-elegant"
                >
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">{account.bankName}</p>
                  <p className="text-base sm:text-lg font-mono font-bold text-foreground">{account.accountNumber}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">a.n. {account.accountHolder}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="py-8 sm:py-12 px-4 sm:px-6 text-center relative z-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="max-w-md mx-auto"
          >
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-gold mx-auto mb-4 fill-gold" />
            <p className="text-sm sm:text-base text-muted-foreground">
              Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kami.
            </p>
            <p className="mt-6 font-playfair text-lg sm:text-xl text-foreground">
              {settings.groomName.split(' ')[0]} & {settings.brideName.split(' ')[0]}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-4">
              © 2024 Wedding Invitation
            </p>
          </motion.div>
        </footer>
      </div>
    </>
  );
};

export default Invitation;
