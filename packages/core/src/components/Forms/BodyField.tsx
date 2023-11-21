"use client";
import {
  forwardRef,
  type PropsWithoutRef,
  type ComponentPropsWithoutRef,
} from "react";
import { Controller, useFormContext } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import Tiptap from "../ui/TipTap";

export interface TextFieldProps
  extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string;
  label: string;
  type?: "text" | "password" | "email" | "number";
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>;
  labelProps?: ComponentPropsWithoutRef<"label">;
}

export const BodyField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, outerProps, labelProps, name, ...props }, _) => {
    const {
      register,
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
              <Tiptap value={field.value} onValueChange={(e) => field.onChange(e)} />
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
BodyField.displayName = "BodyField";
export default BodyField;
