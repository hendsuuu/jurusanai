import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        neutral: "bg-[#F6F4E9] text-[#57604A] border border-[#DDD9BD]",
        brand: "bg-[#2A311A] text-white",
        blue: "bg-[#EDEBD4] text-[#4B5320] border border-[#CDD2A8]",
        success: "bg-[#ECFDF5] text-[#16A34A] border border-[#A7F3D0]",
        warning: "bg-[#FFFBEB] text-[#B58E3C] border border-[#FDE68A]",
        danger: "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]",
        info: "bg-[#EDEBD4] text-[#4B5320] border border-[#CDD2A8]",
        outline: "border border-[#DDD9BD] text-[#57604A]",
      },
    },
    defaultVariants: {
      variant: "blue",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
