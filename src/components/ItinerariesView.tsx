import React, { useEffect, useState } from "react";
import {
  ASSETS,
  CURATED_ITINERARIES,
  CuratedItinerary,
} from "../data/travelData";
import { SafeImage } from "./SafeImage";
import {
  CloudRain,
  Sun,
  Train,
  Home,
  Footprints,
  Check,
  ArrowRight,
  Clock,
  Compass,
  Calendar,
  AlertTriangle,
} from "lucide-react";

interface HolidayEntry {
  date: string;
  nameJa: string;
  nameEn: string;
  isThreeDayWeekend: boolean;
  crowdImpact: string;
  afterHoursStrategy: string;
}

interface SeasonsHolidaysPayload {
  source: string;
  isLiveMcp: boolean;
  city: string;
  country: string;
  seasonHighlight: string;
  koyoOrSakuraStatus: string;
  current: {
    tempC: number;
    condition: string;
    isRainy: boolean;
    advisory: string;
  };
  festivals: { name: string; dates: string; crowdTip: string }[];
  fruitFarms: { name: string; fruit: string; season: string; region: string }[];
  forecast: {
    date: string;
    maxTemp: number;
    minTemp: number;
    precipProb: number;
    condition: string;
  }[];
  holidayCheck: {
    checkedDate: string;
    isNationalHoliday: boolean;
    holidayDetail: HolidayEntry | null;
    upcomingHolidays: HolidayEntry[];
  };
}

interface ItinerariesViewProps {
  savedItineraryIds: string[];
  onToggleSaveItinerary: (id: string) => void;
  onOpenCustomBuilder: () => void;
  onOpenBookingDrawer: () => void;
}

