'use client';

import { useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * ScrollDrivenVideoHero
 *
 * A premium scroll-driven 3D hero experience.
 * The user's vertical scroll position controls the video's currentTime.
 * The video is NEVER played via video.play() — we scrub the timeline directly.
 *
 * Architecture:
 *  - A tall outer section (300vh) creates the scroll runway.
 *  - An inner sticky container (100vh) pins the video viewport.
 *  - scroll progress through the outer section maps 0%→0% video, 100%→100% video.
 *  - A single passive scroll listener updates a `targetTime` ref (no React state).
 *  - A requestAnimationFrame loop interpolates currentTime toward targetTime
 *    using a smoothing factor, preventing harsh jumps while staying responsive.
 *  - Only meaningful deltas ( > 0.001s ) actually write to video.currentTime,
 *    preventing seeking floods.
 *
 * Video encoding notes:
 *  - Re-encoded with -g 10 (keyframe every 10 frames) and +faststart (moov atom
 *    at file start) for fast random-access seeking during scroll scrubbing.
 *  - A mobile variant (720p, lower bitrate) is served via <source> for small screens.
 *  - prefers-reduced-motion: falls back to a static poster frame hero.
 */

const SCROLL_RUNWAY_VH = 300; // total scroll distance for the hero
const SMOOTHING = 0.12; // interpolation factor — lower = smoother but more lag; higher = more responsive
const MIN_DELTA = 0.003; // minimum time difference (seconds) before we actually seek

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);

  // Mutable refs for the animation loop — no React state to avoid re-renders
  const targetTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const videoReadyRef = useRef(false);
  const reducedMotionRef = useRef(false);

  // The rAF loop that smoothly interpolates video.currentTime toward targetTime
  const animateLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video || !videoReadyRef.current) {
      rafRef.current = requestAnimationFrame(animateLoop);
      return;
    }

    const target = targetTimeRef.current;
    const current = currentTimeRef.current;
    const diff = target - current;

    // Only seek when the difference is meaningful
    if (Math.abs(diff) > MIN_DELTA) {
      const newTime = current + diff * SMOOTHING;
      // Clamp to valid range
      const clampedTime = Math.max(0, Math.min(newTime, video.duration || 0));
      try {
        video.currentTime = clampedTime;
        currentTimeRef.current = clampedTime;
      } catch {
        // Seeking can throw if the video isn't fully buffered — ignore
      }
    }

    // Fade text out as the user scrolls through the first 40% of the hero
    if (textRef.current) {
      const scrollProgress = target / (video.duration || 1);
      const opacity = Math.max(0, 1 - scrollProgress * 2.5);
      const translateY = scrollProgress * -60;
      textRef.current.style.opacity = String(opacity);
      textRef.current.style.transform = `translateY(${translateY}px)`;
    }

    rafRef.current = requestAnimationFrame(animateLoop);
  }, []);

  // Scroll handler — lightweight, only updates target time ref
  const handleScroll = useCallback(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video || !videoReadyRef.current) return;

    const rect = section.getBoundingClientRect();
    const sectionHeight = rect.height;
    const viewportHeight = window.innerHeight;

    // How far we've scrolled through the hero section (0 to 1)
    // Starts when the section top hits the viewport top, ends when section bottom hits viewport bottom
    const scrolled = -rect.top;
    const scrollable = sectionHeight - viewportHeight;
    const progress = Math.max(0, Math.min(1, scrolled / scrollable));

    const duration = video.duration || 0;
    targetTimeRef.current = progress * duration;
  }, []);

  // Setup on mount
  useEffect(() => {
    // Check reduced motion preference
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mq.matches;

    // If reduced motion, show fallback (static hero with poster image)
    if (reducedMotionRef.current) {
      if (fallbackRef.current) fallbackRef.current.style.display = 'block';
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const onLoadedData = () => {
      videoReadyRef.current = true;
      // Set initial frame
      video.currentTime = 0;
      currentTimeRef.current = 0;
      targetTimeRef.current = 0;
      // Start the rAF loop
      rafRef.current = requestAnimationFrame(animateLoop);
      // Handle initial scroll position
      handleScroll();
    };

    const onError = () => {
      // Video failed — show fallback image
      if (fallbackRef.current) fallbackRef.current.style.display = 'block';
      if (videoRef.current) videoRef.current.style.display = 'none';
    };

    if (video.readyState >= 2) {
      onLoadedData();
    } else {
      video.addEventListener('loadeddata', onLoadedData);
    }
    video.addEventListener('error', onError);

    // Passive scroll listener — only updates target time, no heavy work
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (video) {
        video.removeEventListener('loadeddata', onLoadedData);
        video.removeEventListener('error', onError);
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animateLoop, handleScroll]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: `${SCROLL_RUNWAY_VH}vh` }}
    >
      {/* Sticky video viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Video element */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          preload="auto"
          muted
          playsInline
          poster="/videos/hero-poster.jpg"
        >
          <source src="/videos/hero-mobile.mp4" type="video/mp4" media="(max-width: 768px)" />
          <source src="/videos/hero-desktop.mp4" type="video/mp4" />
        </video>

        {/* Fallback image (shown if video fails or reduced motion) */}
        <div
          ref={fallbackRef}
          className="absolute inset-0 hidden"
          style={{ display: 'none' }}
        >
          <img
            src="/images/1416879595882-3373a0480b5b.jpg"
            alt="Lush indoor plants and gardening tools on a table in natural sunlight"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Subtle overlay for text readability — kept light so video stays dominant */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-transparent" />

        {/* Hero content */}
        <div className="relative flex h-full items-center">
          <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div ref={textRef} className="max-w-xl will-change-transform">
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                Bring Nature Home
              </h1>
              <p className="mt-4 text-lg text-white/90 md:text-xl">
                Premium plants, gardening tools, and outdoor essentials.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#3F6B45] px-7 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#4A7D52] hover:shadow-xl"
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/#categories"
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-white/80 px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-white hover:text-[#3F6B45]"
                >
                  Explore Collections
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint — subtle indicator at the bottom */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-widest">Scroll to explore</span>
            <div className="h-10 w-6 rounded-full border-2 border-white/40">
              <div className="mx-auto mt-2 h-2 w-1 rounded-full bg-white/60" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
