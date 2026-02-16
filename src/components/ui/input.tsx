import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-400 transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/35",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
