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
} from "@/components/ui/Select";

export interface SelectFieldProps
  extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string;
  label: string;
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>;
  labelProps?: ComponentPropsWithoutRef<"label">;
  options: { value: string; key: string }[];
}

export const SelectField = forwardRef<HTMLInputElement, SelectFieldProps>(
  ({ label, outerProps, labelProps, name, options }) => {
    const {
      control,
      formState: { isSubmitting, errors },
    } = useFormContext();

    return (
      <div className="flex flex-col space-y-1" {...outerProps}>
        <label
          className="text-sm font-medium leading-none flex space-y-2 flex-col"
          {...labelProps}
        >
          <span>{label}</span>
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.key} value={option.value}>
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
