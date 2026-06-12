import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Brand logo component: icon + "JuruScope" wordmark.
 * Used in navbar, sidebar, login, footer.
 */
export function BrandLogo({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const iconSize = size === "sm" ? 28 : size === "lg" ? 40 : 32;
  const textClass =
    size === "sm"
      ? "text-[15px]"
      : size === "lg"
        ? "text-xl"
        : "text-[17px]";

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/logo.png"
        alt="JuruScope"
        width={iconSize}
        height={iconSize}
        className="shrink-0"
        style={{ width: iconSize, height: iconSize }}
      />
      <span className={cn("font-bold text-[#2A311A] leading-none", textClass)}>
        Juru<span className="text-[#4B5320]">Scope</span>
      </span>
    </span>
  );
}
