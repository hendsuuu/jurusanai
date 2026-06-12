import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-[12px] border border-[#DDD9BD] bg-white px-4 text-[15px] text-[#2A311A] placeholder:text-[#8A8A72]",
        "transition-all",
        "focus-visible:outline-none focus-visible:border-[#4B5320] focus-visible:ring-[4px] focus-visible:ring-[rgba(75,83,32,0.12)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
