"use client";

import React, { type PropsWithoutRef } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {SingleFileUploadField as SingleFileUpload} from '@1upsaas/files/src/components/SingleFileUpload'
import { remove } from "../actions";

export interface SingleFileUploadProps
  extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string;
  /** Field label. */
  label: string;

  acceptedFileTypes?: string[]
}


export const SingleFileUploadField = React.forwardRef<
  HTMLInputElement,
  SingleFileUploadProps
>(({ label, defaultValue, acceptedFileTypes = [], ...props }, _) => {
  
  const {
    setValue,
    getValues,
    formState: { isSubmitSuccessful },
  } = useFormContext();

  return <Controller 
    name={props.name}
    defaultValue={""}
    render={() => <SingleFileUpload 
      name={props.name} 
      value={getValues(props.name)} 
      label={label}
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
});
SingleFileUploadField.displayName = "SingleFileUploadField";
export default SingleFileUploadField;
