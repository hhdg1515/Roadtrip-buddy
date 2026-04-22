"use client";

import { useEffect, useRef, useState } from "react";

type Option = { id: string; label: string };

type Props = Readonly<{
  name: string;
  options: Option[];
  defaultValue: string;
}>;

export function PlanChipGroup({ name, options, defaultValue }: Props) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const form = inputRef.current?.closest("form");
    if (!form) {
      return;
    }

    form.dispatchEvent(new Event("plan-autosubmit"));
  }, [value]);

  return (
    <>
      <input ref={inputRef} type="hidden" name={name} value={value} />
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setValue(option.id)}
              aria-pressed={selected}
              className={
                selected
                  ? "rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background transition"
                  : "rounded-md bg-[rgba(26,22,18,0.05)] px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-[rgba(26,22,18,0.09)]"
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
