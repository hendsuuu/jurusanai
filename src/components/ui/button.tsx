import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B5320]/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[#4B5320] text-white hover:bg-[#3A4327] shadow-[0_8px_20px_rgba(75,83,32,0.24)] hover:shadow-[0_12px_28px_rgba(75,83,32,0.32)]",
        secondary:
          "bg-[#EDEBD4] text-[#2A311A] border border-[#CDD2A8] hover:bg-[#CDD2A8]",
        ghost: "text-[#57604A] hover:bg-[#EDEBD4] hover:text-[#4B5320]",
        outline:
          "border border-[#DDD9BD] bg-transparent text-[#2A311A] hover:bg-[#F6F4E9] hover:border-[#CDD2A8]",
        danger:
          "bg-[#DC2626] text-white hover:bg-[#B91C1C]",
        link: "text-[#4B5320] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-9 rounded-[8px] px-3 text-sm",
        md: "h-11 rounded-[12px] px-5 text-[15px]",
        lg: "h-[52px] rounded-[12px] px-7 text-base",
        icon: "h-10 w-10 rounded-[8px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span
            aria-hidden
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
