export function SectionHeading({
  eyebrow,
  title,
  description,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
}>) {
  return (
    <div className="max-w-3xl space-y-3">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="display-title text-3xl font-semibold text-foreground sm:text-4xl">
        {title}
      </h2>
      <p className="text-base leading-7 text-muted sm:text-lg">{description}</p>
    </div>
  );
}
