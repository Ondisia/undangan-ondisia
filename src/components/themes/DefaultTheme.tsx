import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, Clock, MapPin, Heart, ChevronDown, Gift, MessageCircle, Camera } from 'lucide-react';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import FloatingElements from '@/components/invitation/FloatingElements';
import CountdownTimer from '@/components/invitation/CountdownTimer';
import RSVPForm from '@/components/invitation/RSVPForm';
import { InvitationSettings, Guest } from '@/types/invitation';
import { Button } from '@/components/ui/button';

interface ThemeProps {
    settings: InvitationSettings;
    currentGuest: Guest | null;
    onRSVPSubmit: (attendance: 'attending' | 'not-attending', guestCount: number, message: string) => Promise<void>;
}

const DefaultTheme = ({ settings, currentGuest, onRSVPSubmit }: ThemeProps) => {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-gold/30 selection:text-gold-dark overflow-x-hidden">
      {/* Music Player */}
      <MusicPlayer musicUrl={settings.musicUrl || ''} />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img 
            src={settings.bridePhotoUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600"} 
            alt="Wedding Hero" 
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <span className="text-gold font-medium tracking-[0.3em] uppercase text-xs sm:text-sm mb-4 block">
              The Wedding of
            </span>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-playfair font-bold text-white mb-6 sm:mb-8 tracking-tighter">
              {settings.groomName.split(' ')[0]} <span className="text-gold font-light">&</span> {settings.brideName.split(' ')[0]}
            </h1>
            <div className="h-px w-24 sm:w-32 bg-gold/50 mx-auto mb-6 sm:mb-8" />
            <p className="text-white/90 text-sm sm:text-base md:text-lg font-light tracking-widest uppercase mb-10 sm:mb-12">
              {formatDate(settings.akadDate)}
            </p>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="text-white/50 w-6 h-6 sm:w-8 sm:h-8" />
          </motion.div>
        </div>
      </section>

      {/* Opening Section */}
      <motion.section 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-20 sm:py-32 px-4 sm:px-6 relative"
      >
        <FloatingElements />
        <div className="max-w-3xl mx-auto text-center">
          <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-gold mx-auto mb-8 sm:mb-10 animate-pulse" />
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed italic font-light px-4">
            {settings.openingQuote || "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."}
          </p>
        </div>
      </motion.section>

      {/* Couple Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-card/30 relative z-20 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-20 md:gap-32 items-center">
            {/* Groom */}
            <motion.div 
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="relative mb-8 sm:mb-10 inline-block">
                <div className="absolute -inset-4 border border-gold/20 rounded-full scale-90 group-hover:scale-105 transition-transform duration-700" />
                <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-white shadow-2xl relative z-10 transition-transform duration-700 group-hover:scale-[1.02]">
                  <img 
                    src={settings.groomPhotoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"} 
                    alt={settings.groomName} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="text-3xl sm:text-4xl font-playfair font-bold text-foreground mb-3">{settings.groomFullName}</h3>
              <p className="text-gold font-medium mb-4 sm:mb-6 tracking-widest uppercase text-xs sm:text-sm">Mempelai Pria</p>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xs mx-auto leading-relaxed">
                {settings.groomDescription || `Putra dari Bapak ${settings.groomFatherName} & Ibu ${settings.groomMotherName}`}
              </p>
            </motion.div>

            {/* Bride */}
            <motion.div 
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="relative mb-8 sm:mb-10 inline-block">
                <div className="absolute -inset-4 border border-gold/20 rounded-full scale-90 group-hover:scale-105 transition-transform duration-700" />
                <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-white shadow-2xl relative z-10 transition-transform duration-700 group-hover:scale-[1.02]">
                  <img 
                    src={settings.bridePhotoUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"} 
                    alt={settings.brideName} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="text-3xl sm:text-4xl font-playfair font-bold text-foreground mb-3">{settings.brideFullName}</h3>
              <p className="text-gold font-medium mb-4 sm:mb-6 tracking-widest uppercase text-xs sm:text-sm">Mempelai Wanita</p>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xs mx-auto leading-relaxed">
                {settings.brideDescription || `Putri dari Bapak ${settings.brideFatherName} & Ibu ${settings.brideMotherName}`}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Event Details Section */}
      <motion.section 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-20 sm:py-32 px-4 sm:px-6 relative scroll-mt-20 z-20"
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            {/* Akad Nikah */}
            <div className="p-8 sm:p-12 rounded-3xl bg-card border border-gold/10 shadow-elegant relative overflow-hidden group hover:border-gold/30 transition-colors duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Heart className="w-24 h-24 text-gold" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl font-playfair font-bold text-foreground mb-6 sm:mb-8">Akad Nikah</h3>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 sm:w-12 h-12 rounded-full bg-gold/5 flex items-center justify-center group-hover/item:bg-gold/10 transition-colors">
                      <Calendar className="w-5 h-5 sm:w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">Tanggal</p>
                      <p className="font-semibold text-sm sm:text-base">{formatDate(settings.akadDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 sm:w-12 h-12 rounded-full bg-gold/5 flex items-center justify-center group-hover/item:bg-gold/10 transition-colors">
                      <Clock className="w-5 h-5 sm:w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">Waktu</p>
                      <p className="font-semibold text-sm sm:text-base">{settings.akadStartTime} - {settings.akadEndTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 group/item">
                    <div className="w-10 h-10 sm:w-12 h-12 rounded-full bg-gold/5 flex items-center justify-center group-hover/item:bg-gold/10 transition-colors mt-1">
                      <MapPin className="w-5 h-5 sm:w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">Lokasi</p>
                      <p className="font-semibold text-sm sm:text-base mb-4 leading-relaxed">{settings.akadLocation}</p>
                      <Button 
                        variant="gold" 
                        size="sm" 
                        className="rounded-full px-6"
                        onClick={() => settings.mapsUrl && window.open(settings.mapsUrl, '_blank')}
                      >
                        Buka Google Maps
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resepsi */}
            <div className="p-8 sm:p-12 rounded-3xl bg-gold/5 border border-gold/20 shadow-elegant relative overflow-hidden group hover:border-gold/40 transition-colors duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Camera className="w-24 h-24 text-gold" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl font-playfair font-bold text-foreground mb-6 sm:mb-8">Resepsi</h3>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 sm:w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center group-hover/item:bg-gold/20 transition-colors">
                      <Calendar className="w-5 h-5 sm:w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">Tanggal</p>
                      <p className="font-semibold text-sm sm:text-base">{formatDate(settings.resepsiDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 sm:w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center group-hover/item:bg-gold/20 transition-colors">
                      <Clock className="w-5 h-5 sm:w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">Waktu</p>
                      <p className="font-semibold text-sm sm:text-base">{settings.resepsiStartTime} - {settings.resepsiEndTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 group/item">
                    <div className="w-10 h-10 sm:w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center group-hover/item:bg-gold/20 transition-colors mt-1">
                      <MapPin className="w-5 h-5 sm:w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">Lokasi</p>
                      <p className="font-semibold text-sm sm:text-base mb-4 leading-relaxed">{settings.resepsiLocation}</p>
                      <Button 
                        variant="gold" 
                        size="sm" 
                        className="rounded-full px-6"
                        onClick={() => settings.mapsUrl && window.open(settings.mapsUrl, '_blank')}
                      >
                        Buka Google Maps
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Love Story Section */}
      {settings.loveStory && settings.loveStory.length > 0 && (
        <motion.section 
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="py-20 sm:py-32 px-4 sm:px-6 bg-card/30 relative z-20"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-center text-foreground mb-16 sm:mb-20">Kisah Cinta Kami</h2>
            <div className="space-y-12 sm:space-y-16">
              {settings.loveStory.map((story, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 sm:gap-12`}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gold/10 flex items-center justify-center text-3xl sm:text-4xl shrink-0 shadow-lg mb-4 md:mb-0">
                    {story.icon}
                  </div>
                  <div className={`flex-1 text-center ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                    <span className="text-gold font-bold tracking-widest text-lg sm:text-xl block mb-2">{story.date}</span>
                    <h4 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{story.title}</h4>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-4 md:px-0">
                      {story.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Gallery Section */}
      {settings.galleryPhotos && settings.galleryPhotos.length > 0 && (
        <motion.section 
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="py-20 sm:py-32 px-4 sm:px-6 relative z-20"
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-center text-foreground mb-16 sm:mb-20">Momen Bahagia</h2>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
              {settings.galleryPhotos.map((photo, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-2xl overflow-hidden shadow-lg border border-gold/10"
                >
                  <img src={photo} alt={`Gallery ${index}`} className="w-full h-auto object-cover" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

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
            onConfirm={onRSVPSubmit}
            guestName={currentGuest?.name}
          />
        </div>
      </motion.section>

      {/* Gift Section */}
      {settings.bankAccounts && settings.bankAccounts.length > 0 && (
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
      )}

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
  );
};

export default DefaultTheme;
