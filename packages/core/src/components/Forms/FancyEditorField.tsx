"use client"
import React from 'react'
import { RichTextField } from "@dir/ui";
import { Controller, useFormContext } from "react-hook-form";

export const FancyEditorField = ({ name, label }: { name: string, label?: string }) => {
  const {
    control,
  } = useFormContext();

  return (
    <div className="w-full">
      <label
        className="text-sm font-medium leading-none flex space-y-2 w-full flex-col"
      >
        {label ? <span>{label}</span> : null}
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <RichTextField value={field.value} placeholder="Write something spectacular..." onValueChange={(e) => field.onChange(e)} />
          )}
        />
      </label>
    </div>
  )
}