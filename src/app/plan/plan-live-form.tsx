"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

type Props = Readonly<{
  children: React.ReactNode;
  className?: string;
}>;

export function PlanLiveForm({ children, className }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const syncQuery = useCallback(() => {
    const form = formRef.current;
    if (!form) {
      return;
    }

    const params = new URLSearchParams();
    const formData = new FormData(form);

    for (const [key, value] of formData.entries()) {
      if (typeof value !== "string" || value.length === 0) {
        continue;
      }
      params.append(key, value);
    }

    const nextHref = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextHref, { scroll: false });
  }, [pathname, router]);

  const scheduleSync = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(syncQuery, 120);
  }, [syncQuery]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) {
      return;
    }

    const handleAutoSync = () => {
      scheduleSync();
    };

    form.addEventListener("plan-autosubmit", handleAutoSync as EventListener);

    return () => {
      form.removeEventListener("plan-autosubmit", handleAutoSync as EventListener);
    };
  }, [scheduleSync]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <form
      ref={formRef}
      action="/plan"
      className={className}
      onChange={scheduleSync}
      onSubmit={(event) => {
        event.preventDefault();
        syncQuery();
      }}
    >
      {children}
    </form>
  );
}
