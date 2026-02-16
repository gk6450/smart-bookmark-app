import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl border text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-cyan-300/35 bg-cyan-300/20 text-cyan-50 hover:-translate-y-0.5 hover:bg-cyan-300/30 hover:shadow-[0_10px_30px_-14px_rgba(34,211,238,0.85)]",
        secondary:
          "border-white/20 bg-white/10 text-slate-100 hover:-translate-y-0.5 hover:bg-white/15",
        ghost: "border-transparent bg-transparent text-slate-200 hover:bg-white/10",
        danger:
          "border-rose-300/35 bg-rose-300/15 text-rose-100 hover:-translate-y-0.5 hover:bg-rose-300/25",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
