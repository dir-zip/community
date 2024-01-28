"use client";

import { forwardRef, type PropsWithoutRef } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Switch } from "@dir/ui";
import * as RadioGroup from "@radix-ui/react-radio-group";

export interface SwitchFieldProps
  extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string;
  /** Field label. */
  label: string;
  description?: string;
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>;
  onSwitchChange?: (value: boolean) => void;
}

export const SwitchField = forwardRef<
  HTMLInputElement,
  SwitchFieldProps
>(({ label, description, name, onSwitchChange }, _) => {
  const { control } = useFormContext();

  return (
    <Controller
      render={({ field }) => {
        const { onChange, value } = field;

        return (
          <div className="flex flex-col space-y-2 w-full">
            <label className="text-sm font-medium leading-none flex flex-row items-center">
              <div className="flex flex-col gap-4 w-1/2">
              <span>{label}</span>
              {description ? <span className="text-xs antialiased text-primary-400">{description}</span> : null}
              </div>
              <div className="w-full">
              <Switch checked={value} onCheckedChange={(e) => {
                onChange(e)
                onSwitchChange?.(e)
              }}/>
              </div>
            </label>

           
          </div>
        );
      }}
      control={control}
      name={name}
    />
  );
});
SwitchField.displayName = "SwitchField";
export default SwitchField;
