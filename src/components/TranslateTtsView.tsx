import React, { useState, useRef } from "react";
import { PRESET_PHRASES } from "../data/travelData";
import { Volume2, Languages, Sparkles, Copy, Check } from "lucide-react";

interface TranslationResult {
  sourceText: string;
  targetLang: "ja" | "ko";
  translatedText: string;
  phonetic: string;
  literalMeaning: string;
  culturalTip: string;
  audioWavBase64: string | null;
}

export const TranslateTtsView: React.FC = () => {
  const [inputText, setInputText] = useState(PRESET_PHRASES[0].english);
  const [targetLang, setTargetLang] = useState<"ja" | "ko">("ja");
  const [context, setContext] = useState(PRESET_PHRASES[0].context);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleTranslate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const res = await fetch("/api/translate-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          targetLang,
          context,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Translation failed");
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to translate phrase");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = () => {
    if (!result) return;
    if (result.audioWavBase64) {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(`data:audio/wav;base64,${result.audioWavBase64}`);
        audioRef.current = audio;
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);
        audio.play();
        return;
      } catch (_e) {
        // Fallback to browser speechSynthesis
      }
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(result.translatedText);
      utterance.lang = result.targetLang === "ko" ? "ko-KR" : "ja-JP";
      utterance.rate = 0.92;
      setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs text-stone-500 mb-2">
          Miro Key Activity: Translation (Text-to-Speech) · Polite Japanese &amp; Korean Bridge
        </p>
        <h1 className="font-serif-display text-3xl md:text-4xl font-semibold text-stone-900 tracking-tight">
          Local Etiquette Translator &amp; Neural Voice Speaker
        </h1>
        <p className="mt-3 text-sm md:text-base text-stone-600 max-w-2xl leading-relaxed">
          When visiting off-the-beaten-path sanctuaries, family kilns, and hidden listening bars, English menus rarely exist. Translate your exact intent into polite local Japanese (Teineigo) or Korean (Haeyo-che) with natural voice playback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Preset Scenarios + Form */}
        <div className="lg:col-span-6 bg-white border border-stone-200/90 rounded-2xl p-6 space-y-6">
          <div>
            <p className="text-xs text-stone-500 mb-2">Quick Backstreet Scenarios</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_PHRASES.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setInputText(preset.english);
                    setContext(preset.context);
                  }}
                  className="min-h-[44px] p-3 text-left text-xs bg-[#F8F7F4] hover:bg-stone-200/60 border border-stone-200/80 rounded-xl transition-colors"
                >
                  <span className="font-medium text-stone-900 block truncate">{preset.label}</span>
                  <span className="text-stone-500 block truncate mt-0.5">{preset.english}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleTranslate} className="space-y-4">
            <div>
              <span className="block text-xs font-medium text-stone-700 mb-1.5">
                Target Destination Language
              </span>
              <div className="flex items-center p-1 bg-[#F8F7F4] border border-stone-300 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTargetLang("ja")}
                  className={`flex-1 min-h-[40px] py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    targetLang === "ja"
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Japanese (Polite Teineigo)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetLang("ko")}
                  className={`flex-1 min-h-[40px] py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    targetLang === "ko"
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Korean (Polite Honorific)
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="tts-context" className="block text-xs font-medium text-stone-700 mb-1">
                Social Context / Setting
              </label>
              <input
                id="tts-context"
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 text-xs bg-[#F8F7F4] border border-stone-300 rounded-xl text-stone-900"
              />
            </div>

            <div>
              <label htmlFor="tts-input" className="block text-xs font-medium text-stone-700 mb-1">
                What would you like to say to your local host or artisan?
              </label>
              <textarea
                id="tts-input"
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full p-3.5 text-sm bg-[#F8F7F4] border border-stone-300 rounded-xl text-stone-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] px-5 py-3 text-sm font-medium bg-[#1E3A5F] text-white rounded-xl hover:bg-[#162B47] transition-colors flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>
                {loading
                  ? "Synthesizing Translation & Neural Voice..."
                  : "Translate & Generate Speech Audio"}
              </span>
            </button>
          </form>
        </div>

        {/* Right Column: Spoken Card Output */}
        <div className="lg:col-span-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-800">
              {error}
            </div>
          )}

          {!result && !loading && (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-8 text-center space-y-3">
              <Languages className="w-8 h-8 text-[#1E3A5F] mx-auto" />
              <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
                Show or Play Directly to Your Local Host
              </h2>
              <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Click &ldquo;Translate &amp; Generate Speech Audio&rdquo; to create a large-type native script card with phonetic pronunciation, cultural etiquette guidance, and spoken audio.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-8 space-y-4">
              <p className="text-xs font-mono text-stone-500">
                Calling server-side Gemini 3.8 Flash &amp; Gemini TTS...
              </p>
              <div className="h-10 w-3/4 bg-stone-200/70 rounded animate-pulse" />
              <div className="h-5 w-1/2 bg-stone-100 rounded animate-pulse" />
              <div className="h-12 w-full bg-stone-100 rounded-xl animate-pulse" />
            </div>
          )}

          {result && (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 text-xs text-stone-500">
                <span>
                  {result.targetLang === "ko" ? "Korean · Polite Honorific" : "Japanese · Polite Teineigo"}
                </span>
                <span>{result.audioWavBase64 ? "Gemini Neural WAV Ready" : "Voice Synthesis Ready"}</span>
              </div>

              <div className="space-y-3">
                <p className="text-2xl md:text-3xl font-semibold text-stone-900 leading-snug">
                  {result.translatedText}
                </p>
                <p className="text-sm font-mono text-[#1E3A5F] leading-relaxed">
                  {result.phonetic}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  className="flex-1 min-h-[48px] px-5 py-2.5 text-sm font-medium bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Volume2 className={`w-4 h-4 ${isPlaying ? "animate-pulse text-amber-300" : ""}`} />
                  <span>{isPlaying ? "Playing Spoken Audio..." : "Play Aloud for Local Host"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="min-h-[48px] px-4 py-2.5 text-xs font-medium text-stone-700 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied" : "Copy Script"}</span>
                </button>
              </div>

              <div className="p-4 bg-[#F8F7F4] rounded-xl space-y-2 text-xs text-stone-600">
                <p>
                  <strong className="text-stone-900">Nuance:</strong> {result.literalMeaning}
                </p>
                <p>
                  <strong className="text-stone-900">Local Etiquette Tip:</strong> {result.culturalTip}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
