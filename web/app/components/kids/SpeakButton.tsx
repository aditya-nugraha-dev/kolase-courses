"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/cn";

// Tombol "Dengar": memakai Web Speech API bawaan browser.
// Tidak perlu file audio, dan otomatis memilih suara Inggris bila tersedia.
export default function SpeakButton({
  text,
  label = "Dengar",
  className,
  compact = false,
}: {
  text: string;
  label?: string;
  className?: string;
  compact?: boolean;
}) {
  const [speaking, setSpeaking] = useState(false);

  const speak = () => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.82;
    utterance.pitch = 1.05;

    const voices = synth.getVoices();
    const english = voices.find((voice) => /^en[-_]/i.test(voice.lang));
    if (english) utterance.voice = english;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={`Dengarkan: ${text}`}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/10 font-bold text-cyan-deep transition hover:bg-cyan/20 active:scale-95",
        compact ? "h-8 w-8" : "min-h-[36px] px-3 py-1.5 text-xs",
        speaking && "animate-pulse bg-cyan/25",
        className
      )}
    >
      <Volume2 size={compact ? 15 : 14} />
      {compact ? <span className="sr-only">{label}</span> : label}
    </button>
  );
}
