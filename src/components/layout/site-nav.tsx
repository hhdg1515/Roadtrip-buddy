"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Now" },
  { href: "/explore", label: "Explore" },
  { href: "/plan", label: "Plan" },
  { href: "/saved", label: "Saved" },
  { href: "/profile", label: "Profile" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <Link href="/" aria-label="OpenSeason home" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">OpenSeason</span>
        </Link>

        <nav aria-label="Primary" className="flex flex-wrap gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "text-ocean"
                    : "text-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
