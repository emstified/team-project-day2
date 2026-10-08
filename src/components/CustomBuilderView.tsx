import React, { useState } from "react";
import {
  Compass,
  Sparkles,
  CloudRain,
  Sun,
  Train,
  Home,
  Users,
  Check,
  Soup,
  Calendar,
} from "lucide-react";

interface GeneratedDay {
  dayNumber: number;
  theme: string;
  timeWindow: string;
  primaryExperience: string;
  crowdAvoidanceTactic: string;
  rainyWeatherSwap: string;
  ramenAndCulinaryStop: string;
  stationRestroomAndTransitNote: string;
  localHostConnection: string;
}

export interface GeneratedCustomPlan {
  title: string;
  summary: string;
  holidayCrowdAdvisory: string;
  recommendedStayArea: string;
  transportAndStationComfort: string;
  estimatedDailyBudgetUsd: string;
  days: GeneratedDay[];
}

interface CustomBuilderViewProps {
  onSaveCustomPlan: (plan: GeneratedCustomPlan) => void;
}

export const CustomBuilderView: React.FC<CustomBuilderViewProps> = ({ onSaveCustomPlan }) => {
  const [destination, setDestination] = useState("Kyoto & Nagano (Japan)");
  const [travelerType, setTravelerType] = useState("Multi-Generational Family (4–6 pax)");
  const [travelDate, setTravelDate] = useState("2026-11-03");
  const [durationDays, setDurationDays] = useState(3);
  const [weatherPreference, setWeatherPreference] = useState("Auto-Swap for Rain & Mist");
  const [familyRestroomPriority, setFamilyRestroomPriority] = useState(true);
  const [ramenStylePreference, setRamenStylePreference] = useState(
    "Clear Shoyu / Kelp Dashi & Aged Shinshu Miso"
  );
  const [specialFocus, setSpecialFocus] = useState(
    "After-hours temple sanctuaries, autumn maple foliage, and private ceramic or tea ateliers"
  );

  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [customPlan, setCustomPlan] = useState<GeneratedCustomPlan | null>(null);
  const [planSaved, setPlanSaved] = useState(false);

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
          travelDate,
          durationDays,
          weatherPreference,
          familyRestroomPriority,
          ramenStylePreference,
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

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs text-stone-500 mb-2">
          Personalised Curation · Individuals, Couples &amp; Multi-Generational Families
        </p>
        <h1 className="font-serif-display text-3xl md:text-4xl font-semibold text-stone-900 tracking-tight">
          Bespoke Itinerary Architect
        </h1>
        <p className="mt-3 text-sm md:text-base text-stone-600 max-w-3xl leading-relaxed">
          Design a custom Korea or Japan journey that accounts for national holiday crowds, seasonal foliage &amp; weather swaps, station restroom/step-free comfort, backstreet ramen stops, and local hobby hosts.
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
              <option value="Tokyo Backstreets & Yanaka (Japan)">Tokyo Backstreets &amp; Yanaka (Japan)</option>
              <option value="Seoul Seochon & Jeju Island (South Korea)">Seoul Seochon &amp; Jeju Island (South Korea)</option>
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
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="travel-date" className="block text-xs font-medium text-stone-700">
                Arrival Date (Holiday Check)
              </label>
              <select
                id="travel-date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 text-xs font-mono bg-[#F8F7F4] border border-stone-300 rounded-xl text-stone-900"
              >
                <option value="2026-10-12">2026-10-12 (Sports Day Holiday)</option>
                <option value="2026-10-20">2026-10-20 (Quiet Weekday)</option>
                <option value="2026-11-03">2026-11-03 (Culture Day Holiday)</option>
                <option value="2026-11-15">2026-11-15 (Mid-Nov Foliage)</option>
                <option value="2026-11-23">2026-11-23 (Labour Thanksgiving)</option>
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
                className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#F8F7F4] border border-stone-300 rounded-xl text-stone-900"
              >
                <option value="Auto-Swap for Rain & Mist">Auto-Swap for Rain &amp; Mist</option>
                <option value="All-Weather Outdoor & Onsen">All-Weather Outdoor &amp; Onsen</option>
                <option value="Covered Sanctuaries & Ateliers">Covered Sanctuaries &amp; Ateliers</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ramen-pref" className="block text-xs font-medium text-stone-700">
              Backstreet Ramen &amp; Local Culinary Preference
            </label>
            <select
              id="ramen-pref"
              value={ramenStylePreference}
              onChange={(e) => setRamenStylePreference(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#F8F7F4] border border-stone-300 rounded-xl text-stone-900"
            >
              <option value="Clear Shoyu / Kelp Dashi & Aged Shinshu Miso">
                Clear Shoyu / Kelp Dashi &amp; Aged Shinshu Miso
              </option>
              <option value="Duck & Heirloom Negi (Kamo Shoyu)">
                Duck &amp; Heirloom Negi (Kamo Shoyu)
              </option>
              <option value="Artisanal Niboshi & Late-Night Craft Ramen">
                Artisanal Niboshi &amp; Late-Night Craft Ramen
              </option>
            </select>
          </div>

          <label className="flex items-start gap-2.5 p-3 bg-[#F8F7F4] border border-stone-200 rounded-xl cursor-pointer text-xs text-stone-700">
            <input
              type="checkbox"
              checked={familyRestroomPriority}
              onChange={(e) => setFamilyRestroomPriority(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#1E3A5F]"
            />
            <span>
              <strong>Include Family &amp; Accessibility Station Notes:</strong> Highlight step-free train exits, wheelchair/stroller gates, and accessible multipurpose restrooms along each route.
            </span>
          </label>

          <div className="space-y-1.5">
            <label htmlFor="special-focus" className="block text-xs font-medium text-stone-700">
              Personal Likes &amp; Hobby Interests
            </label>
            <textarea
              id="special-focus"
              rows={2}
              value={specialFocus}
              onChange={(e) => setSpecialFocus(e.target.value)}
              className="w-full p-3.5 text-sm bg-[#F8F7F4] border border-stone-300 rounded-xl text-stone-900"
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
                ? "Curating Weather & Holiday-Smart Route..."
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
                Configure your corridor, arrival date, weather handling, and ramen/station comfort preferences on the left to generate a bespoke day-by-day route.
              </p>
            </div>
          )}

          {generatingPlan && (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-8 space-y-4">
              <p className="text-xs font-mono text-stone-500">
                Checking holiday crowd windows, seasonal foliage, backstreet ramen stops &amp; station accessibility...
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

              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2">
                <Calendar className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Holiday &amp; Crowd Timing Advisory:</strong>{" "}
                  {customPlan.holidayCrowdAdvisory}
                </span>
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
                    <span>Transit &amp; Station Comfort</span>
                  </div>
                  <p className="font-medium text-stone-900">
                    {customPlan.transportAndStationComfort}
                  </p>
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
                          <span>Crowd Avoidance &amp; Station Comfort</span>
                        </div>
                        <p className="text-stone-600 leading-relaxed">{day.crowdAvoidanceTactic}</p>
                        <p className="text-stone-500 pt-1">
                          Transit &amp; Restroom Note: {day.stationRestroomAndTransitNote}
                        </p>
                      </div>
                      <div className="p-3 bg-[#F8F7F4] rounded-xl space-y-1">
                        <div className="flex items-center gap-1.5 font-medium text-stone-900">
                          <CloudRain className="w-3.5 h-3.5 text-[#1E3A5F] shrink-0" />
                          <span>Rainy-Weather Swap &amp; Local Host</span>
                        </div>
                        <p className="text-stone-600 leading-relaxed">{day.rainyWeatherSwap}</p>
                        <p className="text-stone-500 pt-1">Local Host: {day.localHostConnection}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-[#F8F7F4] rounded-xl flex items-start gap-2 text-xs text-stone-700">
                      <Soup className="w-4 h-4 text-[#B93829] shrink-0 mt-0.5" />
                      <span>
                        <strong>Verified Local Ramen / Culinary Pairing:</strong>{" "}
                        {day.ramenAndCulinaryStop}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
