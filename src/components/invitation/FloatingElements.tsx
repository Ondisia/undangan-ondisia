import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const FloatingElements = () => {
  const hearts = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
    size: 12 + Math.random() * 16,
  }));

  const petals = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 15 + Math.random() * 10,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {/* Floating Hearts */}
      {hearts.map((heart) => (
        <motion.div
          key={`heart-${heart.id}`}
          className="absolute text-gold/30"
          style={{ left: `${heart.x}%` }}
          initial={{ y: '110vh', opacity: 0, rotate: 0 }}
          animate={{
            y: '-10vh',
            opacity: [0, 0.6, 0.6, 0],
            rotate: [0, 20, -20, 0],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Heart style={{ width: heart.size, height: heart.size }} fill="currentColor" />
        </motion.div>
      ))}

      {/* Falling Petals */}
      {petals.map((petal) => (
        <motion.div
          key={`petal-${petal.id}`}
          className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-rose-200/40 to-rose-300/40"
          style={{ left: `${petal.x}%` }}
          initial={{ y: '-5vh', opacity: 0, x: 0, rotate: 0 }}
          animate={{
            y: '110vh',
            opacity: [0, 0.8, 0.8, 0],
            x: [0, 30, -30, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Sparkles */}
      {Array.from({ length: 30 }, (_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-1 h-1 bg-gold/60 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 5,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingElements;
