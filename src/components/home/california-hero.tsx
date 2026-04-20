"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./california-hero.module.css";

type Status = "now" | "spring" | "hot";

type Park = {
  slug: string;
  name: string;
  region: string;
  lon: number;
  lat: number;
  status: Status;
  verdict: string;
  teaser: string;
};

type City = {
  name: string;
  lon: number;
  lat: number;
};

type Props = {
  planQueryString: string;
};

const CA: Array<[number, number]> = [
  [-124.21, 42.01], [-124.32, 41.74], [-124.35, 40.44], [-124.17, 40.0],
  [-124.03, 39.67], [-123.79, 38.87], [-123.46, 38.49], [-123.1, 37.93],
  [-122.88, 37.81], [-122.51, 37.72], [-122.43, 37.42], [-122.28, 37.14],
  [-121.88, 36.6], [-121.93, 36.31], [-121.45, 35.79], [-120.96, 35.38],
  [-120.72, 35.13], [-120.59, 34.97], [-120.46, 34.45], [-120.01, 34.44],
  [-119.72, 34.4], [-119.23, 34.08], [-118.8, 33.88], [-118.4, 33.73],
  [-117.97, 33.6], [-117.52, 33.44], [-117.25, 32.67], [-117.13, 32.53],
  [-114.72, 32.72], [-114.63, 32.82], [-114.55, 33.03], [-114.55, 34.78],
  [-114.62, 35.0], [-115.85, 35.46], [-116.38, 35.63], [-116.93, 36.16],
  [-117.16, 36.34], [-118.2, 36.58], [-118.41, 37.08], [-119.03, 37.46],
  [-119.36, 38.5], [-119.66, 38.83], [-119.99, 39.1], [-120.0, 39.72],
  [-120.0, 41.19], [-121.42, 42.01], [-122.5, 42.01], [-124.21, 42.01],
];

const CITIES: City[] = [
  { name: "San Francisco", lon: -122.419, lat: 37.775 },
  { name: "Los Angeles", lon: -118.243, lat: 34.052 },
  { name: "San Diego", lon: -117.161, lat: 32.715 },
  // Sacramento nudged north to clear the SF→Tahoe tracer line
  { name: "Sacramento", lon: -121.45, lat: 38.88 },
  { name: "San Jose", lon: -121.89, lat: 37.336 },
];

