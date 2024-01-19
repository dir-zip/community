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
        className="text-sm font-medium leading-none flex w-full flex-row items-center"
      >
        {label ? <span className="w-1/2">{label}</span> : null}
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