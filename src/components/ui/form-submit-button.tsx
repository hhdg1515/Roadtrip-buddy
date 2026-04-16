"use client";

import { useFormStatus } from "react-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FormSubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  size = "md",
  className,
}: Readonly<{
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "ghost" | "surface";
  size?: "sm" | "md" | "lg";
  className?: string;
}>) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        buttonVariants({ variant, size, className }),
        "disabled:cursor-not-allowed disabled:opacity-65",
      )}
    >
      {pending ? pendingLabel ?? "Working..." : children}
    </button>
  );
}
