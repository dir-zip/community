"use client"
import React from 'react'
import { TagInputField } from "@dir/ui";
import { Controller, useFormContext } from "react-hook-form";

export const TagField = ({ name, label, description }: { name: string, label: string, description?: string }) => {
  const {
    control,
  } = useFormContext();

  return (
    <div className="w-full">
      <label
        className="text-sm font-medium leading-none flex w-full flex-row items-center"
      >
        <div className="flex flex-col gap-4 w-1/2">
          <span>{label}</span>
          {description ? <span className="text-xs antialiased text-primary-400">{description}</span> : null}
        </div>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <div className="w-full"><TagInputField value={field.value} onChange={(e) => field.onChange(e)} /></div>
          )}
        />
      </label>
    </div>
  )
}