import { Dialog, DialogContent } from '@/components/ui/dialog';
import { InvitationSettings } from '@/types/invitation';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Heart, Gift, ChevronDown } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface PreviewInvitationProps {
    isOpen: boolean;
    onClose: () => void;
    settings: InvitationSettings;
    guestName?: string;
}

export function PreviewInvitation({ isOpen, onClose, settings, guestName = 'Tamu Undangan' }: PreviewInvitationProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md h-[90vh] p-0 overflow-hidden">
                {/* Phone Mockup Container */}
                <div className="relative w-full h-full bg-background rounded-3xl overflow-hidden shadow-2xl">
                    {/* Scrollable Content */}
                    <div
                        ref={scrollRef}
                        className="w-full h-full overflow-y-auto scroll-smooth custom-scrollbar"
                    >
                        {/* Cover Section */}
                        <div
                            className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12"
                            style={{
                                backgroundImage: `url(https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1200&fit=crop)`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />

                            <div className="relative z-10 text-center">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-gold text-4xl mb-6"
                                >
                                    ✧
                                </motion.div>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="font-script text-4xl text-gold mb-3"
                                >
                                    The Wedding of
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="mb-4"
                                >
                                    <h1 className="font-heading text-3xl font-bold text-foreground tracking-wide uppercase">
                                        {settings.groomName}
                                    </h1>
                                    <span className="font-script text-3xl text-gold mx-2">&</span>
                                    <h1 className="font-heading text-3xl font-bold text-foreground tracking-wide uppercase">
                                        {settings.brideName}
                                    </h1>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex items-center gap-3 mb-12 justify-center"
                                >
                                    <div className="w-8 h-px bg-gold" />
                                    <p className="font-body text-gold text-sm tracking-[0.3em]">
                                        {formatDate(settings.akadDate).split(' ').slice(-3).join(' ').toUpperCase().replace(/\s/g, ' • ')}
                                    </p>
                                    <div className="w-8 h-px bg-gold" />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="bg-background/60 backdrop-blur-sm rounded-2xl px-8 py-6 border border-gold/30"
                                >
                                    <p className="font-body text-muted-foreground text-xs mb-2 tracking-wider uppercase">
                                        Kepada Yth.
                                    </p>
                                    <p className="font-heading text-xl text-foreground font-medium">
                                        Bapak/Ibu/Saudara/i
                                    </p>
                                    <p className="font-heading text-2xl text-gold font-semibold mt-1">
                                        {guestName}
                                    </p>
                                    <p className="font-body text-muted-foreground text-xs mt-3 italic">
                                        di Tempat
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="flex flex-col items-center text-muted-foreground mt-8"
                                >
                                    <span className="text-xs mb-2 tracking-wider">Scroll ke bawah</span>
                                    <motion.div
                                        animate={{ y: [0, 8, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <ChevronDown size={24} className="text-gold" />
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Quote Section */}
                        {settings.openingQuote && (
                            <div className="py-16 px-6 text-center bg-background">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                >
                                    <p className="font-script text-2xl text-gold mb-4">
                                        {settings.openingQuote}
                                    </p>
                                    <p className="font-body text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                                        Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta'ala,
                                        kami bermaksud menyelenggarakan pernikahan putra-putri kami:
                                    </p>
                                </motion.div>
                            </div>
                        )}

                        {/* Couple Section */}
                        <div className="py-16 px-6 bg-gradient-to-b from-background via-muted/30 to-background">
                            <div className="max-w-sm mx-auto">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="text-center mb-12"
                                >
                                    <p className="font-script text-3xl text-gold mb-2">Bride & Groom</p>
                                </motion.div>

                                {/* Bride */}
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="text-center mb-8"
                                >
                                    <div className="relative w-28 h-28 mx-auto mb-4">
                                        <div className="absolute inset-0 rounded-full border-2 border-gold" />
                                        <div className="absolute inset-2 rounded-full overflow-hidden">
                                            {settings.bridePhotoUrl ? (
                                                <img src={settings.bridePhotoUrl} alt={settings.brideFullName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                                                    <span className="font-script text-4xl text-gold">{settings.brideName[0]}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="font-heading text-xl text-foreground font-semibold mb-1">
                                        {settings.brideFullName}{settings.brideTitle && `, ${settings.brideTitle}`}
                                    </h3>
                                    <p className="font-body text-xs text-muted-foreground mb-1">
                                        {settings.brideDescription}
                                    </p>
                                    <p className="font-body text-sm text-foreground font-medium">
                                        Bpk. {settings.brideFatherName} & Ibu {settings.brideMotherName}
                                    </p>
                                </motion.div>

                                {/* Heart Divider */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="flex items-center justify-center gap-3 my-6"
                                >
                                    <div className="w-16 h-px bg-gradient-to-r from-transparent to-gold" />
                                    <Heart className="w-8 h-8 text-gold fill-gold/20" />
                                    <div className="w-16 h-px bg-gradient-to-l from-transparent to-gold" />
                                </motion.div>

                                {/* Groom */}
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="text-center mt-8"
                                >
                                    <div className="relative w-28 h-28 mx-auto mb-4">
                                        <div className="absolute inset-0 rounded-full border-2 border-gold" />
                                        <div className="absolute inset-2 rounded-full overflow-hidden">
                                            {settings.groomPhotoUrl ? (
                                                <img src={settings.groomPhotoUrl} alt={settings.groomFullName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                                                    <span className="font-script text-4xl text-gold">{settings.groomName[0]}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="font-heading text-xl text-foreground font-semibold mb-1">
                                        {settings.groomFullName}{settings.groomTitle && `, ${settings.groomTitle}`}
                                    </h3>
                                    <p className="font-body text-xs text-muted-foreground mb-1">
                                        {settings.groomDescription}
                                    </p>
                                    <p className="font-body text-sm text-foreground font-medium">
                                        Bpk. {settings.groomFatherName} & Ibu {settings.groomMotherName}
                                    </p>
                                </motion.div>
                            </div>
                        </div>

                        {/* Event Section */}
                        <div className="py-16 px-6 bg-muted/50">
                            <div className="max-w-sm mx-auto">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="text-center mb-10"
                                >
                                    <p className="font-script text-3xl text-gold mb-2">Save The Date</p>
                                    <h2 className="font-heading text-lg text-foreground">Waktu & Tempat Acara</h2>
                                </motion.div>

                                {/* Akad Nikah */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 mb-4 shadow-card border border-gold/20"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                                            <span className="text-gold text-lg">💍</span>
                                        </div>
                                        <h3 className="font-heading text-lg text-foreground font-semibold">
                                            Akad Nikah
                                        </h3>
                                    </div>
                                    <div className="space-y-2.5 pl-2">
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <Calendar size={16} className="text-gold flex-shrink-0" />
                                            <span className="font-body text-sm">{formatDate(settings.akadDate)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <Clock size={16} className="text-gold flex-shrink-0" />
                                            <span className="font-body text-sm">Pukul {settings.akadStartTime} - {settings.akadEndTime} WIB</span>
                                        </div>
                                        <div className="flex items-start gap-3 text-muted-foreground">
                                            <MapPin size={16} className="text-gold flex-shrink-0 mt-0.5" />
                                            <span className="font-body text-sm">{settings.akadLocation}</span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Resepsi */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 shadow-card border border-gold/20"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                                            <span className="text-gold text-lg">🎊</span>
                                        </div>
                                        <h3 className="font-heading text-lg text-foreground font-semibold">
                                            Resepsi Pernikahan
                                        </h3>
                                    </div>
                                    <div className="space-y-2.5 pl-2">
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <Calendar size={16} className="text-gold flex-shrink-0" />
                                            <span className="font-body text-sm">{formatDate(settings.resepsiDate)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <Clock size={16} className="text-gold flex-shrink-0" />
                                            <span className="font-body text-sm">Pukul {settings.resepsiStartTime} - {settings.resepsiEndTime} WIB</span>
                                        </div>
                                        <div className="flex items-start gap-3 text-muted-foreground">
                                            <MapPin size={16} className="text-gold flex-shrink-0 mt-0.5" />
                                            <span className="font-body text-sm">{settings.resepsiLocation}</span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Google Maps Button */}
                                {settings.mapsUrl && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className="text-center mt-6"
                                    >
                                        <a
                                            href={settings.mapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-gold-foreground text-sm font-medium hover:bg-gold/90 transition-colors"
                                        >
                                            <MapPin className="w-4 h-4" />
                                            Buka di Google Maps
                                        </a>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Love Story Section */}
                        {settings.loveStory && settings.loveStory.length > 0 && (
                            <div className="py-16 px-6 bg-background">
                                <div className="max-w-sm mx-auto">
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className="font-script text-2xl text-gold mb-8 text-center"
                                    >
                                        Love Story
                                    </motion.p>

                                    <div className="relative">
                                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold/50 via-gold to-gold/50" />

                                        {settings.loveStory.map((story, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: index * 0.2 }}
                                                className="relative flex gap-4 mb-6 last:mb-0"
                                            >
                                                <div className="relative z-10 w-10 h-10 rounded-full bg-card border-2 border-gold flex items-center justify-center shadow-card flex-shrink-0">
                                                    <span className="text-lg">{story.icon}</span>
                                                </div>
                                                <div className="flex-1 bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-gold/20 shadow-card">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-heading text-sm font-semibold text-foreground">
                                                            {story.title}
                                                        </h4>
                                                        <span className="font-body text-[10px] text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                                                            {story.date}
                                                        </span>
                                                    </div>
                                                    <p className="font-body text-xs text-muted-foreground leading-relaxed">
                                                        {story.description}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Gift Section */}
                        {settings.bankAccounts && settings.bankAccounts.length > 0 && (
                            <div className="py-16 px-6 bg-muted/50">
                                <div className="max-w-sm mx-auto text-center">
                                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                                        <Gift className="w-6 h-6 text-gold" />
                                    </div>
                                    <h2 className="font-script text-3xl text-gold mb-4">
                                        Kirim Hadiah
                                    </h2>
                                    <p className="font-body text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
                                        Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih, kami menyediakan informasi berikut:
                                    </p>

                                    <div className="space-y-4">
                                        {settings.bankAccounts.map((bank, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: index * 0.1 }}
                                                className="p-6 rounded-2xl bg-card border border-gold/20 shadow-card"
                                            >
                                                <p className="text-sm text-muted-foreground mb-2">{bank.bankName}</p>
                                                <p className="text-lg font-mono font-bold text-foreground">{bank.accountNumber}</p>
                                                <p className="text-sm text-muted-foreground mt-1">a.n. {bank.accountHolder}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <footer className="py-12 px-6 text-center bg-background">
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="max-w-md mx-auto"
                            >
                                <Heart className="w-8 h-8 text-gold mx-auto mb-4 fill-gold" />
                                {settings.closingMessage && (
                                    <p className="text-sm text-muted-foreground mb-6">
                                        {settings.closingMessage}
                                    </p>
                                )}
                                <p className="font-script text-xl text-foreground">
                                    {settings.groomName} & {settings.brideName}
                                </p>
                                <p className="text-xs text-muted-foreground mt-4">
                                    © 2024 Wedding Invitation
                                </p>
                            </motion.div>
                        </footer>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
