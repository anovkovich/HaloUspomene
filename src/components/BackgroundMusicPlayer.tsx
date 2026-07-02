"use client";

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Music, Pause } from "lucide-react";

export interface BackgroundMusicHandle {
  /** Call INSIDE a user-gesture handler (e.g. the envelope tap) to unlock
   *  autoplay + start buffering, parked at the start of the track. */
  unlock: () => void;
  /** Call at the reveal moment to start playback from the top with a fade-in. */
  reveal: () => void;
}

interface Props {
  src: string;
  /** Hex accent for the button (defaults to brand red, premium passes gold). */
  accentHex?: string;
  /**
   * Premium mode: playback is driven externally via the imperative handle
   * (unlock() on the envelope tap, reveal() when the invitation opens), timed
   * to the envelope. Suppresses the mount-time autoplay attempt and the global
   * gesture listeners used by the classic (uncontrolled) path.
   */
  controlled?: boolean;
  /**
   * Frosted-glass button instead of a solid accent fill — matches the
   * glassmorphism cards (e.g. the watercolor time pills). Icon uses accentHex.
   */
  glass?: boolean;
}

// Floating bottom-right play/pause button for background music on invitations.
// Browsers block real autoplay without a user gesture, so this is an explicit
// "click to play" affordance — the subtle pulse on the resting state nudges
// users to notice that a song is available.
function BackgroundMusicPlayerInner(
  { src, accentHex = "#AE343F", controlled = false, glass = false }: Props,
  ref: React.Ref<BackgroundMusicHandle>,
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const fadeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearFade = () => {
    if (fadeTimer.current) {
      clearInterval(fadeTimer.current);
      fadeTimer.current = null;
    }
  };

  const fadeIn = (a: HTMLAudioElement, ms = 1200) => {
    clearFade();
    const steps = 24;
    let i = 0;
    a.volume = 0;
    fadeTimer.current = setInterval(() => {
      i++;
      a.volume = Math.min(1, i / steps);
      if (i >= steps) clearFade();
    }, ms / steps);
  };

  // Premium imperative control — timed to the envelope animation.
  useImperativeHandle(
    ref,
    () => ({
      unlock() {
        const a = audioRef.current;
        if (!a) return;
        // Play within the gesture to satisfy autoplay policy + warm the buffer,
        // then park at the start so the song begins from 0 at reveal() with no
        // fetch delay — and without playing 6s of silent intro under the cover.
        a.muted = false;
        a.volume = 0;
        a.play()
          .then(() => {
            a.pause();
            a.currentTime = 0;
          })
          .catch(() => {});
      },
      reveal() {
        const a = audioRef.current;
        if (!a) return;
        try {
          a.currentTime = 0;
        } catch {
          /* ignore */
        }
        a.muted = false;
        a.play()
          .then(() => {
            setIsPlaying(true);
            fadeIn(a);
          })
          .catch(() => setIsPlaying(false));
      },
    }),
    [],
  );

  // Uncontrolled (classic) path: try autoplay; if blocked, latch onto the first
  // user gesture anywhere on the page (scroll/click/touch/key) and play then.
  useEffect(() => {
    if (controlled) return;
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

    void tryPlay();

    const onGesture = () => void tryPlay();
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((ev) =>
      window.addEventListener(ev, onGesture, { passive: true }),
    );

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, onGesture));
    };
  }, [controlled]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      clearFade();
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.src = "";
      }
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
      clearFade();
      a.muted = false;
      a.volume = 1;
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
        preload={controlled ? "auto" : "none"}
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
        style={
          glass
            ? {
                // Frosted-glass look — mirrors the watercolor time pills.
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 50%, rgba(212,175,55,0.10) 100%)",
                backdropFilter: "blur(16px) saturate(140%)",
                WebkitBackdropFilter: "blur(16px) saturate(140%)",
                border: "1px solid rgba(255,255,255,0.22)",
                color: accentHex,
                boxShadow:
                  "0 12px 32px -12px rgba(0,0,0,0.45), 0 0 0 1px rgba(212,175,55,0.08), inset 0 1px 0 rgba(255,255,255,0.18)",
              }
            : {
                backgroundColor: accentHex,
                color: "#fff",
                boxShadow: `0 8px 24px ${accentHex}55`,
              }
        }
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

const BackgroundMusicPlayer = forwardRef(BackgroundMusicPlayerInner);
export default BackgroundMusicPlayer;
