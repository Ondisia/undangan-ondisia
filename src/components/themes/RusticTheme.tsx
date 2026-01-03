import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Heart, Gift, MessageCircle, Trees } from 'lucide-react';
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

const RusticTheme = ({ settings, currentGuest, onRSVPSubmit }: ThemeProps) => {
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
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 1 }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-[#5D5C4B] font-serif selection:bg-[#E2D6A2] overflow-x-hidden">
      {/* Music Player */}
      <MusicPlayer musicUrl={settings.musicUrl || ''} />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#3D3C2F]/30 z-10" />
          <img 
            src={settings.bridePhotoUrl || "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1600"} 
            alt="Wedding Hero" 
            className="w-full h-full object-cover grayscale-[20%]"
          />
        </div>

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
            className="bg-[#FDFCF0]/80 backdrop-blur-md p-10 sm:p-20 rounded-[50px] border-4 border-[#E2D6A2] relative"
          >
            {/* Decorative Leaves */}
            <div className="absolute -top-6 -left-6 rotate-[-45deg] opacity-40 hidden sm:block">
                <Trees size={64} className="text-[#8E9775]" />
            </div>
            <div className="absolute -bottom-6 -right-6 rotate-[135deg] opacity-40 hidden sm:block">
                <Trees size={64} className="text-[#8E9775]" />
            </div>

            <span className="text-[#8E9775] font-sans font-bold tracking-[0.4em] uppercase text-xs mb-6 block">Our Wedding Celebration</span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-playfair font-bold text-[#5D5C4B] mb-8 leading-tight">
              {settings.groomName.split(' ')[0]} <span className="text-[#8E9775]">&</span> {settings.brideName.split(' ')[0]}
            </h1>
            <p className="text-[#5D5C4B] text-lg sm:text-xl font-medium tracking-widest uppercase border-y border-[#E2D6A2] py-4 inline-block">
              {formatDate(settings.akadDate)}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Opening Section */}
      <section className="py-24 sm:py-32 px-4 relative overflow-hidden">
        <FloatingElements />
        <motion.div 
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center bg-white/40 p-12 rounded-3xl border border-[#E2D6A2]"
        >
          <Heart className="w-10 h-10 text-[#8E9775] mx-auto mb-10" />
          <p className="text-xl sm:text-2xl text-[#5D5C4B] leading-relaxed italic font-playfair font-normal">
            "{settings.openingQuote}"
          </p>
        </motion.div>
      </section>

      {/* Couple Section - Rustic Style */}
      <section className="py-24 sm:py-32 px-4">
        <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 sm:gap-24">
                {/* Groom */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="text-center group"
                >
                    <div className="relative mb-10 p-4 bg-white shadow-xl rotate-[-2deg] group-hover:rotate-0 transition-transform duration-500">
                        <img 
                            src={settings.groomPhotoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"} 
                            alt={settings.groomFullName} 
                            className="w-full h-[500px] object-cover"
                        />
                        <div className="absolute bottom-10 right-10 bg-white/90 p-4 text-[#8E9775] font-playfair text-xl italic font-bold">The Groom</div>
                    </div>
                    <h3 className="text-3xl font-playfair font-bold mb-4">{settings.groomFullName}</h3>
                    <p className="text-sm text-[#8E9775] max-w-xs mx-auto italic">
                        {settings.groomDescription}
                    </p>
                </motion.div>

                {/* Bride */}
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="text-center group"
                >
                    <div className="relative mb-10 p-4 bg-white shadow-xl rotate-[2deg] group-hover:rotate-0 transition-transform duration-500">
                        <img 
                            src={settings.bridePhotoUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800"} 
                            alt={settings.brideFullName} 
                            className="w-full h-[500px] object-cover"
                        />
                        <div className="absolute bottom-10 left-10 bg-white/90 p-4 text-[#8E9775] font-playfair text-xl italic font-bold">The Bride</div>
                    </div>
                    <h3 className="text-3xl font-playfair font-bold mb-4">{settings.brideFullName}</h3>
                    <p className="text-sm text-[#8E9775] max-w-xs mx-auto italic">
                        {settings.brideDescription}
                    </p>
                </motion.div>
            </div>
        </div>
      </section>

      {/* Event Details Section - Rustic */}
      <motion.section 
        className="py-24 sm:py-32 px-4 bg-[#8E9775] text-[#FDFCF0]"
      >
        <div className="max-w-5xl mx-auto space-y-16">
            <div className="text-center">
                <h2 className="text-4xl sm:text-5xl font-playfair font-bold mb-4 italic">Wedding Events</h2>
                <div className="h-1 w-20 bg-[#FDFCF0]/30 mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border border-[#FDFCF0]/20 p-10 rounded-2xl bg-[#3D3C2F]/5 space-y-8">
                    <h3 className="text-3xl font-playfair italic">Akad Nikah</h3>
                    <div className="space-y-4 font-sans text-sm tracking-widest font-light">
                        <div className="flex items-center gap-4">
                            <Calendar size={18} /> {formatDate(settings.akadDate)}
                        </div>
                        <div className="flex items-center gap-4">
                            <Clock size={18} /> {settings.akadStartTime} - {settings.akadEndTime}
                        </div>
                        <div className="flex items-start gap-4">
                            <MapPin size={18} className="shrink-0" /> {settings.akadLocation}
                        </div>
                    </div>
                </div>

                <div className="border border-[#FDFCF0]/20 p-10 rounded-2xl bg-[#3D3C2F]/5 space-y-8">
                    <h3 className="text-3xl font-playfair italic">Wedding Reception</h3>
                    <div className="space-y-4 font-sans text-sm tracking-widest font-light">
                        <div className="flex items-center gap-4">
                            <Calendar size={18} /> {formatDate(settings.resepsiDate)}
                        </div>
                        <div className="flex items-center gap-4">
                            <Clock size={18} /> {settings.resepsiStartTime} - {settings.resepsiEndTime}
                        </div>
                        <div className="flex items-start gap-4">
                            <MapPin size={18} className="shrink-0" /> {settings.resepsiLocation}
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center">
                <Button 
                    className="bg-[#FDFCF0] text-[#8E9775] hover:bg-[#FDFCF0]/90 px-10 h-14 rounded-full font-bold shadow-lg"
                    onClick={() => settings.mapsUrl && window.open(settings.mapsUrl, '_blank')}
                >
                    GET DIRECTIONS
                </Button>
            </div>
        </div>
      </motion.section>

      {/* RSVP Section - Rustic */}
      <section className="py-24 sm:py-32 px-4 relative">
        <div className="max-w-xl mx-auto text-center space-y-12">
            <Heart className="w-12 h-12 text-[#8E9775] mx-auto animate-pulse" />
            <h2 className="text-4xl font-playfair font-bold">Will You Attend?</h2>
            <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-[#E2D6A2]">
                <RSVPForm
                    onConfirm={onRSVPSubmit}
                    guestName={currentGuest?.name}
                />
            </div>
        </div>
      </section>

      {/* Gift Section - Rustic */}
      {settings.bankAccounts && settings.bankAccounts.length > 0 && (
          <section className="py-24 sm:py-32 px-4 bg-[#FDFCF0]">
            <div className="max-w-3xl mx-auto text-center space-y-12">
                 <h2 className="text-4xl font-playfair">Wedding Gift</h2>
                 <p className="text-[#5D5C4B]/70 italic leading-relaxed">Your blessings are enough for us, but if you want to give a gift, you can send it to the following accounts:</p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {settings.bankAccounts.map((account, index) => (
                        <div key={index} className="p-8 bg-white border-2 border-dashed border-[#8E9775]/30 rounded-3xl flex flex-col items-center gap-3">
                             <div className="text-[#8E9775] font-bold text-sm tracking-widest">{account.bankName}</div>
                             <div className="text-2xl font-bold font-playfair text-[#5D5C4B]">{account.accountNumber}</div>
                             <div className="text-xs opacity-60">a.n. {account.accountHolder}</div>
                        </div>
                    ))}
                 </div>
            </div>
          </section>
      )}

      {/* Rustic Footer */}
      <footer className="py-24 px-4 text-center border-t border-[#E2D6A2] bg-white">
        <div className="max-w-lg mx-auto space-y-12">
            <Heart className="w-8 h-8 text-[#8E9775] mx-auto fill-[#8E9775]" />
            <p className="font-playfair text-xl italic text-[#5D5C4B]">"Two souls with but a single thought, two hearts that beat as one."</p>
            <div className="space-y-4">
                <p className="font-playfair text-3xl font-bold text-[#8E9775]">With Love,</p>
                <p className="font-playfair text-4xl">{settings.groomName.split(' ')[0]} & {settings.brideName.split(' ')[0]}</p>
            </div>
            <p className="text-[10px] tracking-[0.4em] text-[#8E9775] font-sans pt-12 uppercase">Created with affection by Ondisia</p>
        </div>
      </footer>
    </div>
  );
};

export default RusticTheme;
