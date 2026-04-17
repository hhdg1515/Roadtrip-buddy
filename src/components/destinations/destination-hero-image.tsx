import Image from "next/image";
import { getDestinationPresentation } from "@/lib/destination-presentation";
import { cn } from "@/lib/utils";

export function DestinationHeroImage({
  slug,
  name,
  region,
  summary,
  className,
  priority = false,
}: Readonly<{
  slug: string;
  name: string;
  region?: string;
  summary?: string;
  className?: string;
  priority?: boolean;
}>) {
  const presentation = getDestinationPresentation(slug, name);

  if (!presentation) {
    return null;
  }

  return (
    <div className={cn("relative overflow-hidden rounded-[28px] border border-white/35", className)}>
      <div className="relative aspect-[16/10]">
        <Image
          src={presentation.heroSrc}
          alt={presentation.heroAlt}
          fill
          priority={priority}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,22,28,0.02),rgba(9,22,28,0.68))]" />
        <div className="absolute inset-x-0 bottom-0 space-y-2 p-5 text-white">
          {region ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
              {region}
            </p>
          ) : null}
          <h3 className="display-title text-3xl font-semibold leading-[0.98]">{name}</h3>
          {summary ? <p className="max-w-2xl text-sm leading-6 text-white/84">{summary}</p> : null}
        </div>
      </div>
    </div>
  );
}
