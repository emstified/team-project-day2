import React from "react";
import { RAMEN_PILGRIMAGE_TRAILS, RamenPilgrimageTrail } from "../data/ramenData";
import { SafeImage } from "./SafeImage";
import { MapPin, Train, Banknote, PlusCircle, CheckCircle2 } from "lucide-react";

interface RegionalTrailsViewProps {
  savedShopIds: string[];
  onLoadTrailIntoCrawl: (trail: RamenPilgrimageTrail) => void;
}

export const RegionalTrailsView: React.FC<RegionalTrailsViewProps> = ({
  savedShopIds,
  onLoadTrailIntoCrawl,
}) => {
  return (
    <div className="space-y-10 pb-10">
      <div className="border-b border-stone-200 pb-6">
        <p className="text-xs font-mono text-[#B93829] uppercase tracking-wider">
          Curated Japan Ramen Pilgrimage Routes · Station-to-Station Itineraries
        </p>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-stone-900 mt-1">
          Regional Ramen Crawl Itineraries
        </h1>
        <p className="text-sm sm:text-base text-stone-600 mt-2 max-w-3xl leading-relaxed">
          Each route connects verified ramen shops from the{" "}
          <code className="font-mono text-xs bg-stone-200/70 px-1.5 py-0.5 rounded">
            eng213035/gachi-ramen
          </code>{" "}
          database with exact train station exits, non-peak queueing windows, and cash/IC card preparation.
        </p>
      </div>

      <div className="space-y-8">
        {RAMEN_PILGRIMAGE_TRAILS.map((trail) => {
          const allLoaded = trail.shopIds.every((id) => savedShopIds.includes(id));

          return (
            <article
              key={trail.id}
              className="bg-white border border-stone-200/90 rounded-3xl overflow-hidden shadow-2xs"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-4 relative min-h-[220px]">
                  <SafeImage
                    src={trail.heroImage}
                    alt={trail.title}
                    className="w-full h-full object-cover"
                    fallbackTitle={trail.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                    <p className="text-xs font-mono text-amber-300">{trail.region}</p>
                    <p className="text-sm font-medium mt-0.5">{trail.durationLabel}</p>
                  </div>
                </div>

                <div className="lg:col-span-8 p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-[#B93829]">{trail.brothFocus}</p>
                      <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-stone-900 mt-1">
                        {trail.title}
                      </h2>
                      <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                        {trail.summary}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onLoadTrailIntoCrawl(trail)}
                      className={`min-h-[44px] px-4 py-2.5 text-xs font-medium rounded-xl transition-colors flex items-center gap-2 shrink-0 ${
                        allLoaded
                          ? "bg-emerald-800 text-white"
                          : "bg-[#B93829] hover:bg-[#9E2E21] text-white"
                      }`}
                    >
                      {allLoaded ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Route Loaded in Crawl</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4" />
                          <span>Load {trail.stops.length} Bowls into My Crawl</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Transit & Cash Readiness Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-[#F8F7F4] rounded-xl flex items-start gap-2.5">
                      <Train className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-stone-900">Recommended Rail Pass</p>
                        <p className="text-stone-600 mt-0.5">{trail.bestTransitPass}</p>
                      </div>
                    </div>
                    <div className="p-3.5 bg-[#F8F7F4] rounded-xl flex items-start gap-2.5">
                      <Banknote className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-stone-900">Ticket Machine Cash Note</p>
                        <p className="text-stone-600 mt-0.5">{trail.cashAdvisory}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stop-by-Stop Breakdown */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
                      Stop-by-Stop Ramen Sequence
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {trail.stops.map((stop) => (
                        <div
                          key={stop.shopId}
                          className="p-4 bg-[#F8F7F4] rounded-2xl border border-stone-200/70 space-y-2"
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
                            <span>STOP 0{stop.order}</span>
                            <span>{stop.shopId}</span>
                          </div>
                          <p className="text-xs font-medium text-[#B93829]">{stop.timeSlot}</p>
                          <div>
                            <h3 className="text-sm font-semibold text-stone-900">
                              {stop.shopNameEn}
                            </h3>
                            <p className="text-xs text-stone-500">{stop.shopNameJa}</p>
                          </div>
                          <p className="text-xs text-stone-600 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                            <span>{stop.stationNote}</span>
                          </p>
                          <p className="text-xs text-stone-800 pt-1 border-t border-stone-200/60">
                            <strong>Order:</strong> {stop.whatToOrder}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
