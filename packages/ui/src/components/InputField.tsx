import React, { forwardRef } from "react";

export interface TextFieldProps
  extends React.PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string;
  label?: string;
  type?: "text" | "password" | "email" | "number";
  icon?: React.ReactNode; // Add a prop for the icon
}

export const InputField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, name, icon, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1 w-full">
        <label className="text-sm font-medium leading-none flex space-y-2 flex-col">
          {label ? <span>{label}</span> : null}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              {icon}
            </div>
            <input
              ref={ref}
              className="flex h-10 w-full rounded border bg-primary-800 px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 placeholder-primary-400 placeholder:italic"
              {...props}
            />
          </div>
        </label>
      </div>
    );
  }
);
