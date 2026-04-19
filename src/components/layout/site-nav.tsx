"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { cn } from "@/lib/utils";

const PLANNING_KEYS = [
  "origin",
  "tripLength",
  "startDate",
  "drivingTolerance",
  "groupProfile",
  "tripFormat",
  "tripIntensity",
  "lodgingStyle",
  "interestMode",
  "interests",
] as const;

const navItems = [
  { href: "/", label: "Now" },
  { href: "/explore", label: "Explore" },
  { href: "/plan", label: "Plan" },
  { href: "/saved", label: "Saved" },
  { href: "/profile", label: "Profile" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <Suspense fallback={<NavShell suffix="" />}>
          <NavShellWithParams />
        </Suspense>
      </div>
    </header>
  );
}

function NavShellWithParams() {
  const searchParams = useSearchParams();

  const suffix = useMemo(() => {
    const next = new URLSearchParams();
    for (const key of PLANNING_KEYS) {
      const values = searchParams.getAll(key);
      for (const value of values) {
        if (value) {
          next.append(key, value);
        }
      }
    }
    const str = next.toString();
    return str ? `?${str}` : "";
  }, [searchParams]);

  return <NavShell suffix={suffix} />;
}

function NavShell({ suffix }: Readonly<{ suffix: string }>) {
  const pathname = usePathname();

  return (
    <>
      <Link
        href={`/${suffix}`}
        aria-label="OpenSeason home"
        className="flex items-center gap-2"
      >
        <span className="text-lg font-semibold tracking-tight">OpenSeason</span>
      </Link>

      <nav aria-label="Primary" className="flex flex-wrap gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={`${item.href}${suffix}`}
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
    </>
  );
}