const PARKS: Park[] = [
  {
    slug: "yosemite",
    name: "Yosemite",
    region: "Sierra Nevada",
    lon: -119.538,
    lat: 37.865,
    status: "spring",
    verdict: "Waterfalls at yearly peak — crowds to match",
    teaser: "Book timed-entry permits early. Valley floor trails still have patches of snow.",
  },
  {
    slug: "death-valley",
    name: "Death Valley",
    region: "Mojave Desert",
    lon: -117.5,
    lat: 36.1,
    status: "hot",
    verdict: "Last good window — temps climb past 95°F soon",
    teaser: "Badlands, sand dunes, and rainbow mountains. Go now or wait until November.",
  },
  {
    slug: "channel-islands",
    name: "Channel Islands",
    region: "Santa Barbara Coast",
    // Pushed west so the label doesn't cross the coastline
    lon: -120.4,
    lat: 33.98,
    status: "now",
    verdict: "Boat-only access, sea lions warming up for spring",
    teaser: "California's Galápagos. Day-trip from Ventura — book the ferry early.",
  },
  {
    slug: "tahoe",
    name: "Lake Tahoe",
    region: "Sierra Nevada",
    lon: -120.032,
    lat: 39.096,
    status: "spring",
    verdict: "Late ski season, shoulder-season prices",
    teaser: "Crystalline alpine water and ski-or-hike flexibility. Snow still possible in April.",
  },
  {
    slug: "sequoia",
    name: "Sequoia",
    region: "Sierra Nevada",
    lon: -118.565,
    lat: 36.491,
    status: "spring",
    verdict: "Giant trees in fresh spring air",
    teaser: "Generals Highway open in sections — check conditions. Snow still possible up high.",
  },
  {
    slug: "point-reyes",
    name: "Point Reyes",
    region: "North Bay Coast",
    // Nudged north so it breathes away from SF
    lon: -123.2,
    lat: 38.75,
    status: "now",
    verdict: "Wildflowers on the bluffs, fog by mid-afternoon",
    teaser: "Tomales Bay oysters, the lighthouse stairs, and trails into elk country.",
  },
  {
    slug: "joshua-tree",
    name: "Joshua Tree",
    region: "High Desert",
    // Nudged south so LA→JT tracer doesn't cross the LA label
    lon: -116.0,
    lat: 33.5,
    status: "now",
    verdict: "Warm days, cool nights — prime stargazing",
    teaser: "Bouldering circuits by day, Milky Way by night. Spring is its best season.",
  },
  {
    slug: "redwoods",
    name: "Redwood",
    region: "North Coast",
    lon: -124.004,
    lat: 41.213,
    status: "now",
    verdict: "Old-growth silence, 60°F and misty today",
    teaser: "Drive the Avenue of Giants. The forest dwarfs everything — bring layers and patience.",
  },
  {
    slug: "big-sur-carmel",
    name: "Big Sur",
    region: "Central Coast",
    lon: -121.81,
    lat: 36.27,
    status: "now",
    verdict: "Hwy 1 open — golden hour on Bixby is yours",
    teaser: "Narrow roads reward the patient driver. Book campgrounds weeks out.",
  },
  {
    slug: "big-bear",
    name: "Big Bear Lake",
    region: "Southern Mountains",
    // Nudged north so LA→Big Bear tracer lifts clear of the LA label
    lon: -116.85,
    lat: 34.6,
    status: "spring",
    verdict: "Lifts still spinning weekends, lake warming up",
    teaser: "Ski in the morning, paddle in the afternoon. The shoulder-season trick only locals know.",
  },
  {
    slug: "angeles-crest",
    name: "Angeles Crest",
    region: "Southern Mountains",
    // Pushed north so it breathes away from LA
    lon: -118.0,
    lat: 34.78,
    status: "now",
    verdict: "Clear air above the smog line — an hour from LA",
    teaser: "Drive the Crest Highway, hike Mt. Wilson, escape the city without leaving the county.",
  },
  {
    slug: "mount-shasta",
    name: "Mt. Shasta",
    region: "North State",
    lon: -122.31,
    lat: 41.31,
    status: "spring",
    verdict: "Snowpack melting into pristine rivers",
    teaser: "Volcanic peak towering above pine forest. Emerald alpine lakes, few crowds.",
  },
];

// [cityIndex, parkIndex] — tracers flow city → park
const EDGES: Array<[number, number]> = [
  // SF
  [0, 0], [0, 3], [0, 5], [0, 7],
  // LA
  [1, 2], [1, 4], [1, 6], [1, 1], [1, 9], [1, 10],
  // SD
  [2, 6], [2, 2],
  // Sacramento
  [3, 0], [3, 3], [3, 11],
  // San Jose
  [4, 8], [4, 0],
];

const STATUS_COLOR: Record<Status, string> = {
  now: "#5a8c52",
  spring: "#c8952a",
  hot: "#bf5a2a",
};

const STATUS_LABEL: Record<Status, string> = {
  now: "Great now",
  spring: "Spring conditions",
  hot: "Go soon",
};

const ACCENT = {
  dot: [130, 80, 220] as const,
  trail: [155, 100, 240] as const,
  edge: [180, 140, 255] as const,
};

const CITY_COLOR = [176, 128, 96] as const; // warm taupe — origins, quiet

const LON_MIN = -124.6;
const LON_MAX = -114.1;
const LAT_MIN = 32.4;
const LAT_MAX = 42.15;
const LON_SPAN = LON_MAX - LON_MIN;
const LAT_SPAN = LAT_MAX - LAT_MIN;

