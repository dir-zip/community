"use client"
import React from 'react'
import { TagInputField } from "@dir/ui";
import { Controller, useFormContext } from "react-hook-form";

export const TagField = ({ name, label }: { name: string, label: string }) => {
  const {
    control,
  } = useFormContext();

  return (
    <div className="w-full">
      <label
        className="text-sm font-medium leading-none flex space-y-2 w-full flex-col"
      >
        <span>{label}</span>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <TagInputField value={field.value} onChange={(e) => field.onChange(e)} />
          )}
        />
      </label>
    </div>
  )
}