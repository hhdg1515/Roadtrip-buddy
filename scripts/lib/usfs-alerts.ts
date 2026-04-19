export type UsfsWatchConfig = {
  forestName: string;
  alertsUrl: string;
  corridorHints?: string[];
  maxAlerts?: number;
};

export type ParsedUsfsAlert = {
  levelClass: string;
  title: string;
  href: string;
  description: string | null;
  effectiveDate: string | null;
  expirationDate: string | null;
  forestOrder: string | null;
};

const cardPattern = /<li class="usa-card usa-card--flag wfs-alert-flag ([^"]+)">([\s\S]*?)<\/li>/g;
const operationalKeywordPattern =
  /\bclosure|closed|restriction|forest order|road|trail|campground|day use|burn|fire|smoke|access|gate|dispersed camping\b/i;
const forestwidePriorityPattern =
  /\bforest[- ]wide\b|\bnational forest system roads?\b|\bforest order\b|\bfire restrictions?\b|\bfire danger\b|\bcurrent conditions?\b/i;
const adminNoisePattern =
  /\boffice\b|\bvisitor center\b|\bpasses?\b|\bwebsite\b|\bwebpage\b|\bmedia advisory\b|\bmeeting\b|\bemployment\b|\bcareer\b/i;
const evergreenNoisePattern =
  /\bfireworks and explosives\b|\bfood refuse storage\b|\bfood storage\b|\bbear[- ]proof\b/i;

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

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function parseUsfsDate(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/\s+/g, " ").trim();
  const parsed = Date.parse(normalized);

  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

function toAbsoluteUrl(pageUrl: string, href: string) {
  return new URL(href, pageUrl).toString();
}

function extractFieldValue(cardHtml: string, label: string) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = cardHtml.match(
    new RegExp(`<strong>${escapedLabel}:<\\/strong>\\s*([^<]+)`, "i"),
  );

  return match ? stripTags(match[1] ?? "") : null;
}

export function parseUsfsAlertsPage(html: string, pageUrl: string) {
  const alerts: ParsedUsfsAlert[] = [];

  for (const match of html.matchAll(cardPattern)) {
    const levelClass = (match[1] ?? "").trim();
    const cardHtml = match[2] ?? "";
    const anchorMatch = cardHtml.match(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);

    if (!anchorMatch) {
      continue;
    }

    const href = anchorMatch[1];
    const title = stripTags(anchorMatch[2] ?? "");

    if (!title) {
      continue;
    }

    const bodyMatch = cardHtml.match(/<div class="usa-card__body">\s*([\s\S]*?)<\/div>/i);
    const description = bodyMatch ? stripTags(bodyMatch[1] ?? "") : null;
    const effectiveDate = parseUsfsDate(extractFieldValue(cardHtml, "Alert Start Date"));
    const expirationDate = parseUsfsDate(extractFieldValue(cardHtml, "Alert End Date"));
    const forestOrder = extractFieldValue(cardHtml, "Forest Order");

    alerts.push({
      levelClass,
      title,
      href: toAbsoluteUrl(pageUrl, href),
      description,
      effectiveDate,
      expirationDate,
      forestOrder,
    });
  }

  return alerts;
}

function severityWeight(levelClass: string) {
  switch (levelClass) {
    case "critical":
      return 4;
    case "fire-restriction":
      return 3;
    case "caution":
      return 2;
    case "information":
    default:
      return 1;
  }
}

function titleMatchesHint(text: string, hints: string[]) {
  return hints.some((hint) => text.includes(hint.toLowerCase()));
}

export function selectRelevantUsfsAlerts(
  alerts: ParsedUsfsAlert[],
  watch: UsfsWatchConfig,
) {
  const hints = (watch.corridorHints ?? []).map((hint) => hint.toLowerCase());

  return alerts
    .filter((alert) => {
      const text = `${alert.title} ${alert.description ?? ""}`.toLowerCase();
      const hasHint = hints.length === 0 ? true : titleMatchesHint(text, hints);
      const operational = operationalKeywordPattern.test(text);
      const forestwidePriority = forestwidePriorityPattern.test(text);
      const adminNoise = adminNoisePattern.test(text) && !operational;
      const strongLevel = alert.levelClass === "critical" || alert.levelClass === "fire-restriction" || alert.levelClass === "caution";

      if (adminNoise || evergreenNoisePattern.test(text)) {
        return false;
      }

      return hasHint || (forestwidePriority && strongLevel);
    })
    .sort((left, right) => {
      const severityDelta = severityWeight(right.levelClass) - severityWeight(left.levelClass);

      if (severityDelta !== 0) {
        return severityDelta;
      }

      return left.title.localeCompare(right.title);
    });
}

export function mapUsfsSeverity(levelClass: string) {
  switch (levelClass) {
    case "critical":
      return "Severe";
    case "fire-restriction":
    case "caution":
      return "Moderate";
    case "information":
    default:
      return "Minor";
  }
}
