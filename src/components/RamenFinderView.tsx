import React, { useEffect, useState } from "react";
import { RAMEN_IMAGES, RamenShopRecord } from "../data/ramenData";
import { SafeImage } from "./SafeImage";
import {
  Soup,
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Check,
  Search,
  Sparkles,
  ExternalLink,
  X,
} from "lucide-react";

interface RamenFinderViewProps {
  savedShopIds: string[];
  onToggleSaveShop: (shop: RamenShopRecord) => void;
  onOpenTrails: () => void;
}

export const RamenFinderView: React.FC<RamenFinderViewProps> = ({
  savedShopIds,
  onToggleSaveShop,
  onOpenTrails,
}) => {
  const [prefFilter, setPrefFilter] = useState("ALL");
  const [keitoFilter, setKeitoFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [icCardOnly, setIcCardOnly] = useState(false);
  const [lateNightOnly, setLateNightOnly] = useState(false);

  const [shops, setShops] = useState<RamenShopRecord[]>([]);
  const [dataSource, setDataSource] = useState("");
  const [dataAsOf, setDataAsOf] = useState("2026-10-01");
  const [loading, setLoading] = useState(false);

  // Selected shop for get_ramen_shop dossier modal
  const [selectedShop, setSelectedShop] = useState<RamenShopRecord | null>(null);
  const [shopDetailLoading, setShopDetailLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchRamen = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          action: "search",
          pref: prefFilter,
          keito: keitoFilter,
          status: statusFilter,
          q: searchQuery,
          ic_card: String(icCardOnly),
          late_night: String(lateNightOnly),
        });
        const res = await fetch(`/api/ramen.js?${params.toString()}`);
        const data = await res.json();
        if (!cancelled) {
          setShops(data.shops || []);
          setDataSource(data.source || "");
          setDataAsOf(data.data_as_of || "2026-10-01");
        }
      } catch (_e) {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchRamen();
    return () => {
      cancelled = true;
    };
  }, [
    prefFilter,
    keitoFilter,
    statusFilter,
    searchQuery,
    icCardOnly,
    lateNightOnly,
  ]);

  const handleInspectShopDossier = async (shop: RamenShopRecord) => {
    setSelectedShop(shop);
    setShopDetailLoading(true);
    try {
      const res = await fetch(
        `/api/ramen.js?action=shop&id=${encodeURIComponent(shop.id)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.shop) {
          setSelectedShop(data.shop);
        }
      }
    } catch (_e) {
      // keep initial shop record
    } finally {
      setShopDetailLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-10">
      {/* Editorial Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-stone-950 text-[#F8F7F4] border border-stone-800">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6 z-10">
            <div className="space-y-4">
              <p className="text-xs font-mono tracking-wider uppercase text-amber-300/90">
                Powered by eng213035/gachi-ramen MCP · 62,144 Verified Shops · 47 Prefectures
              </p>
              <h1 className="font-serif-display text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.08] text-white">
                Find Japan&rsquo;s Most Extraordinary Bowls—Without the Tourist Traps.
              </h1>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl">
                Search Japan&rsquo;s verified ramen database by broth lineage (<em>keito</em>), station walking distance, Suica/IC card acceptance, and monthly closure checks so every meal on your trip counts.
              </p>
            </div>

            {/* Quick Prompt Starters from eng213035/gachi-ramen spec */}
            <div className="space-y-3 pt-2">
              <p className="text-xs text-stone-400">
                Quick Traveller Searches (Click to filter):
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPrefFilter("Tokyo");
                    setKeitoFilter("shoyu");
                    setStatusFilter("active");
                    setSearchQuery("");
                  }}
                  className="min-h-[38px] px-3.5 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                  Tokyo Artisanal Shoyu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPrefFilter("Fukuoka");
                    setKeitoFilter("tonkotsu");
                    setStatusFilter("active");
                    setSearchQuery("");
                  }}
                  className="min-h-[38px] px-3.5 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                  Hakata Foaming Tonkotsu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPrefFilter("Hokkaido");
                    setKeitoFilter("ALL");
                    setStatusFilter("active");
                    setSearchQuery("Cape Soya");
                  }}
                  className="min-h-[38px] px-3.5 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                  45.5°N Northernmost Ramen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPrefFilter("Okinawa");
                    setKeitoFilter("ALL");
                    setStatusFilter("active");
                    setSearchQuery("");
                  }}
                  className="min-h-[38px] px-3.5 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                  Iriomote &amp; Ishigaki Island
                </button>
                <button
                  type="button"
                  onClick={onOpenTrails}
                  className="min-h-[38px] px-3.5 py-1.5 text-xs font-medium bg-[#B93829] hover:bg-[#9E2E21] text-white rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explore Regional Ramen Trails</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-[420px]">
            <SafeImage
              src={RAMEN_IMAGES.heroCounter}
              alt="Intimate wooden ramen counter in a Tokyo backstreet alley at twilight"
              className="w-full h-full object-cover"
              fallbackTitle="Tokyo Backstreet Ramen Counter"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-stone-950 via-stone-950/35 to-transparent" />
          </div>
        </div>
      </section>

      {/* Search & Filter Control Panel (search_ramen MCP parameters) */}
      <section
        aria-label="Ramen Database Search Controls"
        className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div>
            <p className="text-xs font-mono text-stone-500">
              MCP Tool: <span className="text-stone-800 font-semibold">search_ramen</span> ·{" "}
              {dataSource}
            </p>
            <h2 className="font-serif-display text-2xl font-semibold text-stone-900 mt-0.5">
              Nationwide Verified Ramen Shop Explorer
            </h2>
          </div>
          <p className="text-xs font-mono text-stone-500 tabular-nums">
            Freshness Stamp: <span className="text-stone-900 font-medium">data_as_of {dataAsOf}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Nationwide Text Search (q) */}
          <div className="md:col-span-5 relative">
            <label htmlFor="ramen-q" className="block text-xs font-medium text-stone-700 mb-1">
              Search Shop Name, Ward, Station or Ingredient (English or 日本語)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="ramen-q"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Hachigo, Shinjuku, Hakata, Niboshi, Scallop..."
                className="w-full min-h-[44px] pl-10 pr-3.5 py-2 text-sm bg-[#F8F7F4] border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
          </div>

          {/* Prefecture Filter (pref) */}
          <div className="md:col-span-3">
            <label htmlFor="ramen-pref" className="block text-xs font-medium text-stone-700 mb-1">
              Prefecture (pref)
            </label>
            <select
              id="ramen-pref"
              value={prefFilter}
              onChange={(e) => setPrefFilter(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 text-sm bg-[#F8F7F4] border border-stone-300 rounded-xl text-stone-900"
            >
              <option value="ALL">All 47 Prefectures</option>
              <option value="Tokyo">Tokyo (東京都)</option>
              <option value="Fukuoka">Fukuoka / Hakata (福岡県)</option>
              <option value="Hokkaido">Hokkaido / Sapporo &amp; Soya (北海道)</option>
              <option value="Kyoto">Kyoto (京都府)</option>
              <option value="Osaka">Osaka (大阪府)</option>
              <option value="Chiba">Chiba / Matsudo (千葉県)</option>
              <option value="Okinawa">Okinawa / Yaeyama (沖縄県)</option>
            </select>
          </div>

          {/* Broth Lineage Filter (keito) */}
          <div className="md:col-span-4">
            <label htmlFor="ramen-keito" className="block text-xs font-medium text-stone-700 mb-1">
              Broth Lineage (keito)
            </label>
            <select
              id="ramen-keito"
              value={keitoFilter}
              onChange={(e) => setKeitoFilter(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 text-sm bg-[#F8F7F4] border border-stone-300 rounded-xl text-stone-900"
            >
              <option value="ALL">All Broth Styles (Keito)</option>
              <option value="shoyu">Shoyu (Soy Sauce &amp; Niboshi)</option>
              <option value="tonkotsu">Tonkotsu (Pork Bone / Hakata)</option>
              <option value="miso">Miso (Sapporo Wok-Fired)</option>
              <option value="shio">Shio (Clear Sea Salt, Kelp &amp; Scallop)</option>
              <option value="tsukemen">Tsukemen (Rich Dipping Noodles)</option>
              <option value="spicy">Spicy / Kara-Shibi Sansho</option>
              <option value="other">Regional Specialty / Island Style</option>
            </select>
          </div>
        </div>

        {/* Traveller Comfort & Verification Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIcCardOnly(!icCardOnly)}
              className={`min-h-[40px] px-3.5 py-1.5 text-xs font-medium rounded-xl border transition-colors flex items-center gap-1.5 ${
                icCardOnly
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-[#F8F7F4] text-stone-700 border-stone-300 hover:bg-stone-100"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Suica / IC Card Accepted</span>
            </button>

            <button
              type="button"
              onClick={() => setLateNightOnly(!lateNightOnly)}
              className={`min-h-[40px] px-3.5 py-1.5 text-xs font-medium rounded-xl border transition-colors flex items-center gap-1.5 ${
                lateNightOnly
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-[#F8F7F4] text-stone-700 border-stone-300 hover:bg-stone-100"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Open Late-Night (Post-22:00)</span>
            </button>

            <div className="flex items-center p-1 bg-stone-200/70 rounded-xl">
              {[
                { id: "active", label: "Active Only" },
                { id: "ALL", label: "Include Closed Audit" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id)}
                  className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    statusFilter === st.id
                      ? "bg-white text-stone-900 shadow-2xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {(prefFilter !== "ALL" ||
            keitoFilter !== "ALL" ||
            searchQuery ||
            icCardOnly ||
            lateNightOnly ||
            statusFilter !== "active") && (
            <button
              type="button"
              onClick={() => {
                setPrefFilter("ALL");
                setKeitoFilter("ALL");
                setStatusFilter("active");
                setSearchQuery("");
                setIcCardOnly(false);
                setLateNightOnly(false);
              }}
              className="text-xs font-medium text-[#B93829] hover:underline"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </section>

      {/* Results Grid */}
      <section aria-label="Matched Ramen Shops" className="space-y-4">
        <div className="flex items-center justify-between text-xs text-stone-500 px-1">
          <span>
            Showing <strong className="text-stone-900">{shops.length}</strong> verified ramen counters
          </span>
          <span>Click any shop card to inspect full MCP record (get_ramen_shop)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {shops.map((shop) => {
            const isSaved = savedShopIds.includes(shop.id);
            const isClosed = shop.status === "closed_confirmed";

            return (
              <article
                key={shop.id}
                className={`bg-white border rounded-2xl p-6 flex flex-col justify-between space-y-4 transition-shadow hover:shadow-md ${
                  isClosed ? "border-red-200 bg-red-50/20" : "border-stone-200/90"
                }`}
              >
                <div className="space-y-3">
                  {/* Top Metadata Row */}
                  <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
                    <span className="font-medium text-stone-700">
                      {shop.pref} ({shop.pref_ja}) · {shop.neighborhood}
                    </span>
                    <span className="font-mono text-stone-500">{shop.id}</span>
                  </div>

                  {/* Shop Name & Lineage */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-serif-display text-2xl font-semibold text-stone-900 leading-snug">
                          {shop.name_en}
                        </h3>
                        <p className="text-xs text-stone-500 font-medium">{shop.name}</p>
                      </div>
                      <span
                        className={`text-[11px] font-mono uppercase px-2.5 py-1 rounded-md shrink-0 ${
                          isClosed
                            ? "bg-red-100 text-red-800 font-semibold"
                            : "bg-stone-100 text-stone-800"
                        }`}
                      >
                        {isClosed ? "Closed Confirmed" : `keito: ${shop.keito}`}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#B93829] pt-0.5">
                      {shop.keitoLabel}
                    </p>
                  </div>

                  {/* Signature Bowl */}
                  <p className="text-sm text-stone-700 leading-relaxed">
                    <strong className="text-stone-900">Signature Bowl:</strong>{" "}
                    {shop.signatureBowl}
                  </p>

                  {/* Station Distance & Payment Tri-State Facts */}
                  <div className="p-3.5 bg-[#F8F7F4] rounded-xl space-y-2 text-xs text-stone-700">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#B93829] shrink-0" />
                      <span>
                        <strong>{shop.station_name}</strong> ·{" "}
                        <span className="font-mono">{shop.station_distance_m}m walk</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <span>
                        {shop.hours} · <span className="font-mono">{shop.priceRangeJpy}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {shop.payment.cash_only ? (
                        <Banknote className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      ) : (
                        <CreditCard className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      )}
                      <span>
                        {shop.payment.cash_only
                          ? "Cash Only at Ticket Machine — Bring ¥1,000 bills"
                          : `Cashless OK (${[
                              shop.payment.ic_card_ok ? "Suica/IC" : "",
                              shop.payment.card_ok ? "Card" : "",
                              shop.payment.qr_pay_ok ? "PayPay/QR" : "",
                            ]
                              .filter(Boolean)
                              .join(", ")})`}
                      </span>
                    </div>
                  </div>

                  {/* Traveller Tip */}
                  <p className="text-xs text-stone-600 leading-relaxed">
                    <strong className="text-stone-800">Traveller Note:</strong>{" "}
                    {shop.travelerTip}
                  </p>
                </div>

                {/* Action Bar */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleInspectShopDossier(shop)}
                    className="min-h-[40px] px-3.5 py-2 text-xs font-medium text-stone-700 bg-[#F8F7F4] hover:bg-stone-200/70 rounded-xl transition-colors"
                  >
                    Inspect Shop Dossier (get_ramen_shop)
                  </button>

                  {!isClosed && (
                    <button
                      type="button"
                      onClick={() => onToggleSaveShop(shop)}
                      className={`min-h-[40px] px-4 py-2 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 ${
                        isSaved
                          ? "bg-emerald-800 text-white"
                          : "bg-stone-900 hover:bg-stone-800 text-white"
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Saved to Crawl</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Ramen Crawl</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {!loading && shops.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center space-y-3">
            <Soup className="w-8 h-8 text-stone-400 mx-auto" />
            <p className="text-sm font-medium text-stone-800">
              No ramen shops matched those exact filters.
            </p>
            <p className="text-xs text-stone-500">
              Try selecting &ldquo;All 47 Prefectures&rdquo; or clearing the Suica/Late-Night toggle.
            </p>
          </div>
        )}
      </section>

      {/* Shop Dossier Modal (get_ramen_shop tool output) */}
      {selectedShop && (
        <div
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Ramen Shop MCP Dossier"
        >
          <div className="bg-white w-full max-w-xl rounded-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <p className="text-xs font-mono text-[#B93829]">
                  MCP Tool: get_ramen_shop · ID: {selectedShop.id}
                </p>
                <h3 className="font-serif-display text-2xl font-semibold text-stone-900 mt-0.5">
                  {selectedShop.name_en}
                </h3>
                <p className="text-xs text-stone-500">
                  {selectedShop.name} · {selectedShop.address}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedShop(null)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center text-stone-500 hover:text-stone-900 rounded-xl"
                aria-label="Close Shop Dossier"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {shopDetailLoading && (
              <p className="text-xs font-mono text-stone-500">
                Querying get_ramen_shop({selectedShop.id})...
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-[#F8F7F4] rounded-xl space-y-1">
                <p className="text-stone-500">Nearest Station (Japan Station Master)</p>
                <p className="font-semibold text-stone-900">{selectedShop.station_name}</p>
                <p className="font-mono text-stone-600">
                  ID: {selectedShop.station_id} · {selectedShop.station_distance_m}m walk
                </p>
              </div>
              <div className="p-3.5 bg-[#F8F7F4] rounded-xl space-y-1">
                <p className="text-stone-500">Coordinates &amp; Municipality</p>
                <p className="font-semibold text-stone-900">
                  {selectedShop.city} ({selectedShop.city_ja}), {selectedShop.pref}
                </p>
                <p className="font-mono text-stone-600">
                  {selectedShop.lat.toFixed(4)}°N, {selectedShop.lng.toFixed(4)}°E
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#F8F7F4] rounded-xl space-y-2 text-xs">
              <p className="font-semibold text-stone-900">
                Tri-State Payment &amp; Ticket Machine (Kenbaiki) Facts
              </p>
              <p className="text-stone-700">{selectedShop.payment.ticket_machine}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2 bg-white rounded-lg border border-stone-200">
                  Cash Only: <strong>{selectedShop.payment.cash_only ? "TRUE" : "FALSE"}</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-200">
                  IC Card: <strong>{selectedShop.payment.ic_card_ok ? "TRUE" : "FALSE"}</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-200">
                  Credit Card: <strong>{selectedShop.payment.card_ok ? "TRUE" : "FALSE"}</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-200">
                  QR Pay: <strong>{selectedShop.payment.qr_pay_ok ? "TRUE" : "FALSE"}</strong>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#F8F7F4] rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900">
                  Freshness Verification Block
                </span>
                <span className="font-mono text-stone-600">
                  data_as_of: {selectedShop.data_as_of}
                </span>
              </div>
              <p className="text-stone-600 font-mono">
                first_seen: {selectedShop.first_seen} · last_seen: {selectedShop.last_seen} · status:{" "}
                <strong>{selectedShop.status}</strong>
              </p>
              {selectedShop.closure_evidence_url && (
                <a
                  href={selectedShop.closure_evidence_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#B93829] underline pt-1"
                >
                  <span>View Web-Verified Closure Evidence</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {selectedShop.status === "active" && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleSaveShop(selectedShop);
                    setSelectedShop(null);
                  }}
                  className="min-h-[42px] px-4 py-2 text-xs font-medium bg-[#B93829] text-white rounded-xl hover:bg-[#9E2E21] transition-colors"
                >
                  {savedShopIds.includes(selectedShop.id)
                    ? "Remove from My Ramen Crawl"
                    : "Save Shop to My Ramen Crawl"}
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedShop(null)}
                className="min-h-[42px] px-4 py-2 text-xs font-medium bg-stone-200 text-stone-800 rounded-xl hover:bg-stone-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
