"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { cn } from "@/lib/utils";
import styles from "./site-nav.module.css";

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
  { href: "/explore", label: "Explore" },
  { href: "/plan", label: "Plan" },
  { href: "/saved", label: "Journal" },
];

export function SiteNav() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
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
      <Link href={`/${suffix}`} aria-label="OpenSeason home" className={styles.logo}>
        OpenSeason
      </Link>

      <nav aria-label="Primary">
        <ul className={styles.links}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={`${item.href}${suffix}`}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(styles.link, isActive && styles.linkActive)}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Link href={`/profile${suffix}`} className={styles.cta}>
              Sign in
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
