"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

/**
 * Poster-first preview inside the phone frame. The poster is a plain
 * next/image in the initial HTML (SEO carries it even without JS); the video
 * is pure progressive enhancement — preload="none", starts on hover and only
 * on devices that can actually hover. On touch the poster stays.
 */
export default function ThemePreview({
  poster,
  video,
  alt,
}: {
  poster: string;
  video: string;
  alt: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const start = () => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    void videoRef.current?.play().catch(() => {});
  };

  const stop = () => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    setPlaying(false);
  };

  return (
    <div
      className="relative w-full aspect-[135/226] rounded-[1.1rem] overflow-hidden bg-[#0d0d0d]"
      onMouseEnter={start}
      onMouseLeave={stop}
    >
      <Image
        src={poster}
        alt={alt}
        width={540}
        height={904}
        sizes="200px"
        className="w-full h-full object-cover"
      />
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          playing ? "opacity-100" : "opacity-0"
        }`}
        muted
        loop
        playsInline
        preload="none"
        // Decorative loop inside a phone mock, not a player — no PiP toggle.
        disablePictureInPicture
        onPlaying={() => setPlaying(true)}
        aria-hidden="true"
      >
        <source src={video} type="video/webm" />
      </video>
    </div>
  );
}
