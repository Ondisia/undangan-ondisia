import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Heart, Gift, MessageCircle, Instagram } from 'lucide-react';
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

const ModernTheme = ({ settings, currentGuest, onRSVPSubmit }: ThemeProps) => {
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
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { duration: 1.2 }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#333] font-serif selection:bg-black/10 selection:text-black overflow-x-hidden">
      {/* Music Player */}
      <MusicPlayer musicUrl={settings.musicUrl || ''} />
      
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center px-4 overflow-hidden border-b border-black/5">
        <motion.div
           initial={{ opacity: 0, scale: 1.1 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 2.5 }}
           className="absolute inset-0 z-0 pointer-events-none"
        >
            <div className="absolute inset-0 bg-white/20 z-10" />
            <img 
                src={settings.bridePhotoUrl || "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600"} 
                alt="Wedding Hero" 
                className="w-full h-full object-cover"
            />
        </motion.div>

        <div className="relative z-20 text-center space-y-8 bg-white/90 backdrop-blur-sm p-12 sm:p-20 border border-black/5 shadow-2xl skew-x-[-1deg] hover:skew-x-0 transition-transform duration-1000">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="skew-x-[1deg]"
          >
            <h2 className="text-sm font-sans tracking-[0.5em] uppercase text-muted-foreground mb-4">You are invited to the wedding of</h2>
            <h1 className="text-6xl sm:text-8xl font-playfair font-normal leading-tight">
              {settings.groomName.split(' ')[0]} <br/> <span className="italic font-light">&</span> <br/> {settings.brideName.split(' ')[0]}
            </h1>
            <div className="h-[2px] w-12 bg-black/20 mx-auto my-8" />
            <p className="text-base font-sans tracking-[0.3em] font-light uppercase">
              {formatDate(settings.akadDate)}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Opening Section */}
      <motion.section 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-24 sm:py-32 px-4 text-center max-w-2xl mx-auto"
      >
        <p className="text-lg leading-relaxed text-muted-foreground italic font-light font-playfair">
           "{settings.openingQuote || "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya."}"
        </p>
      </motion.section>

      {/* Couple Detail Section */}
      <section className="py-24 sm:py-32 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
            >
                <div className="aspect-[4/5] bg-gray-100 overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000">
                    <img 
                        src={settings.groomPhotoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"} 
                        alt={settings.groomFullName} 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="space-y-2">
                    <h3 className="text-4xl font-playfair">{settings.groomFullName}</h3>
                    <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground">The Groom</p>
                    <p className="text-muted-foreground pt-4 leading-relaxed font-sans text-sm">
                        {settings.groomDescription || `Son of Mr. ${settings.groomFatherName} and Mrs. ${settings.groomMotherName}`}
                    </p>
                    <Button variant="ghost" size="sm" className="p-0 h-auto font-sans text-[10px] tracking-widest hover:bg-transparent hover:text-black">
                        <Instagram className="w-3 h-3 mr-2" /> @INSTAGRAM
                    </Button>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6 md:pt-32"
            >
                <div className="aspect-[4/5] bg-gray-100 overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000">
                    <img 
                        src={settings.bridePhotoUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800"} 
                        alt={settings.brideFullName} 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="space-y-2">
                    <h3 className="text-4xl font-playfair">{settings.brideFullName}</h3>
                    <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground">The Bride</p>
                    <p className="text-muted-foreground pt-4 leading-relaxed font-sans text-sm">
                        {settings.brideDescription || `Daughter of Mr. ${settings.brideFatherName} and Mrs. ${settings.brideMotherName}`}
                    </p>
                    <Button variant="ghost" size="sm" className="p-0 h-auto font-sans text-[10px] tracking-widest hover:bg-transparent hover:text-black">
                        <Instagram className="w-3 h-3 mr-2" /> @INSTAGRAM
                    </Button>
                </div>
            </motion.div>
        </div>
      </section>

      {/* Modern Event Section */}
      <section className="py-24 sm:py-40 px-4 bg-[#1a1a1a] text-white">
        <div className="max-w-4xl mx-auto space-y-32">
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center space-y-12"
            >
                <div className="font-sans text-[10px] tracking-[0.8em] uppercase opacity-50">Saved the date</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h4 className="text-2xl font-playfair italic border-b border-white/10 pb-4">The Ceremony</h4>
                        <div className="space-y-2 font-sans text-sm tracking-widest">
                            <p>{formatDate(settings.akadDate)}</p>
                            <p>{settings.akadStartTime} - {settings.akadEndTime} WIB</p>
                            <p className="opacity-60 pt-4 leading-relaxed max-w-xs mx-auto">{settings.akadLocation}</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h4 className="text-2xl font-playfair italic border-b border-white/10 pb-4">The Reception</h4>
                        <div className="space-y-2 font-sans text-sm tracking-widest">
                            <p>{formatDate(settings.resepsiDate)}</p>
                            <p>{settings.resepsiStartTime} - {settings.resepsiEndTime} WIB</p>
                            <p className="opacity-60 pt-4 leading-relaxed max-w-xs mx-auto">{settings.resepsiLocation}</p>
                        </div>
                    </div>
                </div>
                <Button 
                    className="mt-12 bg-white text-black hover:bg-white/90 rounded-none px-12 py-6 h-auto tracking-[0.2em] text-xs font-sans"
                    onClick={() => settings.mapsUrl && window.open(settings.mapsUrl, '_blank')}
                >
                    <MapPin className="w-3 h-3 mr-2" /> SEE LOCATION
                </Button>
            </motion.div>
        </div>
      </section>

      {/* Countdown Modern */}
      <section className="py-24 sm:py-32 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-12 font-sans">
             <h3 className="text-xs tracking-[0.5em] uppercase text-muted-foreground font-bold">Countdown</h3>
             <CountdownTimer targetDate={settings.eventDate} />
        </div>
      </section>

      {/* RSVP Section - Minimalist */}
      <section className="py-24 sm:py-32 px-4 bg-[#F8F7F4] border-t border-black/5">
        <div className="max-w-xl mx-auto text-center space-y-12">
            <h2 className="text-4xl font-playfair">RSVP</h2>
            <p className="text-muted-foreground text-sm leading-relaxed font-sans tracking-wide">
                We hope you will join us in celebrating our marriage. <br/> Please respond by the 10th of May.
            </p>
            <div className="bg-white p-8 border border-black/5 shadow-sm">
                <RSVPForm
                    onConfirm={onRSVPSubmit}
                    guestName={currentGuest?.name}
                />
            </div>
        </div>
      </section>

      {/* Gift Section - Modern */}
      {settings.bankAccounts && settings.bankAccounts.length > 0 && (
          <section className="py-24 sm:py-32 px-4 bg-white border-b border-black/5">
            <div className="max-w-2xl mx-auto text-center space-y-12">
                 <h2 className="text-4xl font-playfair italic underline underline-offset-8">Gifts</h2>
                 <p className="text-sm font-sans tracking-wide leading-relaxed text-muted-foreground">Your presence is the greatest gift. However, should you wish to honour us with a present, a contribution can be made below.</p>
                 <div className="grid grid-cols-1 gap-4 font-sans uppercase tracking-[0.2em] text-[10px]">
                    {settings.bankAccounts.map((account, index) => (
                        <div key={index} className="p-8 border border-black/10 hover:border-black transition-colors flex flex-col items-center gap-2">
                             <div className="font-bold opacity-40">{account.bankName}</div>
                             <div className="text-lg font-normal tracking-[0.3em] my-2">{account.accountNumber}</div>
                             <div className="opacity-60">{account.accountHolder}</div>
                        </div>
                    ))}
                 </div>
            </div>
          </section>
      )}

      {/* Modern Footer */}
      <footer className="py-24 sm:py-32 px-4 text-center space-y-8">
        <div className="max-w-lg mx-auto space-y-4">
            <p className="font-playfair text-2xl italic">Until We Meet Again</p>
            <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-muted-foreground">Love, {settings.groomName.split(' ')[0]} & {settings.brideName.split(' ')[0]}</p>
        </div>
        <div className="pt-12 border-t border-black/5 max-w-xs mx-auto mt-20">
            <p className="text-[9px] font-sans tracking-widest text-muted-foreground uppercase">© 2024 Ondisia Digital Studio</p>
        </div>
      </footer>
    </div>
  );
};

export default ModernTheme;
