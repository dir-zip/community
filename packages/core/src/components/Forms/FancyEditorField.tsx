"use client"
import React from 'react'
import { RichTextField } from "@dir/ui";
import { Controller, useFormContext } from "react-hook-form";

export const FancyEditorField = ({name}: {name: string}) => {
  const {
    control,
  } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <RichTextField value={field.value} placeholder="Write something spectacular..." onValueChange={(e) => field.onChange(e)} />
      )}
    />
  )
}