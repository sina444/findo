'use client';

import { useState, useRef, useEffect } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';

export function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/audio/garden-ambient.mp3');
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    const handleCanPlay = () => setIsLoaded(true);
    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.load();

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
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
      disabled={!isLoaded}
      aria-label={isPlaying ? 'قطع موسیقی' : 'پخش موسیقی'}
      className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-full border border-white/40 bg-white/80 px-4 py-2.5 shadow-lg backdrop-blur-md transition-all hover:bg-white/95 hover:shadow-xl disabled:opacity-40"
      style={{ direction: 'rtl' }}
    >
      <span className="text-sm font-medium text-[#3F6B45]">
        موسیقی باغ
      </span>
      <span className={`flex items-center gap-0.5 ${isPlaying ? 'animate-pulse' : ''}`}>
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
