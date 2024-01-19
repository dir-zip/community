"use client"
import React, { PropsWithoutRef } from "react"
import { useFormContext, useFieldArray } from "react-hook-form"

import { Action, Condition } from "@dir/db"

import { cn } from "@/utils"
import { Button, buttonVariants } from "@dir/ui"
import { X } from "lucide-react"
import { SelectField } from "~/components/Forms"


export interface ConditionInputFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string
  label: string
  description?: string
  actions: Action[]
}

type ConditionFieldType = {
  [key: string]: Partial<Condition>[]
}

export const ConditionInputField = React.forwardRef<HTMLInputElement, ConditionInputFieldProps>(
  ({ label, description, actions, ...props }, ref) => {
    const { control } = useFormContext<ConditionFieldType>()

    const { fields, append, remove } = useFieldArray({
      control,
      name: `${props.name}` as const,
    })

    return (
      <div className="w-full flex flex-col gap-8">

        <div className="flex flex-col gap-4 w-1/2">
          <span className="text-sm font-medium leading-none">{label}</span>
          {description ? <span className="text-xs antialiased text-primary-400">{description}</span> : null}
        </div>

        <div className="space-y-8">
          {fields.map((field, i) => {
            return (
              <div className="mt-2 gap-4 sm:flex sm:justify-between sm:items-end bg-primary-900 rounded p-2 items-center" key={i}>

                <div className="w-full">
                  <SelectField name={`${props.name}.${i}` as const} placeholder="Select an action that's required" label={`${i+1}. `} options={actions.map(action => { return { value: action.id, key: action.title } })} />
                </div>

                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    remove(i)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>

              </div>
            )
          })}

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-primary-600" />
            </div>
            <div className="relative flex justify-center">
              <span className="relative z-0 inline-flex shadow-sm rounded-md -space-x-px">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    append({})
                  }}
                >
                  <span className="sr-only">Add Action</span>
                  Add Action
                </Button>
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }
)