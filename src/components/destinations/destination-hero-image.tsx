import Image from "next/image";
import { getDestinationPresentation } from "@/lib/destination-presentation";
import { cn } from "@/lib/utils";

export function DestinationHeroImage({
  slug,
  name,
  className,
  priority = false,
  fillHeight = false,
  framed = false,
  surface = "hero",
}: Readonly<{
  slug: string;
  name: string;
  region?: string;
  summary?: string;
  className?: string;
  priority?: boolean;
  fillHeight?: boolean;
  framed?: boolean;
  surface?: "hero" | "card" | "peek";
}>) {
  const presentation = getDestinationPresentation(slug, name);

  if (!presentation) {
    return null;
  }

  const objectPosition =
    surface === "hero" ? presentation.heroPosition : presentation.cardPosition;
  const sizes =
    surface === "hero"
      ? "(max-width: 768px) 100vw, 50vw"
      : surface === "peek"
        ? "(max-width: 768px) 100vw, 420px"
        : "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw";

  return (
    <div
      className={cn(
        "relative rounded-lg",
        fillHeight && "h-full",
        framed
          ? "bg-[radial-gradient(circle_at_18%_18%,rgba(136,86,208,0.08),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(37,93,108,0.07),transparent_24%),linear-gradient(180deg,rgba(253,250,242,0.98),rgba(247,244,238,0.98))] p-5"
          : "overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          framed ? "h-full min-h-[320px] rounded-[1rem] bg-[rgba(26,22,18,0.03)]" : "",
          fillHeight ? "h-full min-h-[320px]" : "aspect-[16/10]",
        )}
      >
        <Image
          src={presentation.heroSrc}
          alt={presentation.heroAlt}
          fill
          priority={priority}
          className={cn("object-cover", framed && "scale-[1.01]")}
          style={{ objectPosition }}
          sizes={sizes}
        />
        {framed ? (
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.02)_38%,rgba(26,22,18,0.1)_100%)]" />
        ) : null}
      </div>
    </div>
  );
}
