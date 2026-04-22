"use client";

import Link from "next/link";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { DestinationHeroImage } from "@/components/destinations/destination-hero-image";
import type { Destination } from "@/lib/data/openseason";
import { getDestinationDecisionStatus } from "@/lib/decision-layer";
import {
  formatUpdatedAt,
  formatWeatherMetrics,
  getPrimaryAlert,
} from "@/lib/live-conditions";

type Props = Readonly<{
  destination: Destination | null;
  href: string;
  onClose: () => void;
  onPanelEnter: () => void;
  onPanelLeave: () => void;
}>;

export function DestinationPeek({
  destination,
  href,
  onClose,
  onPanelEnter,
  onPanelLeave,
}: Props) {
  useEffect(() => {
    if (!destination) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [destination, onClose]);

  if (!destination || typeof document === "undefined") return null;

  const tags = destination.tags.slice(0, 3);
  const weatherMetrics = formatWeatherMetrics(destination.liveWeather).slice(0, 3);
  const primaryAlert = getPrimaryAlert(destination.activeAlerts);
  const decision = getDestinationDecisionStatus(destination);
  const alertTone = primaryAlert ? toneFromDecisionAndAlert(decision.level) : null;

  return createPortal(
    <>
      <style>{`
        @keyframes peekIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes peekSheetIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        onMouseEnter={onPanelEnter}
        onMouseLeave={onPanelLeave}
        className="peek-panel pointer-events-auto fixed top-[96px] right-6 z-40 hidden w-[340px] overflow-hidden rounded-lg border border-[rgba(26,22,18,0.08)] bg-[#fdfaf2] shadow-[0_8px_32px_rgba(30,22,16,0.12)] lg:block"
        style={{ animation: "peekIn 0.18s ease forwards" }}
      >
        <div className="px-5 pt-4 pb-5">
          <PeekContent
            destination={destination}
            href={href}
            tags={tags}
            weatherMetrics={weatherMetrics}
            primaryAlert={primaryAlert}
            alertTone={alertTone}
          />
        </div>
      </div>

      <div className="pointer-events-auto fixed inset-0 z-50 lg:hidden">
        <button
          type="button"
          aria-label="Close quick view"
          onClick={onClose}
          className="absolute inset-0 bg-[rgba(30,22,16,0.24)]"
        />
        <div
          className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-[#fdfaf2] shadow-[0_-20px_48px_rgba(30,22,16,0.2)]"
          style={{ animation: "peekSheetIn 0.2s ease forwards" }}
        >
          <div className="flex items-center justify-center px-5 pt-3">
            <div className="h-1.5 w-12 rounded-full bg-[rgba(26,22,18,0.12)]" />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-3 rounded-full p-2 text-[#6b5c44]"
              aria-label="Close quick view"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M1 1l10 10M11 1L1 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <div className="max-h-[82vh] overflow-y-auto px-5 pb-6 pt-4">
            <PeekContent
              destination={destination}
              href={href}
              tags={tags}
              weatherMetrics={weatherMetrics}
              primaryAlert={primaryAlert}
              alertTone={alertTone}
            />
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

function PeekContent({
  destination,
  href,
  tags,
  weatherMetrics,
  primaryAlert,
  alertTone,
}: Readonly<{
  destination: Destination;
  href: string;
  tags: string[];
  weatherMetrics: string[];
  primaryAlert: ReturnType<typeof getPrimaryAlert>;
  alertTone: AlertTone | null;
}>) {
  return (
    <>
      <div className="mb-3 overflow-hidden rounded-md">
        <DestinationHeroImage slug={destination.slug} name={destination.name} surface="peek" />
      </div>

      <p
        className="mb-1 text-[10px] uppercase text-[#8a7560]"
        style={{ letterSpacing: "0.18em", fontWeight: 500 }}
      >
        {destination.region}
      </p>
      <h3
        className="display-title mb-3 text-[22px] leading-[1.1] text-[#1e1610]"
        style={{ fontWeight: 500 }}
      >
        {destination.name}
      </h3>

      <p className="mb-4 text-[12.5px] leading-[1.6] text-[#3a2e20]">
        {destination.summary}
      </p>

      {primaryAlert && alertTone ? (
        <div
          className="mb-4 flex items-start gap-2 rounded-md px-3 py-2"
          style={{ backgroundColor: alertTone.bg }}
        >
          <span
            aria-hidden
            className="mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full"
            style={{ backgroundColor: alertTone.dot }}
          />
          <div className="flex-1">
            <p
              className="text-[9.5px] uppercase"
              style={{
                letterSpacing: "0.14em",
                color: alertTone.label,
                fontWeight: 500,
              }}
            >
              {alertTone.labelText}
            </p>
            <p
              className="text-[12px] leading-[1.5]"
              style={{ color: alertTone.text, fontWeight: 500 }}
            >
              {primaryAlert.title}
            </p>
          </div>
        </div>
      ) : null}

      <div className="mb-4 space-y-2 border-t border-[rgba(30,22,16,0.08)] pt-3">
        <PeekSignal label="Why now" text={destination.whyNow} tone="positive" />
        <PeekSignal label="Watch out" text={destination.mainWarning} tone="caution" />
      </div>

      {weatherMetrics.length > 0 ? (
        <div className="mb-4">
          <p
            className="mb-1 text-[9.5px] uppercase text-[#9a8878]"
            style={{ letterSpacing: "0.14em", fontWeight: 500 }}
          >
            Live conditions
          </p>
          <p className="text-[12px] leading-[1.5] text-[#3a2e20]">
            {weatherMetrics.join(" · ")}
          </p>
          {destination.updatedAt ? (
            <p className="mt-1 text-[10px] text-[#9a8878]">
              Updated {formatUpdatedAt(destination.updatedAt)}
            </p>
          ) : null}
        </div>
      ) : null}

      {tags.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-[rgba(26,22,18,0.05)] px-2 py-0.5 text-[10.5px] uppercase text-[#6b5c44]"
              style={{ letterSpacing: "0.1em", fontWeight: 500 }}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <Link
        href={href}
        className="group/peek inline-flex items-center gap-2 text-[11px] uppercase text-[#1e1610] transition"
        style={{ letterSpacing: "0.18em", fontWeight: 500 }}
      >
        <span>Open full brief</span>
        <span
          aria-hidden
          className="block h-px w-[28px] bg-[#8856d0] transition-[width] group-hover/peek:w-[40px]"
        />
      </Link>
    </>
  );
}

function PeekSignal({
  label,
  text,
  tone,
}: Readonly<{
  label: string;
  text: string;
  tone: "positive" | "caution";
}>) {
  const labelColor = tone === "positive" ? "#8a7560" : "#9a8878";
  const textColor = tone === "positive" ? "#3a2e20" : "#6b5c44";

  return (
    <div className="flex gap-2.5">
      <p
        className="w-[64px] shrink-0 text-[9.5px] uppercase"
        style={{ letterSpacing: "0.14em", color: labelColor, fontWeight: 500, lineHeight: "1.6" }}
      >
        {label}
      </p>
      <p className="flex-1 text-[12px] leading-[1.55]" style={{ color: textColor }}>
        {text}
      </p>
    </div>
  );
}

type AlertTone = {
  bg: string;
  dot: string;
  label: string;
  labelText: string;
  text: string;
};

function toneFromDecisionAndAlert(level: "block" | "warn" | "inform"): AlertTone | null {
  if (level === "block") {
    return {
      bg: "rgba(122, 46, 32, 0.08)",
      dot: "#7a2e20",
      label: "#7a2e20",
      labelText: "Hard block",
      text: "#4a1a12",
    };
  }
  if (level === "warn") {
    return {
      bg: "rgba(136, 94, 60, 0.09)",
      dot: "#8a5a32",
      label: "#7a5c3a",
      labelText: "Heads up",
      text: "#3a2818",
    };
  }
  return null;
}
