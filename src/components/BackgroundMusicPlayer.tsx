"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Pause } from "lucide-react";

interface Props {
  src: string;
  /** Hex accent for the button (defaults to brand red, premium passes gold). */
  accentHex?: string;
}

// Floating bottom-right play/pause button for background music on invitations.
// Browsers block real autoplay without a user gesture, so this is an explicit
// "click to play" affordance — the subtle pulse on the resting state nudges
// users to notice that a song is available.
export default function BackgroundMusicPlayer({
  src,
  accentHex = "#AE343F",
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Try autoplay; if blocked by the browser, latch onto the first user
  // gesture anywhere on the page (scroll/click/touch/key) and play then.
  // The envelope opener does NOT count as a gesture (it runs from useEffect),
  // so this gesture-listener path is what actually starts the music for most
  // visitors on desktop Chrome (post-MEI it sometimes autoplays directly).
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    let unlocked = false;
    const tryPlay = async () => {
      if (unlocked) return;
      try {
        await a.play();
        unlocked = true;
        setIsPlaying(true);
      } catch {
        /* still blocked — wait for next gesture */
      }
    };

    // First attempt: works on desktop Chrome when the domain has high
    // Media Engagement Index (visitor opened audio here before).
    void tryPlay();

    const onGesture = () => {
      void tryPlay();
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((ev) =>
      window.addEventListener(ev, onGesture, { passive: true, once: false }),
    );

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, onGesture));
      a.pause();
      a.src = "";
    };
  }, []);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) {
      a.pause();
      setIsPlaying(false);
      return;
    }
    try {
      await a.play();
      setIsPlaying(true);
    } catch {
      // play() can reject on user-gesture / autoplay policies — silently
      // ignore, the user can retry by tapping again.
      setIsPlaying(false);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="none"
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? "Pauziraj muziku" : "Pusti muziku"}
        className={`fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
          isPlaying ? "" : "animate-pulse-slow"
        }`}
        style={{
          backgroundColor: accentHex,
          color: "#fff",
          boxShadow: `0 8px 24px ${accentHex}55`,
        }}
      >
        {isPlaying ? (
          <Pause size={18} fill="currentColor" />
        ) : (
          <Music size={18} />
        )}
      </button>
      <style jsx>{`
        @keyframes pulse-slow {
          0%,
          100% {
            box-shadow: 0 8px 24px ${accentHex}55,
              0 0 0 0 ${accentHex}66;
          }
          50% {
            box-shadow: 0 8px 24px ${accentHex}55,
              0 0 0 12px ${accentHex}00;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2.4s ease-out infinite;
        }
      `}</style>
    </>
  );
}
