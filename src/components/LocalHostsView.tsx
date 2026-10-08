import React, { useState } from "react";
import { LOCAL_HOST_PARTNERS, LocalHostPartner } from "../data/travelData";
import { SafeImage } from "./SafeImage";
import { MessageCircle, Heart, Send, CheckCircle2, Building2 } from "lucide-react";

export const LocalHostsView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedTipByHost, setSelectedTipByHost] = useState<Record<string, number>>({
    "host-kenji-kyoto": 30,
    "host-soojin-seoul": 25,
    "host-minjae-jeju": 25,
  });
  const [activeChannelModal, setActiveChannelModal] = useState<{
    host: LocalHostPartner;
    channel: "WhatsApp" | "Telegram" | "WeChat";
  } | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sentConfirmation, setSentConfirmation] = useState<string | null>(null);

  // Direct Traveler Feedback Loop state
  const [feedbackHostId, setFeedbackHostId] = useState("host-kenji-kyoto");
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittedReviews, setSubmittedReviews] = useState<
    { id: string; hostName: string; traveler: string; comment: string; date: string }[]
  >([]);

  // Corporate Incentive Inquiry state
  const [corpCompany, setCorpCompany] = useState("");
  const [corpEmail, setCorpEmail] = useState("");
  const [corpGroupSize, setCorpGroupSize] = useState("10–20 Executives");
  const [corpSubmitted, setCorpSubmitted] = useState(false);

  const filteredHosts =
    selectedCategory === "ALL"
      ? LOCAL_HOST_PARTNERS
      : LOCAL_HOST_PARTNERS.filter((h) => h.partnerCategory === selectedCategory);

  const handleOpenChannel = (host: LocalHostPartner, channel: "WhatsApp" | "Telegram" | "WeChat") => {
    const tip = selectedTipByHost[host.id] ?? 20;
    setMessageText(
      `Hello ${host.name}, I would love to inquire about your "${host.signatureSession}" in ${host.city}. (Includes $${host.referenceFeeUsd} session fee + $${tip} host gratitude pledge).`
    );
    setSentConfirmation(null);
    setActiveChannelModal({ host, channel });
  };

  const handleDispatchMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChannelModal) return;
    setSentConfirmation(
      `Direct ${activeChannelModal.channel} dispatch queued for ${activeChannelModal.host.name}. Average local host response time: under 25 minutes.`
    );
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackName.trim() || !feedbackComment.trim()) return;
    const hostObj = LOCAL_HOST_PARTNERS.find((h) => h.id === feedbackHostId);
    setSubmittedReviews((prev) => [
      {
        id: String(Date.now()),
        hostName: hostObj?.name || "Local Host",
        traveler: feedbackName.trim(),
        comment: feedbackComment.trim(),
        date: "Just now · Verified Traveller Feedback",
      },
      ...prev,
    ]);
    setFeedbackName("");
    setFeedbackComment("");
  };

  const handleCorpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!corpCompany.trim() || !corpEmail.trim()) return;
    setCorpSubmitted(true);
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="text-xs text-stone-500 mb-2">
            Key Partners &amp; Channels · Local Ground-Up Hobby Groups, Specialist Guides &amp; Fun Local Individuals
          </p>
          <h1 className="font-serif-display text-3xl md:text-4xl font-semibold text-stone-900 tracking-tight">
            Insiders Who Open Private Doors in Korea &amp; Japan
          </h1>
          <p className="mt-3 text-sm md:text-base text-stone-600 max-w-2xl leading-relaxed">
            Connect directly via WhatsApp, WeChat, or Telegram with vetted local hobby collectives and specialist guides. Transparent fees with optional gratitude pledges going 100% to your local host.
          </p>
        </div>

        {/* Interactive Filter Control */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-200/70 rounded-xl self-start">
          {[
            { id: "ALL", label: "All Partners" },
            { id: "Local Ground-Up Hobby Group", label: "Hobby Groups" },
            { id: "Fun Local Individual", label: "Local Individuals" },
            { id: "Specialized Tour Guide", label: "Specialist Guides" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`min-h-[40px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === tab.id
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Host Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredHosts.map((host) => {
          const tipAmount = selectedTipByHost[host.id] ?? 25;
          const platformCommission = Math.round(host.referenceFeeUsd * 0.12);
          const totalEstimate = host.referenceFeeUsd + platformCommission + tipAmount;

          return (
            <article
              key={host.id}
              className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-52 overflow-hidden">
                  <SafeImage
                    src={host.avatarImage}
                    alt={`${host.name} — ${host.roleTitle}`}
                    fallbackTitle={host.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 text-white">
                    <p className="text-xs text-stone-200">
                      {host.city}, {host.country} · {host.partnerCategory}
                    </p>
                    <h2 className="font-serif-display text-2xl font-semibold mt-0.5">
                      {host.name}
                    </h2>
                    <p className="text-xs text-stone-300">{host.roleTitle}</p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="text-xs text-stone-500 flex flex-wrap items-center gap-1.5">
                    <span>Languages: {host.languages.join(", ")}</span>
                    <span aria-hidden="true">·</span>
                    <span>{host.groupCapacity}</span>
                  </div>

                  <p className="text-sm text-stone-700 leading-relaxed">{host.bio}</p>

                  <div className="pt-2 border-t border-stone-100 space-y-1">
                    <p className="text-xs text-stone-500">Signature Uncrowded Session</p>
                    <p className="text-sm font-medium text-stone-900">{host.signatureSession}</p>
                  </div>

                  {/* Attributable Testimonial adjacent to host */}
                  <blockquote className="p-3.5 bg-[#F8F7F4] rounded-xl text-xs text-stone-600 space-y-1">
                    <p className="italic">&ldquo;{host.recentTravelerNote.quote}&rdquo;</p>
                    <footer className="text-stone-500 font-medium not-italic pt-1">
                      — {host.recentTravelerNote.traveler} · {host.recentTravelerNote.context}
                    </footer>
                  </blockquote>

                  {/* Revenue Streams: Commission + Tips/Gratitude Selector */}
                  <div className="pt-3 border-t border-stone-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-600">Host Session Fee (Simulated Ref)</span>
                      <span className="font-mono tabular-nums text-stone-900">${host.referenceFeeUsd}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-600">Platform Curation Commission (12%)</span>
                      <span className="font-mono tabular-nums text-stone-900">${platformCommission}</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-stone-800 flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-[#B93829]" />
                          <span>Host Gratitude / Tip (100% to Host)</span>
                        </span>
                        <span className="font-mono tabular-nums font-medium text-[#B93829]">
                          +${tipAmount}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {[0, ...host.suggestedGratitudeUsd].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() =>
                              setSelectedTipByHost((prev) => ({ ...prev, [host.id]: amt }))
                            }
                            className={`flex-1 min-h-[38px] py-1 text-xs font-mono tabular-nums rounded-lg border transition-colors ${
                              tipAmount === amt
                                ? "bg-stone-900 text-white border-stone-900"
                                : "bg-[#F8F7F4] text-stone-700 border-stone-200 hover:border-stone-400"
                            }`}
                          >
                            {amt === 0 ? "None" : `+$${amt}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/80 text-sm font-semibold text-stone-900">
                      <span>Estimated Total</span>
                      <span className="font-mono tabular-nums">${totalEstimate} USD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Communication Channels: WhatsApp / WeChat / Telegram */}
              <div className="px-6 pb-6 pt-2 space-y-2">
                <p className="text-xs text-stone-500">
                  Direct Host Communication Channels (Miro Customer Relationship)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(["WhatsApp", "WeChat", "Telegram"] as const).map((channel) => (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => handleOpenChannel(host, channel)}
                      className="min-h-[44px] px-2.5 py-2 text-xs font-medium text-stone-800 bg-[#F8F7F4] hover:bg-stone-900 hover:text-white border border-stone-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{channel}</span>
                    </button>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Direct Traveler Feedback & Corporate Incentives Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Direct Feedback Loop */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 space-y-5">
          <div>
            <p className="text-xs text-stone-500">Customer Relationships · Direct Feedback Loop</p>
            <h2 className="font-serif-display text-2xl font-semibold text-stone-900 mt-1">
              Share Direct Traveller Feedback &amp; Crowd Reports
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Our curation stays uncrowded because returning travellers verify crowd levels and host quality directly after each trip.
            </p>
          </div>

          <form onSubmit={handleFeedbackSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="fb-host" className="block text-xs font-medium text-stone-700 mb-1">
                  Select Host / Experience
                </label>
                <select
                  id="fb-host"
                  value={feedbackHostId}
                  onChange={(e) => setFeedbackHostId(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 text-xs bg-[#F8F7F4] border border-stone-300 rounded-xl"
                >
                  {LOCAL_HOST_PARTNERS.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.city})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="fb-name" className="block text-xs font-medium text-stone-700 mb-1">
                  Your Name &amp; City
                </label>
                <input
                  id="fb-name"
                  type="text"
                  required
                  value={feedbackName}
                  onChange={(e) => setFeedbackName(e.target.value)}
                  placeholder="e.g., Rachel L. · London"
                  className="w-full min-h-[44px] px-3 py-2 text-xs bg-[#F8F7F4] border border-stone-300 rounded-xl"
                />
              </div>
            </div>
            <div>
              <label htmlFor="fb-comment" className="block text-xs font-medium text-stone-700 mb-1">
                Feedback on Crowd Avoidance &amp; Local Experience
              </label>
              <textarea
                id="fb-comment"
                rows={2}
                required
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="How was the after-hours access or local hobby group session?"
                className="w-full p-3 text-xs bg-[#F8F7F4] border border-stone-300 rounded-xl"
              />
            </div>
            <button
              type="submit"
              className="min-h-[44px] px-4 py-2 text-xs font-medium bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors whitespace-nowrap"
            >
              Post Verified Feedback
            </button>
          </form>

          {submittedReviews.length > 0 && (
            <div className="space-y-2.5 pt-3 border-t border-stone-100">
              {submittedReviews.map((rev) => (
                <div key={rev.id} className="p-3 bg-[#F8F7F4] rounded-xl text-xs space-y-1">
                  <p className="text-stone-500">
                    For <strong className="text-stone-800">{rev.hostName}</strong> · {rev.date}
                  </p>
                  <p className="text-stone-800">&ldquo;{rev.comment}&rdquo;</p>
                  <p className="text-stone-500">— {rev.traveler}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Channels: Corporate Incentives & Sponsored Artisan Partner */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-stone-500">Miro Channels · Corporate Incentives &amp; Private Retreats</p>
              <h2 className="font-serif-display text-2xl font-semibold text-stone-900 mt-1">
                Corporate Incentive &amp; Executive Retreat Concierge
              </h2>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Charter entire heritage ryokans in Nagano, after-hours museum wings in Seoul, or private guild workshops for high-performing leadership teams.
              </p>
            </div>

            {corpSubmitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Corporate Retreat Dossier Requested for {corpCompany}</p>
                  <p className="mt-0.5">
                    Our Korea &amp; Japan specialist agency desk will respond to {corpEmail} with private charter windows and group routing options.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCorpSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="corp-name" className="block text-xs font-medium text-stone-700 mb-1">
                      Organization Name
                    </label>
                    <input
                      id="corp-name"
                      type="text"
                      required
                      value={corpCompany}
                      onChange={(e) => setCorpCompany(e.target.value)}
                      placeholder="e.g., Meridian Partners"
                      className="w-full min-h-[44px] px-3 py-2 text-xs bg-[#F8F7F4] border border-stone-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label htmlFor="corp-email" className="block text-xs font-medium text-stone-700 mb-1">
                      Work Email
                    </label>
                    <input
                      id="corp-email"
                      type="email"
                      required
                      value={corpEmail}
                      onChange={(e) => setCorpEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full min-h-[44px] px-3 py-2 text-xs bg-[#F8F7F4] border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                  <div className="flex-1">
                    <label htmlFor="corp-size" className="block text-xs font-medium text-stone-700 mb-1">
                      Cohort Size &amp; Region
                    </label>
                    <select
                      id="corp-size"
                      value={corpGroupSize}
                      onChange={(e) => setCorpGroupSize(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 text-xs bg-[#F8F7F4] border border-stone-300 rounded-xl"
                    >
                      <option value="8–15 Executives · Kyoto Private Charter">8–15 Executives · Kyoto Private Charter</option>
                      <option value="15–30 Incentive Winners · Seoul & Jeju">15–30 Incentive Winners · Seoul &amp; Jeju</option>
                      <option value="Custom Board Retreat · Nagano Ryokan Buyout">Custom Board Retreat · Nagano Ryokan Buyout</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="min-h-[44px] px-4 py-2 text-xs font-medium bg-[#1E3A5F] text-white rounded-xl hover:bg-[#162B47] transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Request Corporate Brief</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Revenue Stream: Clearly Labeled Partner Artisan Spotlight (Advertisement) */}
          <div className="p-4 bg-[#F8F7F4] border border-stone-200/80 rounded-xl space-y-1">
            <p className="text-[11px] text-stone-500">
              Sponsored Heritage Partner · Miro Revenue Stream: Curated Advertisement
            </p>
            <p className="text-xs font-semibold text-stone-900">
              Hosoo Nishijin Textile Salon (Kyoto) &amp; Osulloc Volcanic Tea House (Jeju)
            </p>
            <p className="text-xs text-stone-600">
              Complimentary private tasting and tax-free courier shipping to your hotel for UraMichi itinerary holders.
            </p>
          </div>
        </div>
      </div>

      {/* Direct Channel Dispatch Modal */}
      {activeChannelModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-3">
              <div>
                <p className="text-xs text-stone-500">
                  Direct {activeChannelModal.channel} Concierge Bridge
                </p>
                <h3 className="font-serif-display text-2xl font-semibold text-stone-900">
                  Message {activeChannelModal.host.name}
                </h3>
                <p className="text-xs font-mono text-stone-500 mt-0.5">
                  Handle:{" "}
                  {activeChannelModal.channel === "WhatsApp"
                    ? activeChannelModal.host.channels.whatsapp
                    : activeChannelModal.channel === "Telegram"
                    ? activeChannelModal.host.channels.telegram
                    : activeChannelModal.host.channels.wechatId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveChannelModal(null)}
                className="min-h-[40px] px-3 text-xs text-stone-500 hover:text-stone-900"
              >
                Close
              </button>
            </div>

            {sentConfirmation ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-2">
                <p className="font-semibold">{sentConfirmation}</p>
                <p>
                  You can also copy the host handle above directly into your {activeChannelModal.channel} app.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDispatchMessage} className="space-y-4">
                <div>
                  <label htmlFor="channel-msg" className="block text-xs font-medium text-stone-700 mb-1">
                    Your Direct Message &amp; Preferred Dates
                  </label>
                  <textarea
                    id="channel-msg"
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full p-3 text-sm bg-[#F8F7F4] border border-stone-300 rounded-xl text-stone-900"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveChannelModal(null)}
                    className="min-h-[44px] px-4 py-2 text-xs font-medium text-stone-600 border border-stone-200 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="min-h-[44px] px-5 py-2 text-xs font-medium bg-[#1E3A5F] text-white rounded-xl hover:bg-[#162B47] flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send via {activeChannelModal.channel}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