export const ItinerariesView: React.FC<ItinerariesViewProps> = ({
  savedItineraryIds,
  onToggleSaveItinerary,
  onOpenCustomBuilder,
  onOpenBookingDrawer,
}) => {
  const [countryFilter, setCountryFilter] = useState<"ALL" | "Japan" | "South Korea">("ALL");
  const [groupFilter, setGroupFilter] = useState<"ALL" | "Individual" | "Couple" | "Family">("ALL");
  const [weatherMode, setWeatherMode] = useState<"clear" | "rainy">("clear");
  const [activeWeatherCity, setActiveWeatherCity] = useState<
    "kyoto" | "seoul" | "nagano" | "jeju" | "tokyo"
  >("kyoto");
  const [selectedTravelDate, setSelectedTravelDate] = useState("2026-11-03");
  const [seasonData, setSeasonData] = useState<SeasonsHolidaysPayload | null>(null);
  const [seasonLoading, setSeasonLoading] = useState(false);

  const [activeItinerary, setActiveItinerary] = useState<CuratedItinerary>(CURATED_ITINERARIES[0]);
  const [activeDetailTab, setActiveDetailTab] = useState<
    "schedule" | "transport-stay" | "virtual-walk"
  >("schedule");
  const [activeWaypointIdx, setActiveWaypointIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const loadSeasonAndHolidays = async () => {
      setSeasonLoading(true);
      try {
        const res = await fetch(
          `/api/seasons-holidays?city=${activeWeatherCity}&date=${selectedTravelDate}`
        );
        if (!res.ok) throw new Error("Failed to fetch seasonal data");
        const data = (await res.json()) as SeasonsHolidaysPayload;
        if (!cancelled) {
          setSeasonData(data);
        }
      } catch (_e) {
        // Ignore
      } finally {
        if (!cancelled) setSeasonLoading(false);
      }
    };
    loadSeasonAndHolidays();
    return () => {
      cancelled = true;
    };
  }, [activeWeatherCity, selectedTravelDate]);

  const filteredItineraries = CURATED_ITINERARIES.filter((item) => {
    const matchesCountry = countryFilter === "ALL" || item.country === countryFilter;
    const matchesGroup = groupFilter === "ALL" || item.suitedFor.includes(groupFilter);
    return matchesCountry && matchesGroup;
  });

  const handleSelectItinerary = (item: CuratedItinerary) => {
    setActiveItinerary(item);
    setActiveWeatherCity(item.cityKey);
    setActiveWaypointIdx(0);
    const el = document.getElementById("itinerary-deep-dive");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-14 pb-12">
      {/* 1. Hero Section (Single Dominant Focal Anchor) */}
      <section className="relative rounded-3xl overflow-hidden bg-stone-900 min-h-[420px] md:min-h-[480px] flex items-end">
        <SafeImage
          src={ASSETS.heroKyoto}
          alt="Lantern-lit wooden alleyway in Kyoto after hours with zero crowds"
          fallbackTitle="Kyoto & Seoul After-Hours Sanctuaries"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />

        <div className="relative z-10 p-6 sm:p-10 md:p-12 max-w-3xl text-white space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-200">
            <span>Korea &amp; Japan Focused</span>
            <span aria-hidden="true">·</span>
            <span>After-Hours Sanctuary Access</span>
            <span aria-hidden="true">·</span>
            <span>Holiday &amp; Weather-Smart Routing</span>
          </div>

          <h1 className="font-serif-display text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.12] text-white">
            When the Tour Buses Leave, the Real Korea &amp; Japan Begin.
          </h1>

          <p className="text-sm sm:text-base text-stone-200 max-w-2xl leading-relaxed">
            Curated, reasonably priced itineraries for adventurous individuals and families who want to escape overcrowded tourist landmarks. Featuring private twilight temple entry, national holiday crowd-avoidance alerts, weather-smart indoor swaps, and local hobby hosts.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenCustomBuilder}
              className="min-h-[48px] px-6 py-3 text-sm font-medium bg-white text-stone-950 rounded-xl hover:bg-stone-100 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <span>Personalise My Itinerary</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
            <a
              href="#itinerary-deep-dive"
              className="min-h-[48px] px-5 py-3 text-sm font-medium text-white border border-white/30 rounded-xl hover:bg-white/10 transition-colors flex items-center whitespace-nowrap"
            >
              Inspect Curated Routes
            </a>
          </div>
        </div>
      </section>

      {/* 2. Seasonal Phenology, Weather & Holiday Crowd-Avoidance Strip (japan-seasons-mcp + japan-holiday-mcp) */}
      <section
        aria-label="Seasonal Foliage, Weather, and Holiday Crowd Intelligence"
        className="bg-white border border-stone-200/90 rounded-2xl p-5 md:p-6 space-y-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
              <span>Seasonal &amp; Holiday Crowd Planner</span>
              <span aria-hidden="true">·</span>
              <span>{seasonData?.source || "Loading Seasonal & Holiday Feed..."}</span>
            </div>
            <h2 className="font-serif-display text-xl md:text-2xl font-semibold text-stone-900">
              Foliage, Weather &amp; National Holiday Crowd-Avoidance Check
            </h2>
          </div>

          {/* City Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F8F7F4] border border-stone-200 rounded-xl">
            {(
              [
                { key: "kyoto", label: "Kyoto" },
                { key: "tokyo", label: "Tokyo" },
                { key: "nagano", label: "Nagano" },
                { key: "seoul", label: "Seoul" },
                { key: "jeju", label: "Jeju Island" },
              ] as const
            ).map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setActiveWeatherCity(c.key)}
                className={`min-h-[38px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeWeatherCity === c.key
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {seasonData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3 border-t border-stone-100 items-start">
            {/* Weather & Koyo/Sakura Status */}
            <div className="lg:col-span-5 space-y-2.5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#F8F7F4] border border-stone-200 flex items-center justify-center shrink-0">
                  {weatherMode === "rainy" ? (
                    <CloudRain className="w-5 h-5 text-[#1E3A5F]" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold font-mono tabular-nums text-stone-900">
                      {seasonData.current.tempC}°C
                    </span>
                    <span className="text-xs text-stone-600">
                      {seasonData.city}, {seasonData.country} · {seasonData.current.condition}
                    </span>
                  </div>
                  <p className="text-xs text-[#1E3A5F] font-medium mt-0.5">
                    {seasonData.koyoOrSakuraStatus}
                  </p>
                </div>
              </div>

              {seasonData.fruitFarms[0] && (
                <p className="text-xs text-stone-600">
                  <strong className="text-stone-900">Seasonal Harvest Experience:</strong>{" "}
                  {seasonData.fruitFarms[0].name} — {seasonData.fruitFarms[0].fruit} ({seasonData.fruitFarms[0].season})
                </p>
              )}

              {/* Weather Mode Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-stone-500">Weather Routing:</span>
                <div className="flex items-center p-1 bg-[#F8F7F4] border border-stone-300 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setWeatherMode("clear")}
                    className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
                      weatherMode === "clear"
                        ? "bg-white text-stone-900 shadow-xs"
                        : "text-stone-600"
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-600" />
                    <span>Clear Sky</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeatherMode("rainy")}
                    className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
                      weatherMode === "rainy"
                        ? "bg-white text-stone-900 shadow-xs"
                        : "text-stone-600"
                    }`}
                  >
                    <CloudRain className="w-3.5 h-3.5 text-[#1E3A5F]" />
                    <span>Rainy Swap</span>
                  </button>
                </div>
              </div>
            </div>

            {/* National Holiday Crowd-Surge Checker (kakar-satoshi/japan-holiday-mcp) */}
            <div className="lg:col-span-7 p-4 bg-[#F8F7F4] rounded-2xl border border-stone-200/70 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-stone-900">
                  <Calendar className="w-4 h-4 text-[#1E3A5F]" />
                  <span>Check Travel Date Against National Holiday Crowd Surges</span>
                </div>
                <select
                  aria-label="Select travel date to check holiday status"
                  value={selectedTravelDate}
                  onChange={(e) => setSelectedTravelDate(e.target.value)}
                  className="min-h-[38px] px-3 py-1 text-xs bg-white border border-stone-300 rounded-xl text-stone-900 font-mono"
                >
                  <option value="2026-10-12">2026-10-12 · Sports Day (National Holiday)</option>
                  <option value="2026-10-20">2026-10-20 · Regular Tuesday (Low Crowd)</option>
                  <option value="2026-11-03">2026-11-03 · Culture Day (National Holiday)</option>
                  <option value="2026-11-15">2026-11-15 · Regular Mid-Month Window</option>
                  <option value="2026-11-23">2026-11-23 · Labour Thanksgiving (Holiday)</option>
                </select>
              </div>

              {seasonLoading ? (
                <p className="text-xs text-stone-500">Checking holiday calendar...</p>
              ) : seasonData.holidayCheck.isNationalHoliday &&
                seasonData.holidayCheck.holidayDetail ? (
                <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      Holiday Crowd Alert: {seasonData.holidayCheck.holidayDetail.nameEn} (
                      {seasonData.holidayCheck.holidayDetail.nameJa})
                    </span>
                  </div>
                  <p className="text-amber-900">
                    <strong>Impact:</strong> {seasonData.holidayCheck.holidayDetail.crowdImpact}
                  </p>
                  <p className="text-[#1E3A5F] font-medium">
                    <strong>UraMichi Auto-Adjustment:</strong>{" "}
                    {seasonData.holidayCheck.holidayDetail.afterHoursStrategy}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-white border border-stone-200/80 rounded-xl text-xs text-stone-700">
                  <strong className="text-emerald-800">Non-Holiday Window ({selectedTravelDate}):</strong>{" "}
                  No Japanese Cabinet Office national holiday falls on this date. Ideal conditions for quiet daytime artisan studios and evening temple access.
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 3. Proven Curated Itineraries Catalog */}
      <section aria-labelledby="curated-catalog-heading" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs text-stone-500">
              Proven Curated Tour Itineraries · Transparent Reference Pricing
            </p>
            <h2
              id="curated-catalog-heading"
              className="font-serif-display text-2xl md:text-3xl font-semibold text-stone-900 mt-1"
            >
              01. Select a Proven Off-the-Beaten-Path Route
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 bg-stone-200/70 rounded-xl">
              {(["ALL", "Japan", "South Korea"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCountryFilter(c)}
                  className={`min-h-[38px] px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    countryFilter === c
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {c === "ALL" ? "All Regions" : c}
                </button>
              ))}
            </div>

            <div className="flex items-center p-1 bg-stone-200/70 rounded-xl">
              {(["ALL", "Individual", "Couple", "Family"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGroupFilter(g)}
                  className={`min-h-[38px] px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    groupFilter === g
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {g === "ALL" ? "All Sizes" : g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItineraries.map((item) => {
            const isSelected = activeItinerary.id === item.id;
            const isSaved = savedItineraryIds.includes(item.id);

            return (
              <article
                key={item.id}
                className={`bg-white rounded-2xl overflow-hidden border transition-colors flex flex-col justify-between ${
                  isSelected
                    ? "border-[#1E3A5F] ring-1 ring-[#1E3A5F]"
                    : "border-stone-200/90 hover:border-stone-300"
                }`}
              >
                <div>
                  <div
                    onClick={() => handleSelectItinerary(item)}
                    className="relative h-56 overflow-hidden cursor-pointer"
                  >
                    <SafeImage
                      src={item.heroImage}
                      alt={item.title}
                      fallbackTitle={item.title}
                      className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5 text-white">
                      <div className="flex items-center gap-2 text-xs text-stone-200">
                        <span>{item.regionLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.duration}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.suitedFor.join(" / ")}</span>
                      </div>
                      <h3 className="font-serif-display text-2xl font-semibold mt-1">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <p className="text-xs text-[#B93829] font-medium">
                      {item.crowdAvoidanceScore} · {item.replacesTouristTrap}
                    </p>
                    <p className="text-sm text-stone-600 leading-relaxed">{item.subtitle}</p>
                    <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                      <span>Host: {item.localPartnerName}</span>
                      <span className="font-mono tabular-nums text-stone-900 font-semibold">
                        From ${item.referencePriceUsd} USD (Simulated Ref)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSelectItinerary(item)}
                    className="flex-1 min-h-[44px] px-4 py-2 text-xs font-medium bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors whitespace-nowrap"
                  >
                    {isSelected ? "Currently Inspecting Below" : "Inspect Schedule, Stay & Route"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleSaveItinerary(item.id)}
                    className={`min-h-[44px] px-4 py-2 text-xs font-medium rounded-xl border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                      isSaved
                        ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                        : "bg-[#F8F7F4] text-stone-800 border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {isSaved && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                    <span>{isSaved ? "In Trip Brief" : "Save Route"}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 4. End-to-End Itinerary Deep-Dive Dossier */}
      <section
        id="itinerary-deep-dive"
        aria-labelledby="deep-dive-heading"
        className="bg-white border border-stone-200/90 rounded-3xl p-6 md:p-10 space-y-8 scroll-mt-20"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
              <span>Selected Itinerary Dossier</span>
              <span aria-hidden="true">·</span>
              <span>{activeItinerary.regionLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{activeItinerary.seasonTag}</span>
            </div>
            <h2
              id="deep-dive-heading"
              className="font-serif-display text-2xl md:text-4xl font-semibold text-stone-900"
            >
              {activeItinerary.title}
            </h2>
            <p className="text-sm text-stone-600">
              Led by <strong className="text-stone-900">{activeItinerary.localPartnerName}</strong> ({activeItinerary.localPartnerType})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start">
            <button
              type="button"
              onClick={() => {
                if (!savedItineraryIds.includes(activeItinerary.id)) {
                  onToggleSaveItinerary(activeItinerary.id);
                }
                onOpenBookingDrawer();
              }}
              className="min-h-[48px] px-5 py-2.5 text-xs font-medium bg-[#1E3A5F] text-white rounded-xl hover:bg-[#162B47] transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <span>Reserve / Request Concierge Hold</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs for Deep Dive */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F8F7F4] border border-stone-200 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveDetailTab("schedule")}
              className={`min-h-[42px] px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeDetailTab === "schedule"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>01. After-Hours &amp; Weather-Smart Stops</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDetailTab("transport-stay")}
              className={`min-h-[42px] px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeDetailTab === "transport-stay"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Train className="w-3.5 h-3.5" />
              <span>02. Best Transport &amp; Heritage Stay</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDetailTab("virtual-walk")}
              className={`min-h-[42px] px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeDetailTab === "virtual-walk"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>03. Virtual Path Preview</span>
            </button>
          </div>

          {activeDetailTab === "schedule" && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500">Active Weather View:</span>
              <button
                type="button"
                onClick={() => setWeatherMode(weatherMode === "clear" ? "rainy" : "clear")}
                className="min-h-[38px] px-3 py-1.5 font-medium bg-[#F8F7F4] border border-stone-300 rounded-lg text-stone-900 flex items-center gap-1.5 whitespace-nowrap"
              >
                {weatherMode === "clear" ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-600" />
                    <span>Showing Clear Sky Plan (Tap for Rainy Swap)</span>
                  </>
                ) : (
                  <>
                    <CloudRain className="w-3.5 h-3.5 text-[#1E3A5F]" />
                    <span>Showing Rainy Indoor Swap (Tap for Clear Plan)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: After-Hours & Weather-Adaptive Stops */}
        {activeDetailTab === "schedule" && (
          <div className="space-y-4">
            {activeItinerary.stops.map((stop, idx) => (
              <div
                key={idx}
                className="p-5 bg-[#F8F7F4] rounded-2xl space-y-3 border border-stone-200/60"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums font-medium text-stone-900">
                      {stop.time}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{stop.category}</span>
                    {stop.afterHoursAccess && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#B93829] font-medium">
                          After-Hours Crowd-Free Window
                        </span>
                      </>
                    )}
                  </div>
                  <span className="font-mono text-stone-500">
                    Hours: {stop.yelpBusinessMeta.tradingHours}
                  </span>
                </div>

                <h3 className="font-serif-display text-xl font-semibold text-stone-900">
                  0{idx + 1}. {stop.title}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div
                    className={`p-4 rounded-xl border transition-colors ${
                      weatherMode === "clear"
                        ? "bg-white border-amber-500/60"
                        : "bg-white/60 border-stone-200 opacity-75"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-medium text-stone-900 mb-1">
                      <Sun className="w-3.5 h-3.5 text-amber-600" />
                      <span>Clear Weather Experience</span>
                    </div>
                    <p className="text-sm text-stone-700 leading-relaxed">
                      {stop.clearWeatherPlan}
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-xl border transition-colors ${
                      weatherMode === "rainy"
                        ? "bg-white border-[#1E3A5F]"
                        : "bg-white/60 border-stone-200 opacity-75"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-medium text-stone-900 mb-1">
                      <CloudRain className="w-3.5 h-3.5 text-[#1E3A5F]" />
                      <span>Rainy / Mist Weather Sanctuary Swap</span>
                    </div>
                    <p className="text-sm text-stone-700 leading-relaxed">
                      {stop.rainyWeatherSwap}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-stone-500">
                  <span>{stop.yelpBusinessMeta.localSentiment}</span>
                  <span aria-hidden="true">·</span>
                  <span>Crowd Density: {stop.yelpBusinessMeta.crowdIndex}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Best Transport Routes & Curated Stay */}
        {activeDetailTab === "transport-stay" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div>
                <p className="text-xs text-stone-500">
                  Recommended Door-to-Door Transit &amp; Lower-Cost Connections
                </p>
                <h3 className="font-serif-display text-2xl font-semibold text-stone-900 mt-0.5">
                  Optimal Transport Routing
                </h3>
              </div>

              {activeItinerary.transportRoutes.map((tr, i) => (
                <div
                  key={i}
                  className="p-5 bg-[#F8F7F4] rounded-2xl space-y-2 border border-stone-200/70"
                >
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-medium text-stone-900">{tr.mode}</span>
                    <span className="font-mono tabular-nums">
                      {tr.duration} · ~${tr.referenceCostUsd} USD (Simulated Ref)
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#1E3A5F]">{tr.routeSummary}</p>
                  <p className="text-xs text-stone-600 leading-relaxed">{tr.whyBest}</p>
                </div>
              ))}
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div>
                <p className="text-xs text-stone-500">
                  Curated Neighbourhood Accommodation (Simulated Reference Stay)
                </p>
                <h3 className="font-serif-display text-2xl font-semibold text-stone-900 mt-0.5">
                  Recommended Architectural Stay
                </h3>
              </div>

              <div className="p-5 bg-[#F8F7F4] rounded-2xl space-y-3 border border-stone-200/70">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>{activeItinerary.curatedStay.propertyType}</span>
                  <span className="font-mono tabular-nums text-stone-900 font-semibold">
                    ${activeItinerary.curatedStay.referenceNightlyUsd}/night (Simulated Ref)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-[#1E3A5F] shrink-0" />
                  <h4 className="font-serif-display text-xl font-semibold text-stone-900">
                    {activeItinerary.curatedStay.title}
                  </h4>
                </div>
                <p className="text-xs text-stone-500">
                  {activeItinerary.curatedStay.neighborhood} · Rating{" "}
                  {activeItinerary.curatedStay.rating} ({activeItinerary.curatedStay.reviewCount}{" "}
                  verified reviews)
                </p>
                <p className="text-sm text-stone-700 leading-relaxed">
                  {activeItinerary.curatedStay.architecturalHighlight}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Virtual Path Preview */}
        {activeDetailTab === "virtual-walk" && (
          <div className="p-6 bg-[#F8F7F4] rounded-2xl space-y-5 border border-stone-200/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <p className="text-xs text-stone-500">
                  Interactive Route Preview Before You Travel
                </p>
                <h3 className="font-serif-display text-2xl font-semibold text-stone-900">
                  Step-by-Step Street &amp; Sanctuary Walkthrough
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                {activeItinerary.virtualTravelWaypoints.map((wp, idx) => (
                  <button
                    key={wp.step}
                    type="button"
                    onClick={() => setActiveWaypointIdx(idx)}
                    className={`min-h-[38px] px-3 py-1.5 text-xs font-mono rounded-lg transition-colors whitespace-nowrap ${
                      activeWaypointIdx === idx
                        ? "bg-stone-900 text-white"
                        : "bg-white text-stone-700 border border-stone-200"
                    }`}
                  >
                    Waypoint 0{wp.step}
                  </button>
                ))}
              </div>
            </div>

            {activeItinerary.virtualTravelWaypoints[activeWaypointIdx] && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 h-52 rounded-xl overflow-hidden relative">
                  <SafeImage
                    src={activeItinerary.heroImage}
                    alt={activeItinerary.virtualTravelWaypoints[activeWaypointIdx].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3.5 right-3.5 text-white text-xs font-mono">
                    GPS: {activeItinerary.virtualTravelWaypoints[activeWaypointIdx].coordinates}
                  </div>
                </div>
                <div className="md:col-span-7 space-y-3">
                  <div className="text-xs text-stone-500">
                    {
                      activeItinerary.virtualTravelWaypoints[activeWaypointIdx]
                        .elevationOrAtmosphere
                    }
                  </div>
                  <h4 className="font-serif-display text-2xl font-semibold text-stone-900">
                    0{activeItinerary.virtualTravelWaypoints[activeWaypointIdx].step}.{" "}
                    {activeItinerary.virtualTravelWaypoints[activeWaypointIdx].title}
                  </h4>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {activeItinerary.virtualTravelWaypoints[activeWaypointIdx].streetViewNarrative}
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-stone-200/80 flex items-center gap-2 text-xs text-stone-600">
                    <Compass className="w-4 h-4 text-[#1E3A5F] shrink-0" />
                    <span>
                      <strong>Ambient Soundscape:</strong>{" "}
                      {activeItinerary.virtualTravelWaypoints[activeWaypointIdx].localAudioCue}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
