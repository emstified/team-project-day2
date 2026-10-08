import React, { useEffect, useState } from "react";
import { Soup, Train, ShieldCheck, Baby, Accessibility, Clock, MapPin } from "lucide-react";

interface RamenShop {
  id: string;
  name: string;
  city: string;
  pref: string;
  keito: string;
  neighborhood: string;
  hours: string;
  crowdNote: string;
  signatureBowl: string;
  data_as_of: string;
}

interface RestroomEntry {
  location: string;
  gateAccess: string;
  wheelchairAccessible: boolean;
  diaperTable: boolean;
  ostomate: boolean;
  babyChair: boolean;
  cleanlinessNote: string;
}

interface StationComfort {
  station: string;
  city: string;
  restrooms: RestroomEntry[];
  trainStatus: {
    line: string;
    status: string;
    crowdTip: string;
  };
  hazardAlert: {
    jmaStatus: string;
    elevationSafety: string;
  };
}

export const LocalScoutView: React.FC = () => {
  // Gachi-Ramen Finder State
  const [ramenCity, setRamenCity] = useState("ALL");
  const [ramenKeito, setRamenKeito] = useState("ALL");
  const [ramenQuery, setRamenQuery] = useState("");
  const [ramenShops, setRamenShops] = useState<RamenShop[]>([]);
  const [ramenSource, setRamenSource] = useState("");
  const [ramenLoading, setRamenLoading] = useState(false);

  // Tokyo Restroom & Live Train Status State
  const [stationFilter, setStationFilter] = useState("ALL");
  const [requireDiaperTable, setRequireDiaperTable] = useState(false);
  const [requireWheelchair, setRequireWheelchair] = useState(false);
  const [stations, setStations] = useState<StationComfort[]>([]);
  const [stationSource, setStationSource] = useState("");
  const [stationLoading, setStationLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadRamen = async () => {
      setRamenLoading(true);
      try {
        const params = new URLSearchParams({
          city: ramenCity,
          keito: ramenKeito,
          q: ramenQuery,
        });
        const res = await fetch(`/api/ramen?${params.toString()}`);
        const data = await res.json();
        if (!cancelled) {
          setRamenShops(data.shops || []);
          setRamenSource(data.source || "");
        }
      } catch (_e) {
        // ignore
      } finally {
        if (!cancelled) setRamenLoading(false);
      }
    };
    loadRamen();
    return () => {
      cancelled = true;
    };
  }, [ramenCity, ramenKeito, ramenQuery]);

  useEffect(() => {
    let cancelled = false;
    const loadStations = async () => {
      setStationLoading(true);
      try {
        const params = new URLSearchParams({
          station: stationFilter,
          diaper: String(requireDiaperTable),
          wheelchair: String(requireWheelchair),
        });
        const res = await fetch(`/api/restrooms-transit?${params.toString()}`);
        const data = await res.json();
        if (!cancelled) {
          setStations(data.stations || []);
          setStationSource(data.source || "");
        }
      } catch (_e) {
        // ignore
      } finally {
        if (!cancelled) setStationLoading(false);
      }
    };
    loadStations();
    return () => {
      cancelled = true;
    };
  }, [stationFilter, requireDiaperTable, requireWheelchair]);

  return (
    <div className="space-y-14 pb-12">
      {/* Page Header */}
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs text-stone-500 mb-2">
          On-the-Ground Traveller Utilities · Authentic Culinary &amp; Family Station Comfort
        </p>
        <h1 className="font-serif-display text-3xl md:text-4xl font-semibold text-stone-900 tracking-tight">
          Backstreet Gachi-Ramen &amp; Station Comfort Navigator
        </h1>
        <p className="mt-3 text-sm md:text-base text-stone-600 max-w-3xl leading-relaxed">
          Find verified local ramen counters away from tourist queues, and locate step-free accessible restrooms, baby changing suites, and live train route alerts across major transit hubs.
        </p>
      </div>

      {/* Section 1: Gachi-Ramen Backstreet Finder (eng213035/gachi-ramen) */}
      <section aria-labelledby="ramen-heading" className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <p className="text-xs text-stone-500">{ramenSource}</p>
            <h2
              id="ramen-heading"
              className="font-serif-display text-2xl md:text-3xl font-semibold text-stone-900 mt-1"
            >
              01. Verified Backstreet Ramen Craft Finder
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 bg-stone-200/70 rounded-xl">
              {["ALL", "Kyoto", "Tokyo", "Nagano"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setRamenCity(c)}
                  className={`min-h-[38px] px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    ramenCity === c
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {c === "ALL" ? "All Cities" : c}
                </button>
              ))}
            </div>

            <select
              aria-label="Filter by Broth Style (Keito)"
              value={ramenKeito}
              onChange={(e) => setRamenKeito(e.target.value)}
              className="min-h-[40px] px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl text-stone-800"
            >
              <option value="ALL">All Broth Styles (Keito)</option>
              <option value="Shoyu">Clear Shoyu &amp; Kelp Dashi</option>
              <option value="Niboshi">Niboshi &amp; Tamari</option>
              <option value="Miso">Aged Shinshu Miso</option>
              <option value="Duck">Duck &amp; Heirloom Negi</option>
            </select>

            <input
              type="search"
              value={ramenQuery}
              onChange={(e) => setRamenQuery(e.target.value)}
              placeholder="Search ingredient or ward..."
              className="min-h-[40px] px-3.5 py-1.5 text-xs bg-white border border-stone-300 rounded-xl text-stone-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ramenShops.map((shop) => (
            <article
              key={shop.id}
              className="bg-white border border-stone-200/90 rounded-2xl p-6 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>
                    {shop.neighborhood} · {shop.city}
                  </span>
                  <span className="font-mono text-stone-500">{shop.id}</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <Soup className="w-5 h-5 text-[#B93829] shrink-0 mt-1" />
                  <div>
                    <h3 className="font-serif-display text-xl font-semibold text-stone-900">
                      {shop.name}
                    </h3>
                    <p className="text-xs text-[#1E3A5F] font-medium mt-0.5">
                      Lineage (Keito): {shop.keito}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-stone-700 leading-relaxed">
                  <strong className="text-stone-900">Signature Bowl:</strong> {shop.signatureBowl}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 space-y-1 text-xs text-stone-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span>{shop.hours}</span>
                </div>
                <p className="text-[#B93829] font-medium">{shop.crowdNote}</p>
                <p className="text-[11px] text-stone-400 font-mono pt-1">
                  Verified: {shop.data_as_of}
                </p>
              </div>
            </article>
          ))}
        </div>

        {!ramenLoading && ramenShops.length === 0 && (
          <p className="text-sm text-stone-500 bg-white p-6 rounded-2xl border border-stone-200">
            No backstreet ramen counters matched your filter. Try selecting &ldquo;All Cities&rdquo; or &ldquo;All Broth Styles&rdquo;.
          </p>
        )}
      </section>

      {/* Section 2: Station Restroom, Family Accessibility & Live Train Status (eng213035/tokyo-restroom) */}
      <section aria-labelledby="restroom-heading" className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <p className="text-xs text-stone-500">{stationSource}</p>
            <h2
              id="restroom-heading"
              className="font-serif-display text-2xl md:text-3xl font-semibold text-stone-900 mt-1"
            >
              02. Station Restroom, Family Access &amp; Live Transit Status
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Essential when travelling with children, older parents, or navigating large stations between connections.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 bg-stone-200/70 rounded-xl">
              {[
                { id: "ALL", label: "All Hubs" },
                { id: "shinjuku", label: "Shinjuku" },
                { id: "shibuya", label: "Shibuya" },
                { id: "tokyo", label: "Tokyo / Kanda" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStationFilter(st.id)}
                  className={`min-h-[38px] px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    stationFilter === st.id
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setRequireDiaperTable(!requireDiaperTable)}
              className={`min-h-[40px] px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                requireDiaperTable
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-700 border-stone-300"
              }`}
            >
              <Baby className="w-3.5 h-3.5" />
              <span>Diaper Table</span>
            </button>

            <button
              type="button"
              onClick={() => setRequireWheelchair(!requireWheelchair)}
              className={`min-h-[40px] px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                requireWheelchair
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-700 border-stone-300"
              }`}
            >
              <Accessibility className="w-3.5 h-3.5" />
              <span>Wheelchair Access</span>
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {stations.map((st, idx) => (
            <div
              key={idx}
              className="bg-white border border-stone-200/90 rounded-2xl p-6 space-y-5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-stone-100 pb-4">
                <div>
                  <p className="text-xs text-stone-500">{st.city}</p>
                  <h3 className="font-serif-display text-2xl font-semibold text-stone-900">
                    {st.station}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-800 font-medium">
                  <span className="flex items-center gap-1">
                    <Train className="w-3.5 h-3.5" />
                    {st.trainStatus.status}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {st.hazardAlert.jmaStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Restroom Locations */}
                <div className="lg:col-span-7 space-y-3">
                  <p className="text-xs font-medium text-stone-700">
                    Verified Accessible &amp; Family Restrooms ({st.restrooms.length})
                  </p>
                  {st.restrooms.map((rm, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-4 bg-[#F8F7F4] rounded-xl space-y-2 border border-stone-200/60"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#1E3A5F] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-stone-900">{rm.location}</p>
                          <p className="text-xs text-stone-500">{rm.gateAccess}</p>
                        </div>
                      </div>
                      <p className="text-xs text-stone-700">{rm.cleanlinessNote}</p>
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-stone-600 font-mono">
                        {rm.wheelchairAccessible && <span>Wheelchair: Yes</span>}
                        {rm.diaperTable && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Baby Diaper Table: Yes</span>
                          </>
                        )}
                        {rm.ostomate && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Ostomate: Yes</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Train & Safety Context */}
                <div className="lg:col-span-5 space-y-3">
                  <p className="text-xs font-medium text-stone-700">
                    Live Transit &amp; Weather Safety Context
                  </p>
                  <div className="p-4 bg-[#F8F7F4] rounded-xl space-y-2 text-xs">
                    <p className="font-semibold text-stone-900">{st.trainStatus.line}</p>
                    <p className="text-stone-600 leading-relaxed">
                      <strong>Crowd Avoidance Tip:</strong> {st.trainStatus.crowdTip}
                    </p>
                  </div>
                  <div className="p-4 bg-[#F8F7F4] rounded-xl space-y-1.5 text-xs">
                    <p className="font-semibold text-stone-900">
                      Station Weather &amp; Elevation Safety
                    </p>
                    <p className="text-stone-600 leading-relaxed">
                      {st.hazardAlert.elevationSafety}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
