"use client";

import { useRef, useState, useEffect } from "react";
import { r2Url } from "@/lib/r2-client";

export function HeroVideo({
  posterKey,
  videoKey,
  children,
}: {
  posterKey: string;
  videoKey: string;
  children?: React.ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [shouldPlayVideo, setShouldPlayVideo] = useState(true);

  const posterUrl = r2Url(posterKey);
  const videoUrl = r2Url(videoKey);

  useEffect(() => {
    // Respect reduced-motion preference — skip video entirely
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setShouldPlayVideo(false);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => setVideoReady(true);

    // If already cached and ready, fire immediately
    if (video.readyState >= 3) {
      setVideoReady(true);
    } else {
      video.addEventListener("canplay", handleCanPlay);
    }

    // Attempt play (mobile browsers sometimes require explicit call)
    video.play().catch(() => {
      // Autoplay blocked — poster stays, which is fine
    });

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  return (
    <div className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden">
      {/* Poster — always rendered, sits behind video */}
      {posterUrl && (
        <img
          src={posterUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          fetchPriority="high"
          aria-hidden="true"
        />
      )}

      {/* Video — fades in when ready */}
      {shouldPlayVideo && videoUrl && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterUrl ?? undefined}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Gradient overlay — darkens edges, keeps text readable */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70"
        aria-hidden="true"
      />

      {/* Content slot — title, buttons, etc. sit on top */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
        {children}
      </div>
    </div>
  );
}