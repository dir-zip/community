"use client"
import React, { PropsWithoutRef } from "react"
import { useFormContext, useFieldArray } from "react-hook-form"

import { Action, Condition } from "@dir/db"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/Button"
import { X } from "lucide-react"
import { SelectField } from "@/components/Forms"


export interface ConditionInputFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string
  label: string
  actions: Action[]
}

type ConditionFieldType = {
  [key: string]: Partial<Condition>[]
}

export const ConditionInputField = React.forwardRef<HTMLInputElement, ConditionInputFieldProps>(
  ({ label,actions, ...props }, ref) => {
    const { control } = useFormContext<ConditionFieldType>()

    const { fields, append, remove } = useFieldArray({
      control,
      name: `${props.name}` as const,
    })

    return (
      <>
        <p className="block text-sm font-medium text-gray-700">{label}</p>
        <div className="space-y-8">
          {fields.map((field, i) => {
            return (
              <div className="mt-2 gap-4 sm:flex sm:justify-between sm:items-end" key={i}>

                <div className="w-full">
                  <SelectField name={`${props.name}.${i}` as const} placeholder="Select an action that's required" label="Action" options={actions.map(action => { return {value: action.id, key: action.title}})} />
                </div>

                  <button
                    className={cn(buttonVariants({variant: 'outline'}))}
                    onClick={(e) => {
                      e.preventDefault()
                      remove(i)
                    }}
                  >
                      <X className="text-slate-600"/>   
                  </button>
           
              </div>
            )
          })}

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="relative z-0 inline-flex shadow-sm rounded-md -space-x-px">
                <button
                  type="button"
                  className="relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-400 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  onClick={(e) => {
                    e.preventDefault()
                    append({})
                  }}
                >
                  <span className="sr-only">Add Action</span>
                  Add Action
                </button>
              </span>
            </div>
          </div>
        </div>
      </>
    )
  }
)