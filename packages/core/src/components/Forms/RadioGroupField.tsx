"use client";

import { forwardRef, type PropsWithoutRef } from "react";
import { useFormContext, Controller } from "react-hook-form";
import * as RadioGroup from "@radix-ui/react-radio-group";

export interface RadioGroupFieldProps
  extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string;
  /** Field label. */
  label: string;
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>;
  options: string[];
}

export const RadioGroupField = forwardRef<
  HTMLInputElement,
  RadioGroupFieldProps
>(({ label, name, options }, _) => {
  const { control } = useFormContext();

  return (
    <Controller
      render={({ field }) => {
        const { onChange, value } = field;

        return (
          <div className="flex flex-col space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>

            <RadioGroup.Root
              value={value}
              onValueChange={(e) => {
                onChange(e);
              }}
              className="flex flex-col space-y-2"
            >
              {options.map((option, i) => {
                return (
                  <div
                    key={i}
                    className="w-full border p-2 rounded flex flex-row items-center"
                  >
                    <RadioGroup.Item className="relative w-full" value={option}>
                      <RadioGroup.Indicator
                        className={`
                            absolute
                            border
                            border-gray-300
                            rounded-full
                            p-1
                            top-1
                            after:bg-indigo-500 after:block after:w-2 after:h-2 after:rounded-full
                          `}
                      />
                      <span className="pl-8">{option}</span>
                    </RadioGroup.Item>
                  </div>
                );
              })}
            </RadioGroup.Root>
          </div>
        );
      }}
      control={control}
      name={name}
    />
  );
});
RadioGroupField.displayName = "RadioGroupField";
export default RadioGroupField;