const LINE_SPEED = 0.45;
const PULSE_SIZE = 18;
const MAP_OPACITY = 0.9;
const CARD_W = 272;
const CARD_H = 220;

function buildHref(base: string, queryString: string) {
  return queryString ? `${base}?${queryString}` : base;
}

type PinPos = { slug: string; x: number; y: number };

export function CaliforniaHero({ planQueryString }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pinPositions, setPinPositions] = useState<PinPos[]>([]);
  const [selected, setSelected] = useState<Park | null>(null);
  const [cardPos, setCardPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let scale = 0;
    let offX = 0;
    let offY = 0;
    let caPath: Array<{ x: number; y: number }> = [];
    let parkPts: Array<{ x: number; y: number; name: string; slug: string }> = [];
    let cityPts: Array<{ x: number; y: number; name: string }> = [];

    const proj = (lon: number, lat: number) => ({
      x: offX + (lon - LON_MIN) * scale,
      y: offY + (LAT_MAX - lat) * scale,
    });

    const resize = () => {
      const panel = canvas.parentElement;
      if (!panel) return;
      const dpr = window.devicePixelRatio || 1;
      W = panel.clientWidth;
      H = panel.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const PAD = 48;
      const availW = W - PAD * 2;
      const availH = H - PAD * 2;
      scale = Math.min(availW / LON_SPAN, availH / LAT_SPAN);
      offX = PAD + (availW - LON_SPAN * scale) / 2;
      offY = PAD + (availH - LAT_SPAN * scale) / 2;

      caPath = CA.map(([lon, lat]) => proj(lon, lat));
      parkPts = PARKS.map((p) => ({ ...proj(p.lon, p.lat), name: p.name, slug: p.slug }));
      cityPts = CITIES.map((c) => ({ ...proj(c.lon, c.lat), name: c.name }));

      setPinPositions(parkPts.map(({ slug, x, y }) => ({ slug, x, y })));
    };

    // Cycle length > 1 creates an idle gap after each traversal so tracers
    // don't all light up at once. Randomized initial phase + speed per edge
    // further staggers the motion.
    const CYCLE = 2.2;
    const edgeState = EDGES.map(() => ({
      t: Math.random() * CYCLE,
      speed: 0.0007 + Math.random() * 0.0005,
    }));

    let rafId = 0;
    let startTime: number | null = null;

    const draw = (ts: number) => {
      if (startTime === null) startTime = ts;
      const t = (ts - startTime) * 0.001;

      const [dr, dg, db] = ACCENT.dot;
      const [tr2, tg2, tb2] = ACCENT.trail;
      const [er, eg, eb] = ACCENT.edge;
      const [cr, cg, cb] = CITY_COLOR;
      const mapOp = MAP_OPACITY;

      ctx.clearRect(0, 0, W, H);

      // CA outline — thin and light
      ctx.save();
      ctx.beginPath();
      caPath.forEach(({ x, y }, i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.closePath();
      const fillGrd = ctx.createLinearGradient(0, 0, W * 0.6, H);
      fillGrd.addColorStop(0, `rgba(${dr},${dg},${db},${0.045 * mapOp})`);
      fillGrd.addColorStop(1, `rgba(${dr},${dg},${db},${0.02 * mapOp})`);
      ctx.fillStyle = fillGrd;
      ctx.fill();
      ctx.strokeStyle = `rgba(26,22,18,0.22)`;
      ctx.lineWidth = 0.5;
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.restore();

      // Static edge guides
      ctx.save();
      for (const [ci, pi] of EDGES) {
        const pa = cityPts[ci];
        const pb = parkPts[pi];
        if (!pa || !pb) continue;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = `rgba(${er},${eg},${eb},0.15)`;
        ctx.lineWidth = 0.7;
        ctx.setLineDash([3, 7]);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();

      // Animated tracers
      for (let i = 0; i < EDGES.length; i++) {
        const [ci, pi] = EDGES[i];
        const pa = cityPts[ci];
        const pb = parkPts[pi];
        if (!pa || !pb) continue;
        const ep = edgeState[i];
        ep.t = (ep.t + ep.speed * LINE_SPEED) % CYCLE;

        // Idle segment: tracer is dark while t > 1, creating breathing room.
        if (ep.t >= 1) continue;

        const TRAIL = 0.13;
        const t0 = Math.max(0, ep.t - TRAIL);
        const x0 = pa.x + (pb.x - pa.x) * t0;
        const y0 = pa.y + (pb.y - pa.y) * t0;
        const x1 = pa.x + (pb.x - pa.x) * ep.t;
        const y1 = pa.y + (pb.y - pa.y) * ep.t;

        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        grad.addColorStop(0, `rgba(${tr2},${tg2},${tb2},0)`);
        grad.addColorStop(1, `rgba(${tr2},${tg2},${tb2},0.7)`);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.stroke();
      }
      ctx.lineCap = "butt";

      // Park pins — violet pulsing
      for (let i = 0; i < parkPts.length; i++) {
        const { x, y, name } = parkPts[i];
        const pulse = 0.5 + 0.5 * Math.sin(t * 2.0 + i * 1.4);
        const maxR = PULSE_SIZE;

        const grd = ctx.createRadialGradient(x, y, 0, x, y, maxR * pulse);
        grd.addColorStop(0, `rgba(${dr},${dg},${db},${0.18 * pulse})`);
        grd.addColorStop(1, `rgba(${dr},${dg},${db},0)`);
        ctx.beginPath();
        ctx.arc(x, y, maxR * pulse, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 4 + 2 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${dr},${dg},${db},${0.35 * pulse})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${dr},${dg},${db})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fill();

        ctx.font = `500 9px 'DM Sans', sans-serif`;
        ctx.fillStyle = `rgba(26,22,18,${0.55 + 0.2 * pulse})`;
        const lw = ctx.measureText(name.toUpperCase()).width;
        const lx = x > W - 100 ? x - lw - 10 : x + 10;
        ctx.fillText(name.toUpperCase(), lx, y + 4);
      }

      // Cities — quiet static taupe dots
      for (let i = 0; i < cityPts.length; i++) {
        const { x, y, name } = cityPts[i];

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},0.95)`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fill();

        ctx.font = `400 9px 'DM Sans', sans-serif`;
        ctx.fillStyle = `rgba(26,22,18,0.5)`;
        const lw = ctx.measureText(name.toUpperCase()).width;
        const lx = x > W - 120 ? x - lw - 10 : x + 10;
        ctx.fillText(name.toUpperCase(), lx, y + 3);
      }

      rafId = requestAnimationFrame(draw);
    };

    resize();
    rafId = requestAnimationFrame(draw);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handlePinClick = useCallback(
    (park: Park) => {
      if (isMobile) {
        setSelected(park);
        return;
      }
      const panel = panelRef.current;
      const canvas = canvasRef.current;
      if (!panel || !canvas) {
        setSelected(park);
        return;
      }
      const pos = pinPositions.find((p) => p.slug === park.slug);
      if (!pos) {
        setSelected(park);
        return;
      }
      const panelRect = panel.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const margin = 16;
      const pinScreenX = canvasRect.left + pos.x;
      const pinScreenY = canvasRect.top + pos.y;

      let cx = pinScreenX + 20 - panelRect.left;
      let cy = pinScreenY - CARD_H / 2 - panelRect.top;

      if (pinScreenX + 20 + CARD_W > window.innerWidth - margin) {
        cx = pinScreenX - CARD_W - 20 - panelRect.left;
      }
      if (cy < margin) cy = margin;
      if (cy + CARD_H > panelRect.height - margin) cy = panelRect.height - CARD_H - margin;

      setCardPos({ x: cx, y: cy });
      setSelected(park);
    },
    [isMobile, pinPositions],
  );

  const handleClose = useCallback(() => setSelected(null), []);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, handleClose]);

  const planHref = buildHref("/plan", planQueryString);

  return (
    <div ref={panelRef} className={styles.hero}>
      <div className={styles.mapPanel}>
        <canvas ref={canvasRef} className={styles.mapCanvas} />
        <div className={styles.pinOverlay}>
          {PARKS.map((park) => {
            const pos = pinPositions.find((p) => p.slug === park.slug);
            if (!pos) return null;
            return (
              <button
                key={park.slug}
                type="button"
                aria-label={`${park.name}, ${park.region}`}
                className={styles.pinHit}
                style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                onClick={() => handlePinClick(park)}
              />
            );
          })}
        </div>
      </div>

      <div className={styles.textPanel}>
        <div className={styles.eyebrow}>California · Wild Lands</div>
        <h1 className={styles.tagline}>
          Find your
          <br />
          next <em>wild</em>
          <br />
          escape.
        </h1>
        <div className={styles.divider} />
        <p className={styles.sub}>
          National parks, ancient forests, and coastal wilderness — all in one intelligent travel guide.
        </p>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statNum}>9</span>
            <span className={styles.statLabel}>Nat&rsquo;l Parks</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum}>18</span>
            <span className={styles.statLabel}>Nat&rsquo;l Forests</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum}>280+</span>
            <span className={styles.statLabel}>Wild areas</span>
          </div>
        </div>
        <Link href={planHref} className={styles.cta}>
          Start planning
          <span className={styles.ctaLine} />
        </Link>
      </div>

      {selected && !isMobile && (
        <DestCard
          park={selected}
          href={buildHref(`/destinations/${selected.slug}`, planQueryString)}
          style={{ left: cardPos.x, top: cardPos.y }}
          onClose={handleClose}
        />
      )}

      {selected && isMobile && (
        <BottomSheet
          park={selected}
          href={buildHref(`/destinations/${selected.slug}`, planQueryString)}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

type CardProps = {
  park: Park;
  href: string;
  onClose: () => void;
  style?: React.CSSProperties;
};

function DestCard({ park, href, style, onClose }: CardProps) {
  const color = STATUS_COLOR[park.status];
  return (
    <div className={styles.destCard} style={style} role="dialog" aria-label={park.name}>
      <button className={styles.cardClose} onClick={onClose} aria-label="Close">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <div className={styles.cardRegion}>{park.region}</div>
      <div className={styles.cardName}>{park.name}</div>
      <div className={styles.cardVerdict}>
        <div className={styles.verdictDot} style={{ background: color }} />
        <div className={styles.verdictText}>
          <span className={styles.verdictBadge} style={{ color }}>
            {STATUS_LABEL[park.status]} ·
          </span>
          {park.verdict}
        </div>
      </div>
      <div className={styles.cardTeaser}>{park.teaser}</div>
      <Link href={href} className={styles.cardCta}>
        See full plan
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2 7h10M8 3l4 4-4 4"
            stroke="#8856d0"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  );
}

function BottomSheet({ park, href, onClose }: CardProps) {
  const color = STATUS_COLOR[park.status];
  return (
    <>
      <div className={styles.sheetOverlay} onClick={onClose} />
      <div className={styles.bottomSheet} role="dialog" aria-label={park.name}>
        <div className={styles.sheetHandle} />
        <div className={styles.sheetHeader}>
          <div className={styles.cardRegion}>{park.region}</div>
          <button
            className={styles.cardClose}
            style={{ position: "static" }}
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className={styles.sheetCardName}>{park.name}</div>
        <div className={styles.cardVerdict}>
          <div className={styles.verdictDot} style={{ background: color }} />
          <div className={styles.verdictText}>
            <span className={styles.verdictBadge} style={{ color }}>
              {STATUS_LABEL[park.status]} ·
            </span>
            {park.verdict}
          </div>
        </div>
        <div className={styles.sheetTeaser}>{park.teaser}</div>
        <Link href={href} className={`${styles.cardCta} ${styles.sheetCta}`}>
          See full plan
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 7h10M8 3l4 4-4 4"
              stroke="#8856d0"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </>
  );
}
