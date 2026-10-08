import React, { useState } from "react";
import {
  KENBAIKI_TICKET_BUTTONS,
  COUNTER_PHRASES,
  KenbaikiButton,
} from "../data/ramenData";
import { Volume2, Check, Copy, Trash2, Ticket } from "lucide-react";

export const CounterGuideView: React.FC = () => {
  const [selectedButtons, setSelectedButtons] = useState<KenbaikiButton[]>([
    KENBAIKI_TICKET_BUTTONS[0],
  ]);
  const [noodleFirmness, setNoodleFirmness] = useState<
    "Barikata (Extra Firm)" | "Katamen (Firm)" | "Futsu (Regular)"
  >("Katamen (Firm)");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleTicketButton = (btn: KenbaikiButton) => {
    setSelectedButtons((prev) =>
      prev.some((b) => b.id === btn.id)
        ? prev.filter((b) => b.id !== btn.id)
        : [...prev, btn]
    );
  };

  const totalYen = selectedButtons.reduce(
    (sum, item) => sum + item.typicalPriceJpy,
    0
  );

  const speakJapanese = (textJa: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textJa);
      utterance.lang = "ja-JP";
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyPhrase = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs font-mono text-[#B93829] uppercase tracking-wider">
          On-the-Ground Ramen Counter Companion · Ticket Machine &amp; Etiquette
        </p>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-stone-900 mt-1">
          Kenbaiki Ticket Machine Simulator &amp; Counter Voice Guide
        </h1>
        <p className="text-sm sm:text-base text-stone-600 mt-2 max-w-3xl leading-relaxed">
          Most authentic ramen shops in Japan use a Japanese-only button vending machine (
          <em>Kenbaiki</em> 券売機) by the door. Practice decoding the kanji buttons below and generate a show-to-chef order card before stepping inside.
        </p>
      </div>

      {/* Interactive Kenbaiki Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-stone-200/90 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-stone-500">STEP 01 · TAP KANJI BUTTONS</p>
              <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
                Japanese Ramen Vending Machine (券売機)
              </h2>
            </div>
            <span className="text-xs font-mono text-stone-500">
              Simulated Reference Prices
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {KENBAIKI_TICKET_BUTTONS.map((btn) => {
              const active = selectedButtons.some((b) => b.id === btn.id);
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => toggleTicketButton(btn)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                    active
                      ? "bg-stone-900 text-white border-stone-900 shadow-sm"
                      : "bg-[#F8F7F4] text-stone-900 border-stone-300 hover:bg-stone-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 w-full">
                    <div>
                      <span className="text-[11px] font-mono opacity-75">
                        {btn.category}
                      </span>
                      <p className="text-xl font-bold tracking-tight mt-0.5">
                        {btn.kanji}
                      </p>
                      <p className="text-xs font-medium opacity-90">
                        {btn.romaji} · {btn.english}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-semibold shrink-0">
                      ¥{btn.typicalPriceJpy}
                    </span>
                  </div>
                  <p
                    className={`text-xs leading-relaxed ${
                      active ? "text-stone-300" : "text-stone-600"
                    }`}
                  >
                    {btn.explanation}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Show-to-Chef Counter Ticket Card */}
        <div className="lg:col-span-5 bg-white border border-stone-200/90 rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#B93829]" />
                <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
                  Show-to-Chef Order Summary
                </h2>
              </div>
              {selectedButtons.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedButtons([])}
                  className="text-xs text-stone-500 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Noodle Firmness Selector */}
            <div>
              <p className="text-xs font-medium text-stone-700 mb-1.5">
                Preferred Noodle Firmness (When Handing Ticket)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    "Barikata (Extra Firm)",
                    "Katamen (Firm)",
                    "Futsu (Regular)",
                  ] as const
                ).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setNoodleFirmness(level)}
                    className={`min-h-[38px] px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                      noodleFirmness === level
                        ? "bg-[#B93829] text-white border-[#B93829]"
                        : "bg-[#F8F7F4] text-stone-700 border-stone-300"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Tickets */}
            <div className="p-4 bg-[#F8F7F4] rounded-2xl space-y-3 border border-stone-200/80">
              <p className="text-xs font-mono text-stone-500">
                JAPANESE COUNTER DISPLAY CARD
              </p>
              {selectedButtons.length === 0 ? (
                <p className="text-xs text-stone-500">
                  Tap any button on the vending machine to build your counter order.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedButtons.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between text-sm border-b border-stone-200/70 pb-1.5"
                    >
                      <div>
                        <span className="font-bold text-stone-900 mr-2">
                          {b.kanji}
                        </span>
                        <span className="text-xs text-stone-600">
                          ({b.english})
                        </span>
                      </div>
                      <span className="font-mono text-xs text-stone-800">
                        ¥{b.typicalPriceJpy}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between text-sm font-semibold text-stone-900">
                <span>Estimated Cash / IC Total (Simulated)</span>
                <span className="font-mono text-base">¥{totalYen.toLocaleString()}</span>
              </div>

              <div className="pt-2 border-t border-stone-200 text-xs text-stone-800 space-y-1">
                <p className="font-bold text-base text-stone-900">
                  「{selectedButtons.map((b) => b.kanji).join("・") || "らーめん"}、麺は
                  {noodleFirmness.includes("Barikata")
                    ? "バリカタ"
                    : noodleFirmness.includes("Katamen")
                    ? "かため"
                    : "普通"}
                  でお願いします」
                </p>
                <p className="text-stone-500">
                  Show or play this line when handing your tickets to the counter staff.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              speakJapanese(
                `${selectedButtons.map((b) => b.kanji).join("、") || "らーめん"}、麺は${
                  noodleFirmness.includes("Barikata")
                    ? "バリカタ"
                    : noodleFirmness.includes("Katamen")
                    ? "かため"
                    : "普通"
                }でお願いします`
              )
            }
            className="w-full min-h-[46px] px-4 py-2.5 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            <span>Speak Order Aloud in Japanese (ja-JP)</span>
          </button>
        </div>
      </div>

      {/* Essential Spoken Ramen Counter Phrases */}
      <section className="space-y-4">
        <h2 className="font-serif-display text-2xl font-semibold text-stone-900">
          Essential Counter Phrases for Travellers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COUNTER_PHRASES.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-stone-200/90 rounded-2xl p-5 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#B93829]">{item.situation}</p>
                <p className="text-lg font-bold text-stone-900">{item.japanese}</p>
                <p className="text-xs font-mono text-stone-600">{item.romaji}</p>
                <p className="text-xs text-stone-600 pt-1">{item.english}</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => speakJapanese(item.japanese)}
                  className="min-h-[38px] px-3 py-1.5 text-xs font-medium bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </button>
                <button
                  type="button"
                  onClick={() => copyPhrase(item.id, item.japanese)}
                  className="min-h-[38px] px-3 py-1.5 text-xs font-medium bg-[#F8F7F4] border border-stone-300 text-stone-800 rounded-xl hover:bg-stone-100 transition-colors flex items-center gap-1.5"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Kanji</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
