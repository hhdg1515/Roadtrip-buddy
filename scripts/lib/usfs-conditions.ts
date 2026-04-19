export type UsfsConditionsWatchConfig = {
  forestName: string;
  conditionsUrl: string;
  corridorHints?: string[];
  maxAlerts?: number;
};

export type ParsedUsfsConditionsPage = {
  lastUpdated: string | null;
  lines: string[];
};

const conditionSignalPattern =
  /\bclosed\b|\bclosure\b|\bnot passable\b|\bwashed out\b|\bwash out\b|\bnot accessible\b|\bgate remains closed\b|\btravel at your own risk\b|\bcaution\b|\bsnow drift\b|\brough road\b|\bhigh clearance\b|\broad conditions\b|\btrailhead\b|\broad\b|\broute\b|\bgate\b|\bparking\b/i;
const suppressLinePattern =
  /\blast updated\b|\breturn to top\b|\bfor more information\b|\bforest service home\b|\bprimary footer menu\b|\bweather conditions\b|\bfire danger status\b|\balerts and fire danger status\b|\binciweb\b|\bcaltrans quickmap\b/i;
const evergreenRestrictionNoisePattern =
  /\bmussel prohibition\b|\bfood storage\b|\bfood refuse\b|\bfireworks\b|\bexplosives\b|\bwilderness area restrictions?\b|\bcampfire restrictions?\b/i;

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, digits: string) => {
      const code = Number(digits);
      return Number.isFinite(code) ? String.fromCharCode(code) : _;
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, digits: string) => {
      const code = Number.parseInt(digits, 16);
      return Number.isFinite(code) ? String.fromCharCode(code) : _;
    });
}

function htmlToTextLines(html: string) {
  const normalized = html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|li|ul|ol|h1|h2|h3|h4|h5|h6|tr)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n* ")
    .replace(/<\/td>/gi, " ")
    .replace(/<[^>]+>/g, " ");

  return decodeHtml(normalized)
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function parseUsfsConditionsPage(html: string): ParsedUsfsConditionsPage {
  const lines = htmlToTextLines(html);
  const lastUpdatedLine = lines.find((line) => /^Last updated /i.test(line));
  const lastUpdatedText = lastUpdatedLine?.replace(/^Last updated /i, "").trim() ?? null;
  const parsedUpdated = lastUpdatedText ? Date.parse(lastUpdatedText) : Number.NaN;

  return {
    lastUpdated: Number.isNaN(parsedUpdated) ? null : new Date(parsedUpdated).toISOString(),
    lines,
  };
}

function lineMatchesHint(line: string, hints: string[]) {
  const lower = line.toLowerCase();
  return hints.some((hint) => lower.includes(hint.toLowerCase()));
}

export function selectRelevantUsfsConditionLines(
  page: ParsedUsfsConditionsPage,
  watch: UsfsConditionsWatchConfig,
) {
  const hints = watch.corridorHints ?? [];

  return page.lines
    .filter((line) => {
      if (suppressLinePattern.test(line)) {
        return false;
      }

      if (evergreenRestrictionNoisePattern.test(line)) {
        return false;
      }

      if (!conditionSignalPattern.test(line)) {
        return false;
      }

      return hints.length === 0 ? true : lineMatchesHint(line, hints);
    })
    .filter((line, index, values) => values.indexOf(line) === index)
    .slice(0, watch.maxAlerts ?? 4);
}

export function mapUsfsConditionSeverity(line: string) {
  const text = line.toLowerCase();

  if (
    /\bclosed\b|\bclosure\b|\bnot passable\b|\bwashed out\b|\bwash out\b|\bnot accessible\b|\bgate remains closed\b/.test(
      text,
    )
  ) {
    return "Severe";
  }

  if (
    /\bcaution\b|\btravel at your own risk\b|\bsnow drift\b|\brough road\b|\bhigh clearance\b|\broad conditions\b/.test(
      text,
    )
  ) {
    return "Moderate";
  }

  return "Minor";
}
