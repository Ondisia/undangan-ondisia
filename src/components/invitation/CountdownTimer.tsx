import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  targetDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer = ({ targetDate }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timeBlocks = [
    { label: 'Hari', value: timeLeft.days },
    { label: 'Jam', value: timeLeft.hours },
    { label: 'Menit', value: timeLeft.minutes },
    { label: 'Detik', value: timeLeft.seconds },
  ];

  return (
    <div className="flex justify-center gap-3 sm:gap-6">
      {timeBlocks.map((block, index) => (
        <motion.div
          key={block.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="text-center"
        >
          <motion.div
            key={block.value}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-card/80 backdrop-blur-sm border border-gold/30 flex items-center justify-center shadow-elegant"
          >
            <span className="text-2xl sm:text-3xl font-playfair font-bold text-gold">
              {block.value.toString().padStart(2, '0')}
            </span>
          </motion.div>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-medium">
            {block.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default CountdownTimer;
