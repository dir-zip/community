"use client";
import {
  forwardRef,
  type PropsWithoutRef,
  type ComponentPropsWithoutRef,
} from "react";
import { useFormContext } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { InputField } from "@dir/ui"

export interface TextFieldProps
  extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string;
  label: string;
  type?: "text" | "password" | "email" | "number";
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>;
  labelProps?: ComponentPropsWithoutRef<"label">;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, outerProps, labelProps, name, ...props }, _) => {
    const {
      register,
      formState: { isSubmitting, errors },
    } = useFormContext();

    return (
      <div className="flex flex-col space-y-1" {...outerProps}>
        <label
          className="text-sm font-medium leading-none flex space-y-2 flex-col"
          {...labelProps}
        >
          <span>{label}</span>
          <input
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
            {...register(name, { valueAsNumber: props.type === 'number' })}
            {...props}
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
TextField.displayName = "TextField";
export default TextField;
