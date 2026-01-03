import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Send } from 'lucide-react';
import { toast } from 'sonner';

interface RSVPFormProps {
  guestName?: string;
  onConfirm?: (attendance: 'attending' | 'not-attending', guestCount: number, message: string) => Promise<void>;
}

const RSVPForm = ({ guestName, onConfirm }: RSVPFormProps) => {
  const [attendance, setAttendance] = useState<'attending' | 'not-attending' | null>(null);
  const [guests, setGuests] = useState('1');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!attendance) {
      toast.error('Silakan pilih kehadiran Anda');
      return;
    }

    setIsSubmitting(true);

    try {
      if (onConfirm) {
        await onConfirm(attendance, parseInt(guests), message);
      } else {
        // Simulator fallback if no handler
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      toast.success(`Terima kasih ${guestName ? guestName : ''}, konfirmasi Anda telah tersimpan!`);
    } catch (error) {
      toast.error("Gagal mengirim konfirmasi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSubmit}
      className="max-w-md mx-auto space-y-6"
    >
      {/* Attendance Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">
          Apakah Anda akan hadir?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setAttendance('attending')}
            className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${attendance === 'attending'
                ? 'border-green-500 bg-green-500/10 text-green-600'
                : 'border-border hover:border-green-500/50'
              }`}
          >
            <Check className="w-5 h-5" />
            <span className="font-medium">Ya, Hadir</span>
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setAttendance('not-attending')}
            className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${attendance === 'not-attending'
                ? 'border-red-500 bg-red-500/10 text-red-600'
                : 'border-border hover:border-red-500/50'
              }`}
          >
            <X className="w-5 h-5" />
            <span className="font-medium">Tidak Hadir</span>
          </motion.button>
        </div>
      </div>

      {/* Number of Guests */}
      {attendance === 'attending' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3"
        >
          <label className="block text-sm font-medium text-foreground">
            Jumlah Tamu
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full p-3 rounded-xl border border-border bg-card text-foreground focus:border-gold focus:ring-1 focus:ring-gold transition-all"
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num} Orang
              </option>
            ))}
          </select>
        </motion.div>
      )}

      {/* Message */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">
          Ucapan & Doa (Opsional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tulis ucapan dan doa untuk kedua mempelai..."
          rows={4}
          className="w-full p-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none"
        />
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 rounded-xl bg-gold text-gold-foreground font-semibold flex items-center justify-center gap-2 hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-gold-foreground/30 border-t-gold-foreground rounded-full"
          />
        ) : (
          <>
            <Send className="w-5 h-5" />
            Kirim Konfirmasi
          </>
        )}
      </motion.button>
    </motion.form>
  );
};

export default RSVPForm;
