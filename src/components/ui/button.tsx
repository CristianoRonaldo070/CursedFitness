import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        system:
          "rounded-sm border border-primary bg-primary text-primary-foreground shadow-[0_0_28px_var(--system-glow)] hover:bg-primary/85 hover:shadow-[0_0_38px_var(--system-glow-strong)]",
        systemOutline:
          "rounded-sm border border-primary/55 bg-primary/5 text-primary shadow-[inset_0_0_18px_var(--system-glow-soft)] hover:border-primary hover:bg-primary/12",
        green:
          "rounded-sm border border-emerald-600 bg-emerald-600 text-white shadow-[0_0_24px_rgba(16,185,129,0.25)] hover:bg-emerald-700 hover:shadow-[0_0_32px_rgba(16,185,129,0.4)] dark:border-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-600",
        greenOutline:
          "rounded-sm border border-emerald-600/60 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-500/50 dark:hover:bg-emerald-900/40",
        orange:
          "rounded-sm border border-orange-500 bg-orange-500 text-white shadow-[0_0_24px_rgba(249,115,22,0.25)] hover:bg-orange-600 hover:shadow-[0_0_32px_rgba(249,115,22,0.4)] dark:border-orange-500 dark:bg-orange-500 dark:hover:bg-orange-600",
        orangeOutline:
          "rounded-sm border border-orange-500/60 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:border-orange-500 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-500/50 dark:hover:bg-orange-900/40",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        system: "h-12 rounded-sm px-6 text-xs font-bold uppercase tracking-[0.16em]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
