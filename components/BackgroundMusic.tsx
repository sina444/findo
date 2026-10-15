'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/audio/garden-ambient.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    const tryPlay = () => {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay blocked — listen for first user interaction
          const startOnInteraction = () => {
            audio.play().then(() => setIsPlaying(true)).catch(() => {});
            document.removeEventListener('click', startOnInteraction);
            document.removeEventListener('scroll', startOnInteraction);
            document.removeEventListener('keydown', startOnInteraction);
            document.removeEventListener('touchstart', startOnInteraction);
          };
          document.addEventListener('click', startOnInteraction);
          document.addEventListener('scroll', startOnInteraction);
          document.addEventListener('keydown', startOnInteraction);
          document.addEventListener('touchstart', startOnInteraction);
        });
    };

    // Attempt autoplay immediately
    tryPlay();

    return () => {
      audio.pause();
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <button
      onClick={toggleMusic}
      aria-label={isPlaying ? 'قطع موسیقی' : 'پخش موسیقی'}
      className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-full border border-white/40 bg-white/80 px-4 py-2.5 shadow-lg backdrop-blur-md transition-all hover:bg-white/95 hover:shadow-xl"
      style={{ direction: 'rtl' }}
    >
      <span className="text-sm font-medium text-[#3F6B45]">
        شبا و باغچه
      </span>
      <span className={`flex items-end gap-0.5 ${isPlaying ? 'animate-pulse' : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="inline-block w-0.5 rounded-full bg-[#7FA77D]"
            style={{
              height: isPlaying ? `${8 + Math.sin(Date.now() / 200 + i) * 6 + 6}px` : '4px',
              transition: 'height 0.2s',
            }}
          />
        ))}
      </span>
      {isPlaying ? (
        <Volume2 size={16} className="text-[#3F6B45]" />
      ) : (
        <VolumeX size={16} className="text-[#9CA89E]" />
      )}
    </button>
  );
}
