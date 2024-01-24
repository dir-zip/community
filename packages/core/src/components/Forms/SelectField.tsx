"use client";

import {
  forwardRef,
  type PropsWithoutRef,
  type ComponentPropsWithoutRef,
} from "react";
import { useFormContext, Controller } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@dir/ui";
import { cn } from "@/utils";

export interface SelectFieldProps
  extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string;
  label: string;
  description?: string;
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>;
  labelProps?: ComponentPropsWithoutRef<"label">;
  options: { value: string; key: string }[];
  fullWidth?: boolean
}

export const SelectField = forwardRef<HTMLInputElement, SelectFieldProps>(
  ({ label, fullWidth, description, outerProps, labelProps, name, options, ...props }, _) => {
    const {
      control,
      formState: { isSubmitting, errors },
    } = useFormContext();

    return (
      <div className="flex flex-col space-y-1 w-full" {...outerProps}>
        <label
          className={cn("text-sm font-medium leading-none flex flex-row items-center", fullWidth ? "gap-4" : null)}
          {...labelProps}
        >
          <div className={cn("flex flex-col gap-4", fullWidth ? null : 'w-1/2')}>
            <span>{label}</span>
            {description ? <span className="text-xs antialiased text-primary-400">{description}</span> : null}
          </div>
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                disabled={isSubmitting}
                onValueChange={(e) => {
                  field.onChange(e);
                }}
              >
                <SelectTrigger className="bg-primary-900 w-full rounded py-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='bg-primary-900 rounded'>

                  {options.map((option) => (
                    <SelectItem key={option.key} value={option.value} className="hover:bg-primary-700 rounded">
                      {option.key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </label>

        <ErrorMessage
          render={({ message }) => (
            <div role="alert" className="text-xs text-red-500">
              {message}
            </div>
          )}
          errors={errors}
          name={name}
        />
      </div>
    );
  },
);
SelectField.displayName = "SelectField";
export default SelectField;
