import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Pause, Play, Volume2, VolumeX } from 'lucide-react';

interface MusicPlayerProps {
  autoPlay?: boolean;
  musicUrl?: string;
}

const MusicPlayer = ({ autoPlay = false, musicUrl }: MusicPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Default fallback if no music provided
  const sourceUrl = musicUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.loop = true;
    }
  }, []);

  const handlePlay = async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setShowPrompt(false);
      } catch (error) {
        console.log('Audio play failed:', error);
      }
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={sourceUrl} preload="auto" />

      {/* Play Music Prompt */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center p-8 rounded-2xl bg-card border border-gold/30 shadow-elegant max-w-sm mx-4"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-4"
              >
                <Music className="w-16 h-16 text-gold" />
              </motion.div>
              <h3 className="text-xl font-playfair font-bold text-foreground mb-2">
                Putar Musik Latar?
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                Nikmati undangan dengan musik yang romantis
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowPrompt(false)}
                  className="px-6 py-2 rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors"
                >
                  Lewati
                </button>
                <button
                  onClick={handlePlay}
                  className="px-6 py-2 rounded-full bg-gold text-gold-foreground hover:bg-gold/90 transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Putar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Music Control */}
      {!showPrompt && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-6 right-6 z-40 flex gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMute}
            className="w-12 h-12 rounded-full bg-card border border-gold/30 shadow-lg flex items-center justify-center text-gold hover:bg-gold/10 transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-gold text-gold-foreground shadow-lg flex items-center justify-center hover:bg-gold/90 transition-colors"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </motion.button>
        </motion.div>
      )}
    </>
  );
};

export default MusicPlayer;
