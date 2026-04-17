import Image from "next/image";
import { getDestinationPresentation } from "@/lib/destination-presentation";
import { cn } from "@/lib/utils";

export function DestinationHeroImage({
  slug,
  name,
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
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      <div className="relative aspect-[16/10]">
        <Image
          src={presentation.heroSrc}
          alt={presentation.heroAlt}
          fill
          priority={priority}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  );
}
