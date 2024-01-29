"use client"
import React, { useEffect, useState } from 'react'
import { TagInputField } from "@dir/ui";
import { Controller, useFormContext } from "react-hook-form";

export const TagField = ({ name, label, description }: { name: string, label: string, description?: string }) => {
  const {
    control,
  } = useFormContext();

  return (
    <div className="w-full flex flex-row gap-8 items-center">
      <label
        className="text-sm font-medium leading-none w-1/2"
      >
        <div className="flex flex-col gap-4">
          <span>{label}</span>
          {description ? <span className="text-xs antialiased text-primary-400">{description}</span> : null}
        </div>

      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          return (
            <div className="w-full">
              <TagInputField value={field.value} onChange={(e) => field.onChange(e) } />
            </div>
          )
        }}
      />
    </div>
  )
}