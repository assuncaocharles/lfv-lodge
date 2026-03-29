import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let s3: S3Client;

function getS3Client() {
  if (!s3) {
    s3 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return s3;
}

const bucket = () => process.env.R2_BUCKET_NAME!;

export async function generateUploadUrl(
  key: string,
  contentType: string,
  maxSizeBytes: number = 50 * 1024 * 1024,
) {
  const command = new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    ContentType: contentType,
    ContentLength: maxSizeBytes,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn: 3600 });
}

export async function generateDownloadUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: bucket(),
    Key: key,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn: 3600 });
}

export async function deleteObject(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: bucket(),
    Key: key,
  });
  await getS3Client().send(command);
}
