"use client";

import React, { type PropsWithoutRef } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {SingleFileUploadField as SingleFileUpload} from '@dir/files/src/components/SingleFileUpload'
import { remove } from "../actions";

export interface SingleFileUploadProps
  extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string;
  /** Field label. */
  label: string;
  description?: string;
  acceptedFileTypes?: string[];
}


export const SingleFileUploadField = React.forwardRef<
  HTMLInputElement,
  SingleFileUploadProps
>(({ label, defaultValue, description, acceptedFileTypes = [], ...props }, _) => {
  
  const {
    setValue,
    getValues,
    formState: { isSubmitSuccessful },
  } = useFormContext();

  return (
    <div className="w-full">
      <label className="text-sm font-medium leading-none flex space-y-2 flex-row items-center">
      <div className="flex flex-col gap-4 w-1/2">
              <span>{label}</span>
              {description ? <span className="text-xs antialiased text-primary-400">{description}</span> : null}
              </div>
              <div className="w-full">
      <Controller 
    name={props.name}
    defaultValue={""}
    render={() => <SingleFileUpload 
      name={props.name} 
      value={getValues(props.name)} 
      acceptedFileTypes={acceptedFileTypes as any}
      onUpload={async (file: string) => {
        setValue(props.name, file, {shouldValidate: true})
      }} 
      onChange={async (file: string) => {
        setValue(props.name, file, {shouldValidate: true})
      }}
      urlEndpoint={`${process.env.NEXT_PUBLIC_APP_URL}/api/files/upload`} 
      submitted={isSubmitSuccessful}
      remove={remove}
    />}
  />
  </div>
  </label>
    </div>
  )
});
SingleFileUploadField.displayName = "SingleFileUploadField";
export default SingleFileUploadField;
