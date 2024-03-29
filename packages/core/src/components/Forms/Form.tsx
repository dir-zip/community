"use client";

import { useState, type ReactNode, type PropsWithoutRef } from "react";
import { FormProvider, useForm, type UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { Button } from "@dir/ui";

export interface FormProps<S extends z.ZodType<any, any>>
  extends Omit<PropsWithoutRef<JSX.IntrinsicElements["form"]>, "onSubmit"> {
  children?: ReactNode;
  submitText?: string;
  schema?: S;
  onSubmit: (values: z.infer<S>) => Promise<void | OnSubmitResult>;
  initialValues?: UseFormProps<z.infer<S>>["defaultValues"];
  reset?: boolean;
}

interface OnSubmitResult {
  FORM_ERROR?: string;
  [prop: string]: any;
}

export const FORM_ERROR = "FORM_ERROR";

export function Form<S extends z.ZodType<any, any>>({
  children,
  submitText,
  schema,
  initialValues,
  onSubmit,
  reset = false,
  ...props
}: FormProps<S>) {
  const ctx = useForm<z.infer<S>>({
    mode: "onChange",
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: initialValues,
  });
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <FormProvider {...ctx}>
      <form
        onSubmit={ctx.handleSubmit(async (values) => {
          const result = (await onSubmit(values)) || {};
          if(reset) {
            ctx.reset()
          }
          for (const [key, value] of Object.entries(result)) {
            if (key === FORM_ERROR) {
              setFormError(value.replace(/^TRPCClientError:\s*/, ""));
            } else {
              ctx.setError(key as any, {
                type: "submit",
                message: value.replace(/^TRPCClientError:\s*/, ""),
              });
            }
          }
        })}
        className="form space-y-4 py-2 pb-4 w-full flex flex-col gap-8 items-end"
        {...props}
      >
        {children}

        {formError && (
          <div
            role="alert"
            className="flex bg-red-200 text-red-600 p-2 rounded"
          >
            {formError}
          </div>
        )}

        {submitText && (
          <Button type="submit" disabled={ctx.formState.isSubmitting}>
            {submitText}
          </Button>
        )}
      </form>
    </FormProvider>
  );
}

export default Form;
