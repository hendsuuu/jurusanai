import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "narrow" | "default" | "wide" | "full";

export function Container({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  const max =
    variant === "narrow"
      ? "max-w-[880px]"
      : variant === "wide"
        ? "max-w-[1280px]"
        : variant === "full"
          ? "max-w-[1440px]"
          : "max-w-[1120px]";
  return (
    <div
      className={cn("w-full mx-auto px-4 sm:px-6", max, className)}
      {...props}
    />
  );
}
