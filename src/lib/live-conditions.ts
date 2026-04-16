import type { DestinationAlert, LiveWeatherSnapshot } from "@/lib/data/openseason";

export function formatUpdatedAt(updatedAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(updatedAt));
}

export function formatAlertDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function getAlertTone(severity: string): "default" | "warm" | "danger" | "soft" {
  const normalized = severity.toLowerCase();

  if (normalized.includes("extreme") || normalized.includes("severe")) {
    return "danger";
  }

  if (normalized.includes("moderate")) {
    return "warm";
  }

  if (normalized.includes("minor")) {
    return "soft";
  }

  return "default";
}

export function getPrimaryAlert(alerts: DestinationAlert[] | undefined) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return [...alerts].sort((left, right) => alertSeverityWeight(right) - alertSeverityWeight(left))[0];
}

export function formatWeatherMetrics(weather: LiveWeatherSnapshot | null | undefined) {
  if (!weather) {
    return [];
  }

  const metrics: string[] = [];

  if (weather.highTemp != null && weather.lowTemp != null) {
    metrics.push(`${weather.highTemp}F / ${weather.lowTemp}F`);
  } else if (weather.highTemp != null) {
    metrics.push(`High ${weather.highTemp}F`);
  } else if (weather.lowTemp != null) {
    metrics.push(`Low ${weather.lowTemp}F`);
  }

  if (weather.precipitationProbability != null) {
    metrics.push(`${weather.precipitationProbability}% precip`);
  }

  if (weather.windSpeed != null) {
    metrics.push(`${weather.windSpeed} mph wind`);
  }

  if ((weather.snowRisk ?? 0) >= 40) {
    metrics.push(`${weather.snowRisk}% snow risk`);
  }

  if ((weather.heatRisk ?? 0) >= 40) {
    metrics.push(`${weather.heatRisk}% heat risk`);
  }

  return metrics;
}

function alertSeverityWeight(alert: DestinationAlert) {
  const normalized = alert.severity.toLowerCase();

  if (normalized.includes("extreme")) {
    return 4;
  }

  if (normalized.includes("severe")) {
    return 3;
  }

  if (normalized.includes("moderate")) {
    return 2;
  }

  if (normalized.includes("minor")) {
    return 1;
  }

  return 0;
}
