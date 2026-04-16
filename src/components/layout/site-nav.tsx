"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
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
    <header className="sticky top-0 z-40 border-b border-white/25 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#18323a,#255d6c_52%,#c56d2a)] text-sm font-bold tracking-[0.18em] text-white">
            OS
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">OpenSeason</p>
            <p className="text-sm text-muted">
              California road trips ranked for right now
            </p>
          </div>
        </Link>

        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({
                    variant: isActive ? "primary" : "secondary",
                    size: "sm",
                  }),
                  "min-w-[88px]",
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
