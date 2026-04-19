import { getNpsApiKey, getNwsUserAgent } from "./env";

type FetchJsonOptions = {
  headers?: Record<string, string>;
};

export async function fetchNwsJson<T>(url: string): Promise<T> {
  return fetchJson<T>(url, {
    headers: {
      Accept: "application/geo+json",
      "User-Agent": getNwsUserAgent(),
    },
  });
}

export async function fetchNpsJson<T>(url: string): Promise<T> {
  const apiKey = getNpsApiKey();

  if (!apiKey) {
    throw new Error("Missing NPS_API_KEY.");
  }

  return fetchJson<T>(url, {
    headers: {
      Accept: "application/json",
      "X-Api-Key": apiKey,
    },
  });
}

export async function fetchCaltransJson<T>(url: string): Promise<T> {
  return fetchJson<T>(url, {
    headers: {
      Accept: "application/json",
    },
  });
}

export async function fetchArcgisJson<T>(url: string): Promise<T> {
  return fetchJson<T>(url, {
    headers: {
      Accept: "application/json",
    },
  });
}

export async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "Mozilla/5.0",
    },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText} for ${url}`);
  }

  return response.text();
}

async function fetchJson<T>(url: string, options: FetchJsonOptions): Promise<T> {
  const response = await fetch(url, {
    headers: options.headers,
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText} for ${url}`);
  }

  return (await response.json()) as T;
}
