import type { Destination, DestinationAlert, LiveWeatherSnapshot } from "@/lib/data/openseason";

export type DecisionLevel = "block" | "warn" | "inform";
export type DecisionSource = "route" | "park" | "weather" | "fire" | "general";

export type DecisionSignal = {
  level: DecisionLevel;
  source: DecisionSource;
  label: string;
  detail: string;
};

export type DecisionStatus = {
  level: DecisionLevel;
  label: string;
  headline: string;
  guidance: string;
  signals: DecisionSignal[];
};

const hardBlockPattern =
  /\bevacuat(?:ion)? order\b|\bclosure order\b|\bfull closure\b|\broad closed\b|\bclosed between\b|\bclosed to all\b|\bpark closed\b|\barea closed\b|\bforest closed\b|\bentrance closed\b|\baccess closed\b|\bbridge closed\b|\bwashout\b|\bdo not travel\b|\bno public access\b/;
const routeWarningPattern =
  /\bchain control\b|\blane closure\b|\bone-way traffic\b|\balternating traffic\b|\btraffic control\b|\bdetour\b|\broad work\b|\broad access\b/;
const fireWarningPattern =
  /\bred flag warning\b|\bfire weather\b|\bsmoke\b|\bfire\b|\bhotshot\b|\bcontainment\b/;
const weatherWarningPattern =
  /\bhigh wind warning\b|\bwind advisory\b|\bflash flood warning\b|\bflood warning\b|\bwinter storm warning\b|\bblizzard warning\b|\bexcessive heat warning\b|\bheat advisory\b|\bfreeze warning\b|\bsnow\b|\bice\b/;
const parkClosurePattern =
  /\bpark closure\b|\btrail closure\b|\bcampground closure\b|\bvisitor center closure\b|\baccess restriction\b/;

function normalizeText(alert: DestinationAlert) {
  return `${alert.alertType} ${alert.title} ${alert.description ?? ""}`.toLowerCase();
}

function inferDecisionSource(alert: DestinationAlert, text: string): DecisionSource {
  if (
    alert.source === "caltrans" ||
    /\bhighway\b|\broute\b|\broad\b|\blane\b|\bchain control\b|\bdetour\b/.test(text)
  ) {
    return "route";
  }

  if (/\bfire\b|\bsmoke\b|\bevacuat/.test(text)) {
    return "fire";
  }

  if (
    alert.source === "nps" ||
    alert.source === "usfs" ||
    /\bpark\b|\btrail\b|\bcampground\b|\bentrance\b|\bforest\b/.test(text)
  ) {
    return "park";
  }

  if (alert.source === "nws") {
    return "weather";
  }

  return "general";
}

function classifyAlert(alert: DestinationAlert): DecisionSignal {
  const text = normalizeText(alert);
  const source = inferDecisionSource(alert, text);
  const severity = alert.severity.toLowerCase();

  if (
    hardBlockPattern.test(text) ||
    (/evacuat/.test(text) && /\border\b/.test(text)) ||
    (source === "route" && /\bclosed\b/.test(text) && !/\blane closure\b/.test(text))
  ) {
    return {
      level: "block",
      source,
      label:
        source === "route"
          ? "Hard access block is active"
          : source === "fire"
            ? "Fire closure or evacuation signal is active"
            : "Official closure is active",
      detail: alert.title,
    };
  }

  if (
    routeWarningPattern.test(text) ||
    fireWarningPattern.test(text) ||
    weatherWarningPattern.test(text) ||
    parkClosurePattern.test(text) ||
    severity.includes("severe") ||
    severity.includes("extreme") ||
    severity.includes("moderate")
  ) {
    return {
      level: "warn",
      source,
      label:
        source === "route"
          ? "Route friction is active"
          : source === "fire"
            ? "Fire or smoke risk is active"
            : source === "weather"
              ? "Weather warning is active"
              : "Trip-shaping advisory is active",
      detail: alert.title,
    };
  }

  return {
    level: "inform",
    source,
    label: "Current advisory is being tracked",
    detail: alert.title,
  };
}

