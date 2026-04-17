export function SectionHeading({
  eyebrow,
  title,
  description,
}: Readonly<{
  eyebrow: string;
  title: string;
  description?: string;
}>) {
  return (
    <div className="max-w-3xl space-y-1.5">
      <p className="text-xs text-muted">{eyebrow}</p>
      <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
        {title}
      </h2>
      {description ? (
        <p className="text-sm leading-6 text-muted">{description}</p>
      ) : null}
    </div>
  );
}
