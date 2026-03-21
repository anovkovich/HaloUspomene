"use client";

import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Trash2,
  Download,
  RefreshCw,
  Heart,
  Mic,
  QrCode,
  Lock,
  ExternalLink,
  Phone,
  Gift,
  X,
  Check,
  ArrowLeft,
} from "lucide-react";
import { getTranslations } from "../../translations";
import { refreshAudioMessages, deleteAudioMsg } from "./actions";
import { mergeAndDownload } from "./mergeAudio";
import { generateAudioFlyerPDF } from "./generateAudioFlyerPDF";
import type { AudioMessage } from "@/lib/audio";

const DEMO_MESSAGES: AudioMessage[] = [
  {
    _id: "demo-1",
    slug: "",
    guestName: "Jovana & Stefan",
    blobUrl: "/audio/demo/demo-message-1.webm",
    blobPathname: "",
    durationMs: 8000,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-2",
    slug: "",
    guestName: "Porodica Jovanović",
    blobUrl: "/audio/demo/demo-message-2.webm",
    blobPathname: "",
    durationMs: 10000,
    createdAt: new Date().toISOString(),
  },
];

interface Props {
  messages: AudioMessage[];
  fetchError: boolean;
  slug: string;
  coupleNames: string;
  useCyrillic: boolean;
  paidForAudio: boolean;
  primaryColor: string;
  scriptFont?: string;
}