function classifyWeather(weather: LiveWeatherSnapshot | null | undefined): DecisionSignal[] {
  if (!weather) {
    return [
      {
        level: "inform",
        source: "weather",
        label: "Live weather is not available yet",
        detail: "The decision is leaning more heavily on the seeded destination guidance.",
      },
    ];
  }

  const signals: DecisionSignal[] = [];

  if ((weather.heatRisk ?? 0) >= 80) {
    signals.push({
      level: "warn",
      source: "weather",
      label: "Heat exposure is becoming trip-shaping",
      detail: `Heat risk is ${weather.heatRisk}/100.`,
    });
  } else if ((weather.heatRisk ?? 0) >= 55) {
    signals.push({
      level: "inform",
      source: "weather",
      label: "Heat needs pacing awareness",
      detail: `Heat risk is ${weather.heatRisk}/100.`,
    });
  }

  if ((weather.snowRisk ?? 0) >= 70) {
    signals.push({
      level: "warn",
      source: "weather",
      label: "Snow or freeze exposure is still shaping access",
      detail: `Snow risk is ${weather.snowRisk}/100.`,
    });
  } else if ((weather.snowRisk ?? 0) >= 45) {
    signals.push({
      level: "inform",
      source: "weather",
      label: "Higher terrain still needs a snow check",
      detail: `Snow risk is ${weather.snowRisk}/100.`,
    });
  }

  if ((weather.windSpeed ?? 0) >= 30) {
    signals.push({
      level: "warn",
      source: "weather",
      label: "Wind is strong enough to change exposed stops",
      detail: `Peak wind is ${weather.windSpeed} mph.`,
    });
  } else if ((weather.windSpeed ?? 0) >= 20) {
    signals.push({
      level: "inform",
      source: "weather",
      label: "Wind should stay in the execution check",
      detail: `Peak wind is ${weather.windSpeed} mph.`,
    });
  }

  if ((weather.precipitationProbability ?? 0) >= 70) {
    signals.push({
      level: "warn",
      source: "weather",
      label: "Wet-weather exposure is high enough to shape the day",
      detail: `Precipitation risk is ${weather.precipitationProbability}%.`,
    });
  } else if ((weather.precipitationProbability ?? 0) >= 50) {
    signals.push({
      level: "inform",
      source: "weather",
      label: "Rain is part of the trip picture",
      detail: `Precipitation risk is ${weather.precipitationProbability}%.`,
    });
  }

  if (signals.length === 0) {
    signals.push({
      level: "inform",
      source: "weather",
      label: "No weather-based blockers are being tracked",
      detail: `Forecast is roughly ${weather.highTemp ?? "?"}F / ${weather.lowTemp ?? "?"}F with ${weather.windSpeed ?? 0} mph wind.`,
    });
  }

  return signals;
}

function decisionPriority(level: DecisionLevel) {
  switch (level) {
    case "block":
      return 3;
    case "warn":
      return 2;
    case "inform":
    default:
      return 1;
  }
}

function summarizeDecision(level: DecisionLevel, leadSignal: DecisionSignal): Pick<DecisionStatus, "label" | "headline" | "guidance"> {
  if (level === "block") {
    return {
      label: "Block",
      headline: leadSignal.label,
      guidance:
        "A hard access constraint is being tracked. Do not treat this as a normal go decision until the closure clears or you re-scope the trip.",
    };
  }

  if (level === "warn") {
    return {
      label: "Warn",
      headline: leadSignal.label,
      guidance:
        "The trip can still work, but active risk signals should change route choice, timing, or fallback assumptions.",
    };
  }

  return {
    label: "Inform",
    headline: "No hard blockers are being tracked right now",
    guidance:
      "Treat this as an execution check rather than a stop sign. Conditions still matter, but nothing currently reads like a hard no-go input.",
    };
}

export function getDecisionStatus(
  alerts: DestinationAlert[] | undefined,
  weather: LiveWeatherSnapshot | null | undefined,
): DecisionStatus {
  const alertSignals = (alerts ?? []).map(classifyAlert);
  const weatherSignals = classifyWeather(weather);
  const signals = [...alertSignals, ...weatherSignals].sort(
    (left, right) => decisionPriority(right.level) - decisionPriority(left.level),
  );
  const leadSignal =
    signals[0] ??
    ({
      level: "inform",
      source: "general",
      label: "No hard blockers are being tracked right now",
      detail: "Live conditions are quiet enough that the trip comes down to preference and execution.",
    } satisfies DecisionSignal);
  const level = leadSignal.level;
  const summary = summarizeDecision(level, leadSignal);

  return {
    level,
    ...summary,
    signals,
  };
}

export function getDestinationDecisionStatus(
  destination: Pick<Destination, "activeAlerts" | "liveWeather">,
) {
  return getDecisionStatus(destination.activeAlerts, destination.liveWeather);
}
