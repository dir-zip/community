"use client";
import {
  forwardRef,
  type PropsWithoutRef,
} from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Checkbox, ToggleGroup, ToggleGroupItem } from "@dir/ui"


export interface ButtonSelectField
  extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string;
  label: string;
  description?: string;
  options: { value: string, key: string }[]
}

export const ButtonSelectField = forwardRef<HTMLInputElement, ButtonSelectField>(
  ({ label, description, options, name, ...props }, _) => {
    const {
      register,
      control,
      formState: { isSubmitting, errors },
    } = useFormContext();

    return (
      <Controller
        render={({ field }) => {
          const fieldValue = field.value

          const handleChange = (value: string) => {
            field.onChange(value);
          };

          return (
            <div className="flex flex-row gap-8 items-center w-full">
              <label className="flex flex-col gap-4 w-1/2 text-sm font-medium leading-none">
          
                  <span>{label}</span>
                  {description ? <span className="text-xs antialiased text-primary-400">{description}</span> : null}
 
              </label>
              <div className="w-full flex flex-row gap-6">
              <ToggleGroup variant={'outline'} type="single" value={fieldValue} onValueChange={(value: string) => handleChange(value)}>
                  {options.map(({ value, key }, i) => (
                    <ToggleGroupItem value={value} aria-label={key} key={i}>
                      {key}
                    </ToggleGroupItem>
                  ))}

                </ToggleGroup>
  
</div>


            </div>
          );
        }}
        control={control}
        name={name}
      />
    );
  },
);
ButtonSelectField.displayName = "ButtonSelectField";
export default ButtonSelectField;
