"use client";
import {
  forwardRef,
  type PropsWithoutRef,
} from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "@dir/ui"


export interface CheckboxArrayField
  extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string;
  label: string;
  description?: string;
  data: { value: string, key: string }[]
}

export const CheckboxArrayField = forwardRef<HTMLInputElement, CheckboxArrayField>(
  ({ label, description, data, name, ...props }, _) => {
    const {
      register,
      control,
      formState: { isSubmitting, errors },
    } = useFormContext();

    return (
      <Controller
        render={({ field }) => {
          const fieldValue = Array.isArray(field.value) ? field.value : [];

          const handleChange = (checkedValue: string, checked: boolean) => {
            if (checked) {
              field.onChange([...fieldValue, checkedValue]);
            } else {
              field.onChange(fieldValue.filter((item: string) => item !== checkedValue));
            }
          };

          return (
            <div className="flex flex-col space-y-2 w-full">
              <label className="text-sm font-medium leading-none flex flex-row gap-8 items-center">
                <div className="flex flex-col gap-4 w-1/2">
                  <span>{label}</span>
                  {description ? <span className="text-xs antialiased text-primary-400">{description}</span> : null}
                </div>
                <div className="w-full flex flex-row gap-6">
                  {data.map(({ value, key }) => (
                    <label key={key} className="flex gap-2">
                      <Checkbox
                        checked={fieldValue.includes(value)}
                        onCheckedChange={(checked: boolean) => handleChange(value, checked)}
                      />
                      <span>{key}</span>
                    </label>
                  ))}
                </div>
              </label>


            </div>
          );
        }}
        control={control}
        name={name}
      />
    );
  },
);
CheckboxArrayField.displayName = "CheckboxArrayField";
export default CheckboxArrayField;
