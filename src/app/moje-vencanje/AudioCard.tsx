"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Play,
  Pause,
  Trash2,
  Download,
  RefreshCw,
  Mic,
  QrCode,
  Lock,
  ExternalLink,
  Phone,
  Gift,
  X,
  Check,
} from "lucide-react";
import {
  loadAudioMessagesAction,
  refreshAudioMessagesAction,
  deleteAudioMsgAction,
} from "./actions";
import type { AudioMessage } from "@/lib/audio";

const DEMO_MESSAGES = [
  {
    id: "demo-1",
    name: "Jovana & Stefan",
    url: "/audio/demo/demo-message-1.webm",
    durationMs: 8000,
    forceDuration: true,
  },
];

interface Props {
  slug: string;
  coupleNames: string;
}

function formatDuration(ms: number) {
  const s = Math.round(ms / 1000);
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function formatSecs(secs: number) {
  const min = Math.floor(secs / 60);
  const sec = Math.floor(secs % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("sr-Latn-RS", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AudioCard({ slug, coupleNames }: Props) {
  const [messages, setMessages] = useState<AudioMessage[]>([]);
  const [paidForAudio, setPaidForAudio] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [merging, setMerging] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadAudioMessagesAction().then((result) => {
      if (result) {
        setMessages(result.messages);
        setPaidForAudio(result.paidForAudio);
      }
      setLoading(false);
    });
  }, []);

  const totalDuration = useMemo(
    () => messages.reduce((sum, m) => sum + m.durationMs, 0),
    [messages],
  );

  const togglePlay = useCallback(
    (
      id: string,
      url: string,
      knownDurationMs?: number,
      forceDuration?: boolean,
    ) => {
      if (playing === id) {
        audioRef.current?.pause();
        setPlaying(null);
        setPlaybackTime(0);
        setPlaybackDuration(0);
        return;
      }
      if (audioRef.current) audioRef.current.pause();

      const audio = new Audio(url);
      audioRef.current = audio;
      const maxSec =
        forceDuration && knownDurationMs ? knownDurationMs / 1000 : 0;
      audio.ontimeupdate = () => {
        if (maxSec > 0 && audio.currentTime >= maxSec) {
          audio.pause();
          setPlaying(null);
          setPlaybackTime(0);
          setPlaybackDuration(0);
          return;
        }
        setPlaybackTime(audio.currentTime);
      };
      audio.onloadedmetadata = () =>
        setPlaybackDuration(maxSec > 0 ? maxSec : audio.duration);
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
      audio.play().catch(() => setPlaying(null));
      setPlaying(id);
      setPlaybackTime(0);
    },
    [playing],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const result = await refreshAudioMessagesAction();
    if (result.success && result.messages) setMessages(result.messages);
    setRefreshing(false);
  }, []);

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
      const result = await deleteAudioMsgAction(msg._id, msg.blobUrl);
      if (result.success)
        setMessages((prev) => prev.filter((m) => m._id !== msg._id));
      setDeleting(null);
    },
    [playing],
  );

  const handleMergeDownload = useCallback(async () => {
    if (messages.length === 0) return;
    setMerging(true);
    try {
      const { mergeAndDownload } =
        await import("@/lib/audio-utils/mergeAudio");
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

  const handleDownloadFlyer = useCallback(async () => {
    const { generateAudioFlyerPDF } =
      await import("@/lib/audio-utils/generateAudioFlyerPDF");
    await generateAudioFlyerPDF(slug, coupleNames, "#AE343F", false);
  }, [slug, coupleNames]);

  // Loading
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#232323]/10 p-6 shadow-sm">
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-[#AE343F]" />
        </div>
      </div>
    );
  }

  // Not paid — demo/upsell
  if (!paidForAudio) {
    return (
      <div className="bg-white rounded-2xl border border-[#232323]/10 p-6 shadow-sm">
        <h3 className="font-serif text-lg text-[#232323] mb-4">Audio knjiga</h3>

        <div className="text-center py-6 px-4 mb-4">
          <Lock size={28} className="mx-auto mb-3 text-[#AE343F]/40" />
          <p className="font-serif text-base text-[#232323] mb-1">
            Audio knjiga utisaka
          </p>
          <p className="text-sm text-[#232323]/50">
            Vaši gosti ostavljaju glasovne poruke — vi ih slušate, čuvate i
            preuzimate. Dostupno uz aktivaciju audio paketa.
          </p>
        </div>

        {/* Demo messages */}
        <div className="border border-[#232323]/8 rounded-xl overflow-hidden mb-4">
          <div className="flex items-center gap-4 px-4 py-2.5 bg-[#F5F4DC]/50">
            <div className="flex items-center gap-1.5 text-sm">
              <Mic size={14} className="text-[#AE343F]" />
              <span className="text-[#232323]/40">1 DEMO poruka</span>
            </div>
            <span className="text-sm text-[#232323]/25">
              {formatDuration(
                DEMO_MESSAGES.reduce((s, m) => s + m.durationMs, 0),
              )}{" "}
              ukupno
            </span>
          </div>
          <div className="divide-y divide-[#232323]/5">
            {DEMO_MESSAGES.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  playing === msg.id ? "bg-[#AE343F]/5" : ""
                }`}
              >
                <button
                  onClick={() =>
                    togglePlay(
                      msg.id,
                      msg.url,
                      msg.durationMs,
                      msg.forceDuration,
                    )
                  }
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer bg-[#AE343F] text-white"
                >
                  {playing === msg.id ? (
                    <Pause size={14} />
                  ) : (
                    <Play size={14} className="ml-0.5" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#232323] truncate">
                    {msg.name}
                  </p>
                  {playing === msg.id ? (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[#AE343F]/10">
                        <div
                          className="h-full rounded-full transition-[width] duration-300 bg-[#AE343F]"
                          style={{
                            width: `${playbackDuration > 0 ? (playbackTime / playbackDuration) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] tabular-nums text-[#AE343F] shrink-0">
                        {formatSecs(playbackTime)} /{" "}
                        {formatSecs(playbackDuration)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-[#232323]/30">
                      {formatDuration(msg.durationMs)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 bg-[#F5F4DC]/30">
            <p className="text-[10px] text-center text-[#232323]/25 italic">
              Demo poruke — aktivacijom ovde ćete videti poruke vaših gostiju
            </p>
          </div>
        </div>

        {/* USB options */}
        <div className="border border-[#d4af37]/20 rounded-xl overflow-hidden bg-[#F5F4DC]/40 mb-3">
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#d4af37]/10 flex items-center justify-center shrink-0">
                <span className="text-lg">🍾</span>
              </div>
              <div>
                <p className="text-sm font-medium text-[#232323]">
                  USB bočica sa porukom
                </p>
                <p className="text-xs text-[#232323]/45">
                  Elegantni USB u obliku bočice sa svim porukama.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#d4af37]/10 flex items-center justify-center shrink-0">
                <span className="text-lg">📼</span>
              </div>
              <div>
                <p className="text-sm font-medium text-[#232323]">
                  USB retro kaseta
                </p>
                <p className="text-xs text-[#232323]/45">
                  Nostalgični USB u obliku audio kasete.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Retro phone — separate, bigger */}
        <div className="border border-[#AE343F]/10 rounded-xl overflow-hidden mb-4">
          <div className="flex items-center gap-4 p-4 bg-[#F5F4DC]/30">
            <Image
              src="/images/phone.webp"
              alt="Retro telefon uspomena"
              width={400}
              height={400}
              className="w-24 h-24 object-contain shrink-0"
            />
            <div>
              <p className="text-sm font-medium text-[#232323] mb-1">
                Retro telefon uspomena
              </p>
              <p className="text-xs text-[#232323]/45 leading-relaxed">
                Pun doživljaj — gosti podižu slušalicu i ostavljaju poruku.
                Atrakcija na venčanju i nezaboravna uspomena.
              </p>
              <Link
                href="/telefon-uspomena"
                className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-[#AE343F] hover:underline"
              >
                <Phone size={11} />
                Saznajte više
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Paid — full audio player
  return (
    <div className="bg-white rounded-2xl border border-[#232323]/10 p-6 shadow-sm">
      <h3 className="font-serif text-lg text-[#232323] mb-4">Audio knjiga</h3>

      {/* Stats bar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#232323]/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <Mic size={14} className="text-[#AE343F]" />
            <span className="text-[#232323]/50">
              {messages.length} {messages.length === 1 ? "poruka" : "poruka"}
            </span>
          </div>
          <span className="text-sm text-[#232323]/30">
            {formatDuration(totalDuration)} ukupno
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg transition-colors hover:bg-[#232323]/5 cursor-pointer disabled:opacity-40"
          title="Osveži"
        >
          <RefreshCw
            size={14}
            className={`text-[#232323]/40 ${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Empty state */}
      {messages.length === 0 && (
        <div className="text-center py-10">
          <Mic size={32} className="mx-auto mb-3 text-[#AE343F]/20" />
          <p className="text-sm text-[#232323]/40">Još nema audio poruka</p>
        </div>
      )}

      {/* Message list */}
      {messages.length > 0 && (
        <div className="space-y-1 mb-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                playing === msg._id
                  ? "bg-[#AE343F]/5"
                  : "hover:bg-[#232323]/[0.02]"
              }`}
            >
              <button
                onClick={() => togglePlay(msg._id, msg.blobUrl, msg.durationMs)}
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer bg-[#AE343F] text-white"
              >
                {playing === msg._id ? (
                  <Pause size={14} />
                ) : (
                  <Play size={14} className="ml-0.5" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#232323] truncate">
                  {msg.guestName}
                </p>
                {playing === msg._id ? (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[#AE343F]/10">
                      <div
                        className="h-full rounded-full transition-[width] duration-300 bg-[#AE343F]"
                        style={{
                          width: `${playbackDuration > 0 ? (playbackTime / playbackDuration) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] tabular-nums text-[#AE343F] shrink-0">
                      {formatSecs(playbackTime)} /{" "}
                      {formatSecs(playbackDuration)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#232323]/30">
                      {formatDuration(msg.durationMs)}
                    </span>
                    <span className="text-xs text-[#232323]/15">&middot;</span>
                    <span className="text-xs text-[#232323]/25">
                      {formatTimestamp(msg.createdAt)}
                    </span>
                  </div>
                )}
              </div>

              {/* Delete */}
              {confirmingDelete === msg._id ? (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleDelete(msg)}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 cursor-pointer transition-colors"
                  >
                    <Check size={13} />
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(null)}
                    className="p-1.5 rounded-lg text-[#232323]/30 hover:bg-[#232323]/5 cursor-pointer transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(msg._id)}
                  disabled={deleting === msg._id}
                  className="p-1.5 rounded-lg text-[#232323]/20 hover:text-red-500 hover:bg-red-500/5 cursor-pointer transition-colors disabled:opacity-40 shrink-0"
                >
                  <Trash2
                    size={13}
                    className={
                      deleting === msg._id ? "animate-pulse text-red-400" : ""
                    }
                  />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Download merged audio */}
      {messages.length > 0 && (
        <button
          onClick={handleMergeDownload}
          disabled={merging}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase text-white bg-[#AE343F] hover:bg-[#932d35] transition-colors disabled:opacity-50 cursor-pointer mb-3"
        >
          <Download size={14} />
          {merging ? "Spajam..." : "Preuzmi sve poruke"}
        </button>
      )}

      {/* Info section */}
      <div className="border border-[#232323]/8 rounded-xl p-4 space-y-3">
        <div className="flex items-start gap-3">
          <ExternalLink size={13} className="shrink-0 mt-0.5 text-[#AE343F]" />
          <div>
            <p className="text-sm text-[#232323]/70">
              Gosti snimaju poruke na:
            </p>
            <Link
              href={`/pozivnica/${slug}/audio-knjiga`}
              target="_blank"
              className="text-xs font-mono text-[#AE343F] break-all hover:underline"
            >
              halouspomene.rs/pozivnica/{slug}/audio-knjiga/
            </Link>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <QrCode size={13} className="shrink-0 mt-0.5 text-[#AE343F]" />
          <button
            onClick={handleDownloadFlyer}
            className="text-sm text-[#AE343F] hover:underline cursor-pointer text-left"
          >
            Preuzmi flyer sa QR kodom (PDF A6)
          </button>
        </div>
      </div>

      {/* Promo: USB options */}
      <div className="mt-4 border border-[#d4af37]/20 rounded-xl overflow-hidden bg-[#F5F4DC]/40">
        <div className="px-4 py-3 border-b border-[#d4af37]/10">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#d4af37]">
            Sačuvajte uspomene zauvek
          </p>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#d4af37]/10 flex items-center justify-center shrink-0">
              <span className="text-lg">🍾</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#232323]">
                USB bočica sa porukom
              </p>
              <p className="text-xs text-[#232323]/45 mt-0.5">
                Sve audio poruke na elegantnom USB-u u obliku bočice — savršen
                poklon za godišnjicu.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#d4af37]/10 flex items-center justify-center shrink-0">
              <span className="text-lg">📼</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#232323]">
                USB retro kaseta
              </p>
              <p className="text-xs text-[#232323]/45 mt-0.5">
                Nostalgični USB u obliku audio kasete sa svim porukama vaših
                gostiju.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Promo: Retro phone — separate, bigger */}
      <div className="mt-3 border border-[#AE343F]/10 rounded-xl overflow-hidden">
        <div className="flex items-center gap-4 p-4 bg-[#F5F4DC]/30">
          <Image
            src="/images/phone.webp"
            alt="Retro telefon uspomena"
            width={400}
            height={400}
            className="w-24 h-24 object-contain shrink-0"
          />
          <div>
            <p className="text-sm font-medium text-[#232323] mb-1">
              Retro telefon uspomena
            </p>
            <p className="text-xs text-[#232323]/45 leading-relaxed">
              Pun doživljaj audio knjige — gosti podižu slušalicu i ostavljaju
              poruku. Atrakcija na venčanju i nezaboravna uspomena za ceo život.
            </p>
            <Link
              href="/telefon-uspomena"
              className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-[#AE343F] hover:underline"
            >
              <Phone size={11} />
              Saznajte više
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