export default function SlusajClient({
  messages: initialMessages,
  fetchError,
  slug,
  coupleNames,
  useCyrillic,
  paidForAudio,
  primaryColor,
  scriptFont,
}: Props) {
  const t = useMemo(() => getTranslations(useCyrillic), [useCyrillic]);

  const [messages, setMessages] = useState(initialMessages);
  const [playing, setPlaying] = useState<string | null>(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [merging, setMerging] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalDuration = useMemo(
    () => messages.reduce((sum, m) => sum + m.durationMs, 0),
    [messages],
  );

  const formatDuration = (ms: number) => {
    const s = Math.round(ms / 1000);
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const formatSecs = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = Math.floor(secs % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(useCyrillic ? "sr-Cyrl-RS" : "sr-Latn-RS", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const togglePlay = useCallback(
    (id: string, url: string, knownDurationMs?: number) => {
      if (playing === id) {
        audioRef.current?.pause();
        setPlaying(null);
        setPlaybackTime(0);
        setPlaybackDuration(0);
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.ontimeupdate = () => {
        setPlaybackTime(audio.currentTime);
      };
      audio.onloadedmetadata = () => {
        setPlaybackDuration(
          knownDurationMs ? knownDurationMs / 1000 : audio.duration,
        );
      };
      audio.onended = () => {
        setPlaying(null);
        setPlaybackTime(0);
        setPlaybackDuration(0);
      };
      audio.onerror = () => {
        setPlaying(null);
        setPlaybackTime(0);
        setPlaybackDuration(0);
      };
      audio.play().catch(() => {
        setPlaying(null);
      });
      setPlaying(id);
      setPlaybackTime(0);
    },
    [playing],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const result = await refreshAudioMessages(slug);
    if (result.success && result.messages) {
      setMessages(result.messages);
    }
    setRefreshing(false);
  }, [slug]);

  const handleDelete = useCallback(
    async (msg: AudioMessage) => {
      setDeleting(msg._id);
      setConfirmingDelete(null);

      if (playing === msg._id) {
        audioRef.current?.pause();
        setPlaying(null);
        setPlaybackTime(0);
        setPlaybackDuration(0);
      }

      const result = await deleteAudioMsg(slug, msg._id, msg.blobUrl);
      if (result.success) {
        setMessages((prev) => prev.filter((m) => m._id !== msg._id));
      }
      setDeleting(null);
    },
    [slug, playing],
  );

  const handleMergeDownload = useCallback(async () => {
    if (messages.length === 0) return;
    setMerging(true);
    try {
      const urls = messages.map((m) => m.blobUrl);
      const safeName = coupleNames
        .replace(/[^a-zA-Z0-9\u0400-\u04FF\s-]/g, "")
        .replace(/\s+/g, "-");
      await mergeAndDownload(urls, `audio-knjiga-${safeName}.wav`);
    } catch {
      alert("Greška pri spajanju audio fajlova.");
    }
    setMerging(false);
  }, [messages, coupleNames]);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#f5f4dc] to-[#faf9f6]"
      style={{ color: "var(--theme-text)" }}
    >
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 [@media(display-mode:standalone)]:pt-4">
        <Link
          href={`/pozivnica/${slug}/portal`}
          className="inline-flex items-center gap-1.5 text-sm font-raleway mb-8 transition-opacity hover:opacity-70 [@media(display-mode:standalone)]:hidden"
          style={{ color: "var(--theme-text-light)" }}
        >
          <ArrowLeft size={14} /> Portal
        </Link>

        {/* Header */}
        <div className="text-center mb-10 pwa-heading-section">
          <h1
            className="font-script text-4xl sm:text-6xl mb-3"
            style={{ color: "var(--theme-primary)" }}
          >
            {coupleNames}
          </h1>
          <div className="flex items-center justify-center gap-4 my-5 [@media(display-mode:standalone)]:hidden">
            <div
              className="h-px w-12"
              style={{ backgroundColor: "var(--theme-border)" }}
            />
            <Heart
              size={14}
              fill="currentColor"
              style={{ color: "var(--theme-primary)", opacity: 0.5 }}
            />
            <div
              className="h-px w-12"
              style={{ backgroundColor: "var(--theme-border)" }}
            />
          </div>
          <p
            className="font-raleway text-xs uppercase tracking-widest [@media(display-mode:standalone)]:hidden"
            style={{ color: "var(--theme-text-light)" }}
          >
            {t.audioListenTitle}
          </p>
        </div>

        {/* ═══ DEMO MODE ═══ */}
        {!paidForAudio && (
          <>
            {/* 1. Demo banner */}
            <div
              className="text-center py-6 px-6 rounded-2xl mb-4"
              style={{
                backgroundColor: "var(--theme-surface)",
                border: "1px solid var(--theme-border-light)",
              }}
            >
              <Lock
                size={28}
                style={{ color: "var(--theme-primary)", opacity: 0.5 }}
                className="mx-auto mb-3"
              />
              <p
                className="font-serif text-lg mb-1"
                style={{ color: "var(--theme-text)" }}
              >
                {t.audioDemoTitle}
              </p>
              <p
                className="font-elegant text-sm"
                style={{ color: "var(--theme-text-light)" }}
              >
                {t.audioDemoDescription}
              </p>
            </div>

            {/* 2. Demo messages preview */}
            <div
              className="rounded-2xl overflow-hidden mb-4"
              style={{ border: "1px solid var(--theme-border-light)" }}
            >
              {/* Stats header */}
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ backgroundColor: "var(--theme-surface)" }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Mic size={14} style={{ color: "var(--theme-primary)" }} />
                    <span style={{ color: "var(--theme-text-muted)" }}>
                      {DEMO_MESSAGES.length} poruka
                    </span>
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--theme-text-light)" }}
                  >
                    {formatDuration(
                      DEMO_MESSAGES.reduce((s, m) => s + m.durationMs, 0),
                    )}{" "}
                    ukupno
                  </div>
                </div>
              </div>

              {/* Message cards */}
              <div className="space-y-px">
                {DEMO_MESSAGES.map((msg) => (
                  <div
                    key={msg._id}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                    style={{
                      backgroundColor:
                        playing === msg._id
                          ? "var(--theme-primary-muted)"
                          : "var(--theme-background)",
                    }}
                  >
                    <button
                      onClick={() =>
                        togglePlay(msg._id, msg.blobUrl, msg.durationMs)
                      }
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
                      style={{
                        backgroundColor: "var(--theme-primary)",
                        color: "#fff",
                      }}
                    >
                      {playing === msg._id ? (
                        <Pause size={14} />
                      ) : (
                        <Play size={14} className="ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-serif text-sm truncate"
                        style={{ color: "var(--theme-text)" }}
                      >
                        {msg.guestName}
                      </p>
                      {playing === msg._id ? (
                        <div className="mt-1.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex-1 h-1 rounded-full overflow-hidden"
                              style={{
                                backgroundColor: "var(--theme-border-light)",
                              }}
                            >
                              <div
                                className="h-full rounded-full transition-[width] duration-300"
                                style={{
                                  width: `${playbackDuration > 0 ? (playbackTime / playbackDuration) * 100 : 0}%`,
                                  backgroundColor: "var(--theme-primary)",
                                }}
                              />
                            </div>
                            <span
                              className="text-xs tabular-nums shrink-0"
                              style={{ color: "var(--theme-primary)" }}
                            >
                              {formatSecs(playbackTime)} /{" "}
                              {formatSecs(playbackDuration)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-xs"
                            style={{ color: "var(--theme-text-light)" }}
                          >
                            {formatDuration(msg.durationMs)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Feature explainer */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid var(--theme-border-light)" }}
            >
              <div
                className="px-5 py-4 space-y-3"
                style={{ backgroundColor: "var(--theme-surface)" }}
              >
                <div className="flex items-start gap-3">
                  <ExternalLink
                    size={14}
                    className="shrink-0 mt-0.5"
                    style={{ color: "var(--theme-primary)" }}
                  />
                  <div>
                    <p
                      className="font-serif text-sm"
                      style={{ color: "var(--theme-text)" }}
                    >
                      Vaši gosti snimaju poruke na ovoj stranici:
                    </p>
                    <Link
                      href={`/pozivnica/${slug}/audio-knjiga`}
                      target="_blank"
                      className="text-xs font-mono break-all hover:underline"
                      style={{ color: "var(--theme-primary)" }}
                    >
                      halouspomene.rs/pozivnica/{slug}/audio-knjiga/
                    </Link>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Download
                    size={14}
                    className="shrink-0 mt-0.5"
                    style={{ color: "var(--theme-primary)" }}
                  />
                  <p
                    className="font-serif text-sm"
                    style={{ color: "var(--theme-text-muted)" }}
                  >
                    Sve poruke možete preuzeti kao spojeni audio fajl, ili Vam
                    šaljemo USB u obliku retro kasete ili bočice sa porukom.
                  </p>
                </div>
              </div>

              {/* Retro phone promo */}
              <div
                className="px-5 py-4"
                style={{
                  backgroundColor: "var(--theme-background)",
                  borderTop: "1px solid var(--theme-border-light)",
                }}
              >
                <div className="flex items-start gap-3">
                  <Phone
                    size={14}
                    className="shrink-0 mt-0.5"
                    style={{ color: "var(--theme-primary)" }}
                  />
                  <div>
                    <p
                      className="font-serif text-sm"
                      style={{ color: "var(--theme-text)" }}
                    >
                      Želite kompletno iskustvo?
                    </p>
                    <p
                      className="font-serif text-sm mt-1"
                      style={{ color: "var(--theme-text-muted)" }}
                    >
                      Naš retro telefon uspomena donosi pun doživljaj audio
                      knjige utisaka na Vaše venčanje — gosti podižu slušalicu i
                      ostavljaju poruku. Nemojte da ostanete samo na digitalnoj
                      verzijoi, naručite retro telefon koji će postati atrakcija
                      na Vašem venčanju, ujedno i nezaboravna uspomena.
                    </p>
                    <Link
                      href="/#packages"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs font-elegant uppercase tracking-widest hover:underline"
                      style={{ color: "var(--theme-primary)" }}
                    >
                      <Gift size={12} />
                      Saznajte više o paketima
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══ PAID MODE ═══ */}
        {paidForAudio && (
          <>
            {/* 1. Stats bar + messages */}
            <div
              className="rounded-2xl overflow-hidden mb-4"
              style={{ border: "1px solid var(--theme-border-light)" }}
            >
              {/* Stats header */}
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ backgroundColor: "var(--theme-surface)" }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Mic size={14} style={{ color: "var(--theme-primary)" }} />
                    <span style={{ color: "var(--theme-text-muted)" }}>
                      {messages.length}{" "}
                      {messages.length === 1 ? "poruka" : "poruka"}
                    </span>
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--theme-text-light)" }}
                  >
                    {formatDuration(totalDuration)} ukupno
                  </div>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 rounded-lg transition-colors hover:bg-black/5 cursor-pointer disabled:opacity-40"
                  title="Osveži"
                >
                  <RefreshCw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                    style={{ color: "var(--theme-text-muted)" }}
                  />
                </button>
              </div>

              {/* Error */}
              {fetchError && (
                <div
                  className="text-center py-12 px-6"
                  style={{ backgroundColor: "var(--theme-background)" }}
                >
                  <p
                    className="font-raleway text-base"
                    style={{ color: "var(--theme-text-muted)" }}
                  >
                    Greška pri učitavanju podataka
                  </p>
                </div>
              )}

              {/* Empty state */}
              {!fetchError && messages.length === 0 && (
                <div
                  className="text-center py-12"
                  style={{ backgroundColor: "var(--theme-background)" }}
                >
                  <Mic
                    size={36}
                    style={{ color: "var(--theme-primary)", opacity: 0.25 }}
                    className="mx-auto mb-3"
                  />
                  <p
                    className="font-raleway text-sm"
                    style={{ color: "var(--theme-text-muted)" }}
                  >
                    {t.audioNoMessages}
                  </p>
                </div>
              )}

              {/* Message list */}
              {!fetchError && messages.length > 0 && (
                <div className="space-y-px">
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                      style={{
                        backgroundColor:
                          playing === msg._id
                            ? "var(--theme-primary-muted)"
                            : "var(--theme-background)",
                      }}
                    >
                      <button
                        onClick={() => togglePlay(msg._id, msg.blobUrl)}
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
                        style={{
                          backgroundColor: "var(--theme-primary)",
                          color: "#fff",
                        }}
                      >
                        {playing === msg._id ? (
                          <Pause size={14} />
                        ) : (
                          <Play size={14} className="ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-serif text-sm truncate"
                          style={{ color: "var(--theme-text)" }}
                        >
                          {msg.guestName}
                        </p>
                        {/* Progress bar + time when playing */}
                        {playing === msg._id ? (
                          <div className="mt-1.5">
                            <div className="flex items-center gap-2">
                              <div
                                className="flex-1 h-1 rounded-full overflow-hidden"
                                style={{
                                  backgroundColor: "var(--theme-border-light)",
                                }}
                              >
                                <div
                                  className="h-full rounded-full transition-[width] duration-300"
                                  style={{
                                    width: `${playbackDuration > 0 ? (playbackTime / playbackDuration) * 100 : 0}%`,
                                    backgroundColor: "var(--theme-primary)",
                                  }}
                                />
                              </div>
                              <span
                                className="text-xs tabular-nums shrink-0"
                                style={{ color: "var(--theme-primary)" }}
                              >
                                {formatSecs(playbackTime)} /{" "}
                                {formatSecs(playbackDuration)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className="text-xs"
                              style={{ color: "var(--theme-text-light)" }}
                            >
                              {formatDuration(msg.durationMs)}
                            </span>
                            <span
                              className="text-xs"
                              style={{
                                color: "var(--theme-text-light)",
                                opacity: 0.5,
                              }}
                            >
                              &middot;
                            </span>
                            <span
                              className="text-xs"
                              style={{
                                color: "var(--theme-text-light)",
                                opacity: 0.7,
                              }}
                            >
                              {formatTimestamp(msg.createdAt)}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Delete: confirm inline or trash icon */}
                      {confirmingDelete === msg._id ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleDelete(msg)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 cursor-pointer transition-colors"
                            title="Potvrdi"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setConfirmingDelete(null)}
                            className="p-1.5 rounded-lg hover:bg-black/5 cursor-pointer transition-colors"
                            style={{ color: "var(--theme-text-light)" }}
                            title="Otkaži"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingDelete(msg._id)}
                          disabled={deleting === msg._id}
                          className="p-2 rounded-lg transition-colors hover:bg-red-500/10 cursor-pointer disabled:opacity-40 shrink-0"
                          title="Obriši"
                        >
                          <Trash2
                            size={14}
                            className={
                              deleting === msg._id
                                ? "animate-pulse text-red-400"
                                : ""
                            }
                            style={
                              deleting !== msg._id
                                ? { color: "var(--theme-text-light)" }
                                : undefined
                            }
                          />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Download button */}
            {messages.length > 0 && (
              <button
                onClick={handleMergeDownload}
                disabled={merging}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-elegant text-sm uppercase tracking-widest transition-colors disabled:opacity-50 cursor-pointer mb-4"
                style={{
                  backgroundColor: "var(--theme-primary)",
                  color: "#fff",
                }}
              >
                <Download size={14} />
                {merging ? "Spajam..." : t.audioDownloadAll}
              </button>
            )}

            {/* 3. Info + QR + promo grouped */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid var(--theme-border-light)" }}
            >
              {/* Guest link + download explanation */}
              <div
                className="px-5 py-4 space-y-3"
                style={{ backgroundColor: "var(--theme-surface)" }}
              >
                <div className="flex items-start gap-3">
                  <ExternalLink
                    size={14}
                    className="shrink-0 mt-0.5"
                    style={{ color: "var(--theme-primary)" }}
                  />
                  <div>
                    <p
                      className="font-serif text-sm"
                      style={{ color: "var(--theme-text)" }}
                    >
                      Vaši gosti snimaju poruke na ovoj stranici:
                    </p>
                    <Link
                      href={`/pozivnica/${slug}/audio-knjiga`}
                      target="_blank"
                      className="text-xs font-mono break-all hover:underline"
                      style={{ color: "var(--theme-primary)" }}
                    >
                      halouspomene.rs/pozivnica/{slug}/audio-knjiga/
                    </Link>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Download
                    size={14}
                    className="shrink-0 mt-0.5"
                    style={{ color: "var(--theme-primary)" }}
                  />
                  <p
                    className="font-serif text-sm"
                    style={{ color: "var(--theme-text-muted)" }}
                  >
                    Sve poruke možete preuzeti kao spojeni audio fajl, ili Vam
                    šaljemo USB u obliku retro kasete ili bočice sa porukom.
                  </p>
                </div>
              </div>

              {/* QR Download */}
              <div
                className="text-center px-5 py-4"
                style={{
                  backgroundColor: "var(--theme-background)",
                  borderTop: "1px solid var(--theme-border-light)",
                }}
              >
                <button
                  onClick={() => generateAudioFlyerPDF(slug, coupleNames, primaryColor, useCyrillic, scriptFont)}
                  className="inline-flex items-center gap-2 font-elegant text-xs uppercase tracking-widest transition-opacity hover:opacity-70 cursor-pointer"
                  style={{ color: "var(--theme-primary)" }}
                >
                  <QrCode size={14} />
                  Preuzmite flyer sa QR kodom za goste (PDF A6)
                </button>
              </div>

              {/* Retro phone promo */}
              <div
                className="px-5 py-4"
                style={{
                  backgroundColor: "var(--theme-surface)",
                  borderTop: "1px solid var(--theme-border-light)",
                }}
              >
                <div className="flex items-start gap-3">
                  <Phone
                    size={14}
                    className="shrink-0 mt-0.5"
                    style={{ color: "var(--theme-primary)" }}
                  />
                  <div>
                    <p
                      className="font-serif text-sm"
                      style={{ color: "var(--theme-text)" }}
                    >
                      Želite kompletno iskustvo?
                    </p>
                    <p
                      className="font-serif text-sm mt-1"
                      style={{ color: "var(--theme-text-muted)" }}
                    >
                      Naš retro telefon uspomena donosi pun doživljaj audio
                      knjige utisaka na Vaše venčanje — gosti podižu slušalicu i
                      ostavljaju poruku. Nemojte da ostanete samo na digitalnoj
                      verzijoi, naručite retro telefon koji će postati atrakcija
                      na Vašem venčanju, ujedno i nezaboravna uspomena.
                    </p>
                    <Link
                      href="/"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs font-elegant uppercase tracking-widest hover:underline"
                      style={{ color: "var(--theme-primary)" }}
                    >
                      Saznajte više na našem sajtu
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
