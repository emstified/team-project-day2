import React, { useState } from "react";
import { Compass, Sparkles, CloudRain, Sun, Train, Home, Users, Check } from "lucide-react";

interface GeneratedDay {
  dayNumber: number;
  theme: string;
  timeWindow: string;
  primaryExperience: string;
  crowdAvoidanceTactic: string;
  rainyWeatherSwap: string;
  transportRoute: string;
  localHostConnection: string;
}

export interface GeneratedCustomPlan {
  title: string;
  summary: string;
  recommendedStayArea: string;
  transportStrategy: string;
  estimatedDailyBudgetUsd: string;
  days: GeneratedDay[];
}

interface DiscoveredGem {
  name: string;
  neighborhood: string;
  bestTimeWindow: string;
  crowdComparison: string;
  whyExtraordinary: string;
  weatherFit: string;
  localHostTip: string;
}

interface CustomBuilderViewProps {
  onSaveCustomPlan: (plan: GeneratedCustomPlan) => void;
}

export const CustomBuilderView: React.FC<CustomBuilderViewProps> = ({ onSaveCustomPlan }) => {
  const [destination, setDestination] = useState("Kyoto & Nagano (Japan)");
  const [travelerType, setTravelerType] = useState("Couple / Duet");
  const [durationDays, setDurationDays] = useState(3);
  const [pace, setPace] = useState("Unhurried & Immersive");
  const [weatherPreference, setWeatherPreference] = useState("Auto-Swap for Rain & Mist");
  const [specialFocus, setSpecialFocus] = useState(
    "After-hours temple sanctuaries, private ceramic or tea ateliers, and hidden vinyl listening bars"
  );

  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [customPlan, setCustomPlan] = useState<GeneratedCustomPlan | null>(null);
  const [planSaved, setPlanSaved] = useState(false);

  // Hidden Gems Scout state (Brave Search / Perplexity MCP role)
  const [scoutCity, setScoutCity] = useState("Kyoto");
  const [scoutInterest, setScoutInterest] = useState("After-hours sanctuaries & artisan workshops");
  const [scoutWeather, setScoutWeather] = useState<"clear" | "rainy">("clear");
  const [scouting, setScouting] = useState(false);
  const [scoutError, setScoutError] = useState<string | null>(null);
  const [discoveredGems, setDiscoveredGems] = useState<DiscoveredGem[]>([]);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingPlan(true);
    setPlanError(null);
    setPlanSaved(false);
    try {
      const res = await fetch("/api/itinerary/personalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          travelerType,
          durationDays,
          pace,
          weatherPreference,
          specialFocus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate itinerary");
      setCustomPlan(data.plan);
    } catch (err: unknown) {
      setPlanError(err instanceof Error ? err.message : "Could not generate custom itinerary");
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleScoutGems = async (e: React.FormEvent) => {
    e.preventDefault();
    setScouting(true);
    setScoutError(null);
    try {
      const res = await fetch("/api/discover-gems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: scoutCity,
          interest: scoutInterest,
          weatherMode: scoutWeather,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to scout hidden gems");
      setDiscoveredGems(data.gems || []);
    } catch (err: unknown) {
      setScoutError(err instanceof Error ? err.message : "Failed to scout hidden gems");
    } finally {
      setScouting(false);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs text-stone-500 mb-2">
          Personalised Curation · Individuals, Couples &amp; Multi-Generational Families
        </p>
        <h1 className="font-serif-display text-3xl md:text-4xl font-semibold text-stone-900 tracking-tight">
          Bespoke Itinerary Architect &amp; Live Hidden Gem Scout
        </h1>
        <p className="mt-3 text-sm md:text-base text-stone-600 max-w-3xl leading-relaxed">
          Design a custom Korea or Japan route that pairs after-hours sight access with weather-resilient indoor alternatives, optimal regional transport, and local hobby groups.
        </p>
      </div>

      {/* Main Customizer Form + Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form
          onSubmit={handleGeneratePlan}
          className="lg:col-span-5 bg-white border border-stone-200/90 rounded-2xl p-6 space-y-5"
        >
          <div>
            <p className="text-xs text-stone-500">01. Configure Trip Parameters</p>
            <h2 className="font-serif-display text-2xl font-semibold text-stone-900 mt-1">
              Personalise Your Route
            </h2>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="dest-select" className="block text-xs font-medium text-stone-700">
              Korea / Japan Corridor
            </label>
            <select
              id="dest-select"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#F8F7F4] border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#1E3A5F]"
            >
              <option value="Kyoto & Nagano (Japan)">Kyoto &amp; Nagano Alpine Valley (Japan)</option>
              <option value="Seoul Seochon & Jeju Island (South Korea)">Seoul Seochon &amp; Jeju Island (South Korea)</option>
              <option value="Tokyo Backstreets & Kamakura Twilight (Japan)">Tokyo Backstreets &amp; Kamakura Twilight (Japan)</option>
              <option value="Seoul to Kyoto Cross-Strait Dual Journey">Seoul to Kyoto Cross-Strait Dual Journey</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="traveler-type" className="block text-xs font-medium text-stone-700">
                Traveller Profile
              </label>
              <select
                id="traveler-type"
                value={travelerType}
                onChange={(e) => setTravelerType(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#F8F7F4] border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#1E3A5F]"
              >
                <option value="Solo Adventurous Explorer">Solo Explorer</option>
                <option value="Couple / Duet">Couple / Duet</option>
                <option value="Multi-Generational Family (4–6 pax)">Family (4–6 pax)</option>
                <option value="Corporate Incentive Retreat">Corporate Incentive Group</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="duration-select" className="block text-xs font-medium text-stone-700">
                Trip Duration
              </label>
              <select
                id="duration-select"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#F8F7F4] border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#1E3A5F]"
              >
                <option value={2}>2 Days (Weekend Immersion)</option>
                <option value={3}>3 Days (Signature Escape)</option>
                <option value={4}>4 Days (Deep Regional Circuit)</option>
                <option value={5}>5 Days (Grand Backstreet Crossing)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pace-select" className="block text-xs font-medium text-stone-700">
                Daily Rhythm
              </label>
              <select
                id="pace-select"
                value={pace}
                onChange={(e) => setPace(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#F8F7F4] border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#1E3A5F]"
              >
                <option value="Unhurried & Immersive">Unhurried &amp; Immersive</option>
                <option value="Twilight & After-Hours Focused">Twilight &amp; After-Hours Focused</option>
                <option value="Active Trail & Foraging">Active Trail &amp; Foraging</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="weather-pref" className="block text-xs font-medium text-stone-700">
                Weather Element Handling
              </label>
              <select
                id="weather-pref"
                value={weatherPreference}
                onChange={(e) => setWeatherPreference(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#F8F7F4] border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#1E3A5F]"
              >
                <option value="Auto-Swap for Rain & Mist">Auto-Swap for Rain &amp; Mist</option>
                <option value="All-Weather Outdoor & Onsen">All-Weather Outdoor &amp; Onsen</option>
                <option value="Covered Sanctuaries & Ateliers">Covered Sanctuaries &amp; Ateliers</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="special-focus" className="block text-xs font-medium text-stone-700">
              Personal Likes, Dietary Needs &amp; Hobby Interests
            </label>
            <textarea
              id="special-focus"
              rows={3}
              value={specialFocus}
              onChange={(e) => setSpecialFocus(e.target.value)}
              placeholder="e.g., Travelling with parents who love ceramics, quiet tea rooms, zero steep stairs, and private evening temple access..."
              className="w-full p-3.5 text-sm bg-[#F8F7F4] border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#1E3A5F]"
            />
          </div>

          <button
            type="submit"
            disabled={generatingPlan}
            className="w-full min-h-[48px] px-5 py-3 text-sm font-medium text-white bg-[#1E3A5F] hover:bg-[#162B47] rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>
              {generatingPlan
                ? "Curating Weather-Adaptive Route..."
                : "Generate Personalised Itinerary"}
            </span>
          </button>
        </form>

        {/* Generated Output Panel */}
        <div className="lg:col-span-7 space-y-6">
          {planError && (
            <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-800">
              {planError}
            </div>
          )}

          {!customPlan && !generatingPlan && (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-8 text-center space-y-3">
              <Compass className="w-8 h-8 text-[#1E3A5F] mx-auto" />
              <h3 className="font-serif-display text-2xl font-semibold text-stone-900">
                Ready to Architect Your Off-the-Beaten-Path Journey
              </h3>
              <p className="text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
                Select your Korea or Japan corridor, traveller profile, and personal interests on the left. Our server-side curator will generate a day-by-day schedule complete with crowd-avoidance windows, rainy-weather swaps, transport routing, and local hobby host pairings.
              </p>
            </div>
          )}

          {generatingPlan && (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-8 space-y-4">
              <p className="text-xs font-mono text-stone-500">
                Synthesizing after-hours windows, regional rail links &amp; rainy-day sanctuary swaps...
              </p>
              <div className="h-6 w-2/3 bg-stone-200/70 rounded animate-pulse" />
              <div className="h-4 w-full bg-stone-100 rounded animate-pulse" />
              <div className="h-32 w-full bg-stone-100 rounded-xl animate-pulse" />
            </div>
          )}

          {customPlan && (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-200 pb-5">
                <div>
                  <p className="text-xs text-stone-500">
                    Bespoke Curated Proposal · Simulated Reference Pricing
                  </p>
                  <h3 className="font-serif-display text-2xl md:text-3xl font-semibold text-stone-900 mt-1">
                    {customPlan.title}
                  </h3>
                  <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                    {customPlan.summary}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSaveCustomPlan(customPlan);
                    setPlanSaved(true);
                  }}
                  className="min-h-[44px] px-4 py-2 text-xs font-medium bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-2 shrink-0 whitespace-nowrap"
                >
                  <Check className="w-4 h-4" />
                  <span>{planSaved ? "Saved to Trip Brief" : "Save to My Trip Brief"}</span>
                </button>
              </div>

              {/* Stay & Transport Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 border-b border-stone-100 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-stone-500">
                    <Home className="w-3.5 h-3.5 text-[#1E3A5F]" />
                    <span>Recommended Stay Area</span>
                  </div>
                  <p className="font-medium text-stone-900">{customPlan.recommendedStayArea}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-stone-500">
                    <Train className="w-3.5 h-3.5 text-[#1E3A5F]" />
                    <span>Optimal Transport Strategy</span>
                  </div>
                  <p className="font-medium text-stone-900">{customPlan.transportStrategy}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-stone-500">
                    <Users className="w-3.5 h-3.5 text-[#1E3A5F]" />
                    <span>Reference Daily Estimate</span>
                  </div>
                  <p className="font-mono tabular-nums font-medium text-stone-900">
                    {customPlan.estimatedDailyBudgetUsd} (Simulated)
                  </p>
                </div>
              </div>

              {/* Day by Day Breakdown */}
              <div className="space-y-5">
                {customPlan.days.map((day) => (
                  <div
                    key={day.dayNumber}
                    className="border-b border-stone-100 last:border-b-0 pb-5 last:pb-0 space-y-3"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h4 className="font-serif-display text-xl font-semibold text-stone-900">
                        Day 0{day.dayNumber}. {day.theme}
                      </h4>
                      <span className="text-xs font-mono text-stone-500 tabular-nums">
                        {day.timeWindow}
                      </span>
                    </div>
                    <p className="text-sm text-stone-700 leading-relaxed">
                      {day.primaryExperience}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                      <div className="p-3 bg-[#F8F7F4] rounded-xl space-y-1">
                        <div className="flex items-center gap-1.5 font-medium text-stone-900">
                          <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Crowd Avoidance &amp; Transport</span>
                        </div>
                        <p className="text-stone-600 leading-relaxed">{day.crowdAvoidanceTactic}</p>
                        <p className="text-stone-500 pt-1">Route: {day.transportRoute}</p>
                      </div>
                      <div className="p-3 bg-[#F8F7F4] rounded-xl space-y-1">
                        <div className="flex items-center gap-1.5 font-medium text-stone-900">
                          <CloudRain className="w-3.5 h-3.5 text-[#1E3A5F] shrink-0" />
                          <span>Rainy-Weather Sanctuary Swap</span>
                        </div>
                        <p className="text-stone-600 leading-relaxed">{day.rainyWeatherSwap}</p>
                        <p className="text-stone-500 pt-1">Local Host: {day.localHostConnection}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Hidden Gem Scout (Brave Search / Perplexity MCP Feature) */}
      <section aria-labelledby="scout-heading" className="bg-white border border-stone-200/90 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <p className="text-xs text-stone-500">
              Miro Key Resource: Brave Search / Perplexity MCP Equivalent · Off-the-Beaten-Path Scout
            </p>
            <h2 id="scout-heading" className="font-serif-display text-2xl font-semibold text-stone-900 mt-1">
              02. Live Hidden Enclave &amp; After-Hours Spot Scout
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Discover uncrowded neighborhood sanctuaries, independent ateliers, and twilight access spots across Japan and South Korea.
            </p>
          </div>
        </div>

        <form onSubmit={handleScoutGems} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3 space-y-1.5">
            <label htmlFor="scout-city" className="block text-xs font-medium text-stone-700">
              City / Region
            </label>
            <select
              id="scout-city"
              value={scoutCity}
              onChange={(e) => setScoutCity(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#F8F7F4] border border-stone-300 rounded-xl text-stone-900"
            >
              <option value="Kyoto">Kyoto (Japan)</option>
              <option value="Tokyo">Tokyo (Japan)</option>
              <option value="Nagano">Nagano (Japan)</option>
              <option value="Seoul">Seoul (South Korea)</option>
              <option value="Jeju Island">Jeju Island (South Korea)</option>
              <option value="Busan">Busan (South Korea)</option>
            </select>
          </div>

          <div className="md:col-span-5 space-y-1.5">
            <label htmlFor="scout-interest" className="block text-xs font-medium text-stone-700">
              Specific Micro-Interest or Hobby
            </label>
            <input
              id="scout-interest"
              type="text"
              value={scoutInterest}
              onChange={(e) => setScoutInterest(e.target.value)}
              placeholder="e.g., subterranean jazz kissa, hanok tea rooms, late-night shrines"
              className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#F8F7F4] border border-stone-300 rounded-xl text-stone-900"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <span className="block text-xs font-medium text-stone-700">Weather Filter</span>
            <div className="flex items-center p-1 bg-[#F8F7F4] border border-stone-300 rounded-xl min-h-[44px]">
              <button
                type="button"
                onClick={() => setScoutWeather("clear")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  scoutWeather === "clear" ? "bg-white text-stone-900 shadow-xs" : "text-stone-600"
                }`}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setScoutWeather("rainy")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  scoutWeather === "rainy" ? "bg-white text-stone-900 shadow-xs" : "text-stone-600"
                }`}
              >
                Rainy
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={scouting}
              className="w-full min-h-[44px] px-4 py-2 text-xs font-medium bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors whitespace-nowrap disabled:opacity-60"
            >
              {scouting ? "Scouting..." : "Scout Gems"}
            </button>
          </div>
        </form>

        {scoutError && (
          <p className="text-sm text-red-700">{scoutError}</p>
        )}

        {discoveredGems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            {discoveredGems.map((gem, idx) => (
              <div key={idx} className="p-5 bg-[#F8F7F4] rounded-xl space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span>{gem.neighborhood}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{gem.bestTimeWindow}</span>
                  </div>
                  <h3 className="font-serif-display text-xl font-semibold text-stone-900">
                    0{idx + 1}. {gem.name}
                  </h3>
                  <p className="text-xs text-[#B93829] font-medium">
                    {gem.crowdComparison}
                  </p>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {gem.whyExtraordinary}
                  </p>
                </div>
                <div className="pt-3 border-t border-stone-200/80 text-xs text-stone-600 space-y-1">
                  <p><strong className="text-stone-900">Weather Fit:</strong> {gem.weatherFit}</p>
                  <p><strong className="text-stone-900">Insider Tip:</strong> {gem.localHostTip}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
