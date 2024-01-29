"use client"
import React, { useState } from 'react'
import { RichTextField, Button} from "@dir/ui";
import { Controller, useFormContext } from "react-hook-form";
import {X} from 'lucide-react'
import { remove } from "~/features/files/actions";

export const FancyEditorField = ({ name, label }: { name: string, label?: string }) => {
  const {
    control,
    formState: { isSubmitSuccessful }
  } = useFormContext();

  //  State for storing the file to be removed. Note: Just clicking remove file without submitting the form won't delete the file from the server.
  const [removedFiles, setRemovedFiles] = useState<string[]>([]);



  React.useEffect(() => {
    if (isSubmitSuccessful) {
      const removeFiles = async () => {
        for (const file of removedFiles) {
          try {
            await remove({ key: file });
          } catch (error) {
            console.error("Error removing file:", error);
          }
        }
      };
  
      removeFiles().then(() => {
        // After all files are removed, reset the removedFiles state
        setRemovedFiles([]);
      });
    }
  }, [isSubmitSuccessful]);

  const handleImageRemove = async (images: string[]) => {
    images.forEach(async (image) => {
      const key = image.match(/\/([^\/]+)$/)?.[1];
      if (key) {
        setRemovedFiles(prev => [...prev, key]);
      }
    });
  };
  

  return (
    <div className="w-full flex flex-col gap-4">
      <label
        className="text-sm font-medium leading-none flex w-full gap-8 flex-row items-center"
      >
        {label ? <span className="w-1/2 self-start">{label}</span> : null}
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <RichTextField value={field.value} onImageRemove={handleImageRemove} placeholder="Write something spectacular..." imageUploadUrl={`${process.env.NEXT_PUBLIC_APP_URL}/api/files/upload`} onValueChange={(e) => field.onChange(e)} />
          )}
        />
      </label>


    </div>
  )
}