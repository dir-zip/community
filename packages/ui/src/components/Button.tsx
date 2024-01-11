import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "../utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded text-xs font-medium disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-emerald-900/40 shadow-inner border border-border-subtle saturate-150 hover:saturate-100",
        outline: "bg-transparent text-primary-foreground border border-primary-foreground shadow-emerald-900/40 shadow-inner hover:bg-primary",
        destructive: "bg-red-700 text-primary-foreground border border-red-500 shadow-red-900/40 shadow-inner saturate-150 hover:saturate-100"
      },
      size: {
        default: "py-2 px-4"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> { }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
