"use client";

import React from "react";
import { useDropzone } from "react-dropzone";

export interface SingleFileUploadProps {
  /** Field name. */
  name: string;
  /** Field label. */
  label: string;

  acceptedFileTypes?: string[];

  submitted: boolean;

  onUpload: (file: string) => Promise<void>;

  onChange: (file: string) => Promise<void>

  remove: ({key}: {key:string}) => Promise<void>;

  urlEndpoint: string;

  value: string;
}


export const SingleFileUploadField: React.FC<SingleFileUploadProps> = ({ label, value, urlEndpoint, onUpload, onChange, remove, submitted, acceptedFileTypes = [], ...props }) => {
  

  const [file, setFile] = React.useState<string | null>(null || value);

  // State for storing the file to be removed. Note: Just clicking remove file without submitting the form won't delete the file from the server.
  const [removedFile, setRemovedFile] = React.useState("");

  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);
  const [previewFileName, setPreviewFileName] = React.useState<string | null>(null)
  const [previewFileType, setPreviewFileType] = React.useState<string | null>(null)


  React.useEffect(() => {
    (async () => {
      if(submitted && removedFile !== "") {
        await remove({key: removedFile})
      }
    })();
  }, [submitted, removedFile]);

  const onDrop = React.useCallback(
    async (droppedFiles: File[] | undefined) => {
      setUploadProgress(0.1)
      if (!droppedFiles || droppedFiles.length === 0 || !droppedFiles[0]) {
        // handle the case where no files were dropped
        return;
      }

      const xhr = new XMLHttpRequest();
      const formData = new FormData()
 
      xhr.open("POST", urlEndpoint);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
      xhr.upload.addEventListener('progress', e => {
        setUploadProgress((e.loaded * 100.0) / e.total || 100)
      })
      xhr.addEventListener('readystatechange', () => {
        
        if (xhr.status > 0 && xhr.status < 400) {
          const response = xhr.responseText;
          if(response) {
            const json = JSON.parse(response)
            setFile(json['location'])
            onUpload(json['location'])
            setUploadProgress(100)
          }
        
        }
  
        if (xhr.status >= 400) {
          throw new Error('Error uploading file')
        }

      })
      formData.append('file', droppedFiles[0])
      const objectUrl = URL.createObjectURL(droppedFiles[0])
      
      setFile(objectUrl)
      setPreviewFileName(droppedFiles[0].name)
      setPreviewFileType("." + droppedFiles[0].name.split('.').pop())
      await onChange(objectUrl)
      xhr.send(formData)

    },
    [setFile, props.name],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc: Record<string, string[]>, fileType) => {
      switch(fileType) {
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'webp':
          acc[`image/${fileType}`] = [`.${fileType}`];
          break;
        case 'zip':        
          acc[`application/${fileType}`] = [`.${fileType}`];
          break;
        case 'md':
          acc[`text/${fileType}`] = [`.${fileType}`];
          break;
        default:
          acc[fileType] = [];
      }
      return acc
    }, {})
  });

  const getFileType = (file: string) => {
    const result = file.match(/\.\w+$/);
    if(result) {
      return result[0]
    }
  }

  const ifImage = (file: string) => {
    const imgExts = ['.png', '.jpg', '.gif', '.jpeg']
    const preview = previewFileType
    const fileType = getFileType(file)

    if(imgExts.includes(preview!) || imgExts.includes(fileType!)) {
      return true
    }

    return false
  }

  return (
    <div className="w-full lg:w-fit">
      <>
        {file && file !== "" ? (
          <div className="w-full flex flex-col space-y-2">
            <label className="text-sm font-medium leading-none flex space-y-2 flex-col">
              {label}
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-input rounded">
              <div className="flex items-center space-x-4 w-full">

                <div className="flex flex-col items-center space-y-2 w-28">
        
                  <div className="w-28 h-24 bg-gray-100 rounded p-2">

                    {!ifImage(file) ? <div className="w-full h-full rounded flex flex-col items-center justify-center"><svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          className="fill-gray-400"
                          d="M3 5C3 3.34315 4.34315 2 6 2H14C17.866 2 21 5.13401 21 9V19C21 20.6569 19.6569 22 18 22H6C4.34315 22 3 20.6569 3 19V5ZM13 4H6C5.44772 4 5 4.44772 5 5V19C5 19.5523 5.44772 20 6 20H18C18.5523 20 19 19.5523 19 19V9H13V4ZM18.584 7C17.9413 5.52906 16.6113 4.4271 15 4.10002V7H18.584Z"
                          fill="currentColor"
                        />
                    </svg>
                    <span className="text-gray-400">{previewFileType || getFileType(file)}</span>
                  </div> : <div
                        className="w-full h-full rounded"
                        style={{
                          backgroundImage: `url("${file}")`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      / >}

                  </div>
                  <p className="text-xs text-gray-400 w-full truncate">{previewFileName || (file as string).match(/\/([^\/]+)$/)?.[1]}</p>
                </div>
              
    

              {uploadProgress && 
                <div style={{
                  width: '400px', 
                  padding: '4px', 
                  background: 'rgba(203, 203, 203, 0.25)', 
                  borderRadius: '6px', 
                  boxShadow: 'inset 0 1px 2px rgba(128, 128, 128, 0.25), 0 1px rgba(96, 96, 96, 0.08)'
                }}>
                    <div style={{
                      height: '16px', 
                      borderRadius: '4px', 
                      backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05))',
                      backgroundColor: '#86e01e',
                      transition: '0.4s linear', 
                      transitionProperty: 'width', 
                      boxShadow: '0 0 1px 1px rgba(0, 0, 0, 0.25), inset 0 1px rgba(255, 255, 255, 0.1)',
                      width: `${uploadProgress}%`
                    }}>
                    </div>
                </div>
              }

                <button
                  className="bg-gray-200 text-white p-2 rounded-full hover:bg-rose-800 m-2 w-8 h-6 flex items-center justify-center"
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    // Use regex to get the key from the url. ie. http://127.0.0.1:9000/1upsaas-storage/88a1970d-00f2-40db-ba3d-9adeea5e8271.png
                    // NOTE TO REMEMBER: the key must contain the file extension
                    const key = (file as string).match(/\/([^\/]+)$/)?.[1];

                    if (key) {
                      setRemovedFile(key);
                      await onChange("")
                      setFile(null)

                    }

                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M17 5V4C17 2.89543 16.1046 2 15 2H9C7.89543 2 7 2.89543 7 4V5H4C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H5V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H17ZM15 4H9V5H15V4ZM17 7H7V18C7 18.5523 7.44772 19 8 19H16C16.5523 19 17 18.5523 17 18V7Z"
                      fill="currentColor"
                    />
                    <path d="M9 9H11V17H9V9Z" fill="currentColor" />
                    <path d="M13 9H15V17H13V9Z" fill="currentColor" />
                  </svg>

                </button>
              </div>
            </div>


          </div>
        ) : (
          <div {...getRootProps({ className: "btn-dropzone" })}>
            <label className="text-sm font-medium leading-none flex space-y-2 flex-col">
              {label}
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-input rounded">
              <div className="flex flex-col text-center text-sm text-gray-600">
                <div className="flex flex-col lg:flex-row">
                  <p className="lg:mr-1">Drag and drop file here, </p>
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    <button onClick={(e) => e.preventDefault()}>
                      {" "}
                      or click to select image
                    </button>
                    <input
                      {...props}
                      {...getInputProps()}
                      id="file-upload"
                      name="file-upload"
                      type="file"
                    />
                  </label>
                </div>

              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
}


SingleFileUploadField.displayName = "SingleFileUploadField";
export default SingleFileUploadField;
