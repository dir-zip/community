import {S3Client, DeleteObjectCommand, GetObjectCommand} from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type TFileUploaderArgs = {
  allowedFileTypes?: string[]
  onProgressUpdate?: (progress:number) => Promise<void>
  bucket: string
}

export class FileUploader {
  progress: number;
  allowedFileTypes: TFileUploaderArgs['allowedFileTypes']
  s3Client: S3Client
  onProgressUpdate?: TFileUploaderArgs['onProgressUpdate']
  bucket: TFileUploaderArgs['bucket']

  constructor(args?: TFileUploaderArgs) {
    this.progress = 0;
    this.allowedFileTypes = args?.allowedFileTypes;
    this.s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY as string,
        secretAccessKey: process.env.S3_SECRET_KEY as string,
      } 
    })
    this.onProgressUpdate = args?.onProgressUpdate
    this.bucket = args?.bucket ?? ""
  }


  public async upload(file: File) {
    
    const fileContent = await file.arrayBuffer()
    const fileBuffer = Buffer.from(fileContent)
    const fileExt = file.name.split('.').pop()
    const fileType = file.type
    // Check if fileExt is in allowedFileTypes or if wildcard is present
    if (this.allowedFileTypes && !this.allowedFileTypes.includes(fileExt!) && !this.allowedFileTypes.includes('*')) {
      throw new Error(`File type '${fileExt}' is not allowed.`);
    }

    console.log("About to upload a file with the file type: " + fileType)
    const params = {
      Bucket: this.bucket,
      Key: `${file.name}`,
      Body: fileBuffer,
    };

    const parallelUploads3 = new Upload({
      client: this.s3Client,
      params,
      queueSize: 4, // optional concurrency configuration
      partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
      leavePartsOnError: false, // optional manually handle dropped parts
    });


    parallelUploads3.on("httpUploadProgress", async (progress) => {
      if (progress.total) {
        const percentage = (progress.loaded! / progress.total) * 100;
        await this.updateProgress(percentage);
      }
    });



    try {
      const response = await parallelUploads3.done();
      return JSON.stringify({
        location: `${process.env.S3_ENDPOINT}/${this.bucket}/${(response as any).Key}`,
        type: fileType,
        extension: fileExt,
        name: file.name
      })
    } catch (e) {
      console.log(e);
      throw Error(String(e));
    }
  }
  

  public async delete(key: string) {
    console.log("FILE INIT", key)
    const params = {
      Bucket: this.bucket,
      Key: key
    };
  
    const deleteObjectCommand = new DeleteObjectCommand(params);

    try {
      await this.s3Client.send(deleteObjectCommand);
      console.log(`Successfully deleted ${key} from ${this.bucket}`);
    } catch (e) {
      console.error(`Error deleting ${key} from ${this.bucket}`, e);
      throw Error(String(e));
    }
  }

  public async getPresignedUrl(key: string, expiresIn: number): Promise<string> {
    const getObjectCommand = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(this.s3Client, getObjectCommand, { expiresIn });

    return signedUrl;
  }

  private async updateProgress(progress:number) {
    this.progress = progress
    await this.onProgressUpdate?.(progress)
  }

}

