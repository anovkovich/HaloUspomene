"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Mic, Square, Send, RotateCcw, Heart, Play, Pause } from "lucide-react";
import { getTranslations } from "../translations";
import { drawWaveform } from "./waveform";

type RecordingState =
  | "idle"
  | "requesting"
  | "recording"
  | "recorded"
  | "uploading"
  | "success";

const MAX_DURATION = 60; // seconds

const DEMO_MESSAGES = [
  { guestName: "Marija & Petar", durationMs: 15000 },
  { guestName: "Porodica Jovanović", durationMs: 20000 },
];

interface RecentMessage {
  guestName: string;
  durationMs: number;
  createdAt: string;
}

interface Props {
  slug: string;
  coupleNames: string;
  paidForAudio: boolean;
  eventDate: string;
  useCyrillic: boolean;
  recentMessages: RecentMessage[];
}

export default function AudioKnjigaClient({
  slug,
  coupleNames,
  paidForAudio,
  eventDate,
  useCyrillic,
  recentMessages,
}: Props) {
  const t = useMemo(() => getTranslations(useCyrillic), [useCyrillic]);

  const [state, setState] = useState<RecordingState>("idle");
  const [messages, setMessages] = useState(recentMessages);
  const [guestName, setGuestName] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(MAX_DURATION);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);
  const durationRef = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices) {
      setBrowserSupported(false);
    }
  }, []);

  const isWeddingDay = useMemo(() => {
    const now = new Date();
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);
    const dayAfter = new Date(event);
    dayAfter.setDate(dayAfter.getDate() + 1);
    dayAfter.setHours(23, 59, 59, 999);
    return now >= event && now <= dayAfter;
  }, [eventDate]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [audioUrl]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const handleRecordClick = useCallback(async () => {
    if (!paidForAudio) {
      showToast(t.audioDemoDescription);
      return;
    }
    if (!isWeddingDay) {
      showToast(t.audioNotAvailableYet);
      return;
    }

    setError(null);
    setState("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setState("recording");
      setSecondsLeft(MAX_DURATION);
      durationRef.current = 0;
      chunksRef.current = [];

      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      if (canvasRef.current) {
        drawWaveform(
          canvasRef.current,
          analyser,
          getComputedStyle(document.documentElement)
            .getPropertyValue("--theme-primary")
            .trim() || "#AE343F",
          animationRef
        );
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        recordedBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setState("recorded");
      };

      recorder.start();

      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            recorder.stop();
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setState("idle");
      setError("Molimo dozvolite pristup mikrofonu.");
    }
  }, [paidForAudio, isWeddingDay, showToast, t]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const submitRecording = useCallback(async () => {
    if (!recordedBlobRef.current || !guestName.trim()) return;

    setState("uploading");
    setError(null);

    const formData = new FormData();
    formData.append("audioBlob", recordedBlobRef.current, "recording.webm");
    formData.append("guestName", guestName.trim());
    formData.append("durationMs", String(durationRef.current * 1000));

    try {
      const res = await fetch(`/api/pozivnica/${slug}/audio`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      // Add to recent messages list
      setMessages((prev) => [
        {
          guestName: guestName.trim(),
          durationMs: durationRef.current * 1000,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setState("success");
    } catch (err) {
      setState("recorded");
      setError(err instanceof Error ? err.message : "Greška pri slanju");
    }
  }, [guestName, slug]);

  const resetRecording = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    recordedBlobRef.current = null;
    setGuestName("");
    setSecondsLeft(MAX_DURATION);
    durationRef.current = 0;
    setError(null);
    setState("idle");
  }, [audioUrl]);

  const formatDuration = (ms: number) => {
    const s = Math.round(ms / 1000);
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("sr-RS", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]"
      style={{ color: "var(--theme-text)" }}
    >
      <div className="max-w-lg mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="font-script text-4xl sm:text-6xl mb-3"
            style={{ color: "var(--theme-primary)" }}
          >
            {coupleNames}
          </h1>
          <div className="flex items-center justify-center gap-4 my-5">
            <div className="h-px w-12" style={{ backgroundColor: "var(--theme-border)" }} />
            <Heart
              size={14}
              fill="currentColor"
              style={{ color: "var(--theme-primary)", opacity: 0.5 }}
            />
            <div className="h-px w-12" style={{ backgroundColor: "var(--theme-border)" }} />
          </div>
          <p
            className="font-raleway text-xs uppercase tracking-widest"
            style={{ color: "var(--theme-text-light)" }}
          >
            {t.audioGuestBook}
          </p>
        </div>

        {/* Browser not supported */}
        {!browserSupported && (
          <div
            className="text-center py-12 px-6 rounded-2xl"
            style={{
              backgroundColor: "var(--theme-surface)",
              border: "1px solid var(--theme-border-light)",
            }}
          >
            <p className="font-serif text-base" style={{ color: "var(--theme-text-muted)" }}>
              Vaš pretraživač ne podržava snimanje zvuka. Pokušajte sa Chrome ili Safari.
            </p>
          </div>
        )}

        {/* Recording UI — always visible */}
        {browserSupported && (
          <div>
            {/* Idle state */}
            {state === "idle" && (
              <div className="text-center">
                <p
                  className="font-serif text-base mb-8"
                  style={{ color: "var(--theme-text-muted)" }}
                >
                  {t.audioRecordMessage}
                </p>

                <button
                  onClick={handleRecordClick}
                  className="w-28 h-28 rounded-full mx-auto flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: "var(--theme-primary)",
                    color: "#fff",
                    boxShadow: "0 0 0 8px rgba(174, 52, 63, 0.15)",
                  }}
                >
                  <Mic size={36} />
                </button>

                <p
                  className="mt-6 font-elegant text-xs uppercase tracking-widest"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  {t.audioMaxDuration}
                </p>
              </div>
            )}

            {/* Requesting permission */}
            {state === "requesting" && (
              <div className="text-center py-12">
                <div
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center animate-pulse"
                  style={{ backgroundColor: "var(--theme-primary)", color: "#fff" }}
                >
                  <Mic size={28} />
                </div>
                <p
                  className="mt-4 font-elegant text-sm"
                  style={{ color: "var(--theme-text-light)" }}
                >
                  Dozvolite pristup mikrofonu...
                </p>
              </div>
            )}

            {/* Recording */}
            {state === "recording" && (
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60" cy="60" r="54" fill="none"
                      stroke="var(--theme-border-light)" strokeWidth="4"
                    />
                    <circle
                      cx="60" cy="60" r="54" fill="none"
                      stroke="var(--theme-primary)" strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 54}`}
                      strokeDashoffset={`${2 * Math.PI * 54 * (secondsLeft / MAX_DURATION)}`}
                      style={{ transition: "stroke-dashoffset 1s linear" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-serif text-2xl tabular-nums" style={{ color: "var(--theme-text)" }}>
                      {secondsLeft}s
                    </span>
                  </div>
                </div>

                <canvas
                  ref={canvasRef} width={300} height={60}
                  className="mx-auto mb-6 rounded-lg"
                  style={{ backgroundColor: "var(--theme-surface)" }}
                />

                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-elegant text-xs uppercase tracking-widest text-red-500">
                    Snimanje
                  </span>
                </div>

                <button
                  onClick={stopRecording}
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all hover:scale-105 bg-red-500 text-white cursor-pointer"
                >
                  <Square size={24} fill="currentColor" />
                </button>
              </div>
            )}

            {/* Recorded — preview + name input */}
            {state === "recorded" && (
              <div className="space-y-6">
                <div
                  className="p-6 rounded-2xl"
                  style={{
                    backgroundColor: "var(--theme-surface)",
                    border: "1px solid var(--theme-border-light)",
                  }}
                >
                  {audioUrl && (
                    <audio src={audioUrl} controls className="w-full mb-4" style={{ height: "40px" }} />
                  )}
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder={t.audioYourName}
                    maxLength={100}
                    className="w-full px-4 py-3 rounded-xl text-sm font-serif focus:outline-none"
                    style={{
                      backgroundColor: "var(--theme-background)",
                      border: "1px solid var(--theme-border)",
                      color: "var(--theme-text)",
                    }}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={resetRecording}
                    className="flex-1 py-3 rounded-xl font-elegant text-sm uppercase tracking-widest transition-colors cursor-pointer"
                    style={{
                      backgroundColor: "var(--theme-surface)",
                      border: "1px solid var(--theme-border-light)",
                      color: "var(--theme-text-muted)",
                    }}
                  >
                    <RotateCcw size={14} className="inline mr-2 -mt-0.5" />
                    {t.audioRecordButton}
                  </button>
                  <button
                    onClick={submitRecording}
                    disabled={!guestName.trim()}
                    className="flex-1 py-3 rounded-xl font-elegant text-sm uppercase tracking-widest transition-colors disabled:opacity-40 cursor-pointer"
                    style={{ backgroundColor: "var(--theme-primary)", color: "#fff" }}
                  >
                    <Send size={14} className="inline mr-2 -mt-0.5" />
                    {t.audioSendMessage}
                  </button>
                </div>
              </div>
            )}

            {/* Uploading */}
            {state === "uploading" && (
              <div className="text-center py-12">
                <div
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center animate-pulse"
                  style={{ backgroundColor: "var(--theme-primary)", color: "#fff" }}
                >
                  <Send size={24} />
                </div>
                <p className="mt-4 font-elegant text-sm" style={{ color: "var(--theme-text-light)" }}>
                  Šaljem poruku...
                </p>
              </div>
            )}

            {/* Success */}
            {state === "success" && (
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6"
                  style={{ backgroundColor: "var(--theme-primary)", color: "#fff" }}
                >
                  <Heart size={32} fill="currentColor" />
                </div>
                <p className="font-serif text-2xl mb-2" style={{ color: "var(--theme-text)" }}>
                  {t.audioThankYou}
                </p>
                <button
                  onClick={resetRecording}
                  className="mt-8 py-3 px-8 rounded-xl font-elegant text-sm uppercase tracking-widest transition-colors cursor-pointer"
                  style={{
                    backgroundColor: "var(--theme-surface)",
                    border: "1px solid var(--theme-border-light)",
                    color: "var(--theme-text-muted)",
                  }}
                >
                  <Mic size={14} className="inline mr-2 -mt-0.5" />
                  {t.audioRecordAnother}
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="mt-4 text-center text-sm text-red-500">{error}</p>
            )}
          </div>
        )}

        {/* Recent messages / empty states */}
        <div className="mt-12">
          <p
            className="font-elegant text-xs uppercase tracking-widest mb-4 text-center"
            style={{ color: "var(--theme-text-light)" }}
          >
            {t.audioListenTitle}
          </p>

          {/* Paid + no messages → "be the first" */}
          {paidForAudio && messages.length === 0 && (
            <p
              className="text-center font-serif text-sm py-6"
              style={{ color: "var(--theme-text-light)" }}
            >
              {t.audioBeFirst}
            </p>
          )}

          {/* Unpaid → dummy messages */}
          {!paidForAudio && (
            <div className="space-y-2">
              {DEMO_MESSAGES.map((msg, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: "var(--theme-surface)",
                    border: "1px solid var(--theme-border-light)",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "var(--theme-primary)", color: "#fff" }}
                  >
                    <Mic size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm truncate" style={{ color: "var(--theme-text)" }}>
                      {msg.guestName}
                    </p>
                    <p className="text-xs" style={{ color: "var(--theme-text-light)" }}>
                      {formatDuration(msg.durationMs)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paid + has messages → real list (max 6, last faded) */}
          {paidForAudio && messages.length > 0 && (
            <div className="space-y-2">
              {messages.slice(0, 6).map((msg, i, arr) => (
                <div
                  key={`${msg.createdAt}-${i}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-opacity"
                  style={{
                    backgroundColor: "var(--theme-surface)",
                    border: "1px solid var(--theme-border-light)",
                    opacity: i === arr.length - 1 && messages.length > 5 ? 0.4 : 1,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "var(--theme-primary)", color: "#fff" }}
                  >
                    <Mic size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm truncate" style={{ color: "var(--theme-text)" }}>
                      {msg.guestName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs" style={{ color: "var(--theme-text-light)" }}>
                        {formatDuration(msg.durationMs)}
                      </span>
                      <span className="text-xs" style={{ color: "var(--theme-text-light)", opacity: 0.5 }}>
                        &middot;
                      </span>
                      <span className="text-xs" style={{ color: "var(--theme-text-light)", opacity: 0.7 }}>
                        {formatTimestamp(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-[fadeInUp_0.3s_ease-out]">
            <div
              className="px-6 py-3 rounded-xl shadow-lg text-sm font-serif text-center max-w-xs"
              style={{
                backgroundColor: "var(--theme-text)",
                color: "var(--theme-background)",
              }}
            >
              {toast}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
