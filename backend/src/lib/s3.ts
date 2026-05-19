import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import {
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function getClient() {
  return new S3Client({ region: process.env.S3_REGION || 'eu-west-2' });
}

function getBucket() {
  return process.env.S3_BUCKET_NAME!;
}

function buildKey(prefix: string, fileName: string): string {
  if (!prefix.trim()) throw new Error('S3 prefix must not be empty');
  return `${prefix.trim()}/${fileName}`;
}

export async function getPresignedUploadUrl(
  prefix: string,
  fileName: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const key = buildKey(prefix, fileName);
  const cmd = new PutObjectCommand({ Bucket: getBucket(), Key: key, ContentType: contentType });
  return getSignedUrl(getClient(), cmd, { expiresIn });
}

export async function getPresignedDownloadUrl(
  prefix: string,
  fileName: string,
  expiresIn = 3600
): Promise<string> {
  const key = buildKey(prefix, fileName);
  const cmd = new GetObjectCommand({ Bucket: getBucket(), Key: key });
  return getSignedUrl(getClient(), cmd, { expiresIn });
}

export async function listFiles(prefix: string) {
  const response = await getClient().send(
    new ListObjectsV2Command({ Bucket: getBucket(), Prefix: prefix, MaxKeys: 200 })
  );
  return (response.Contents ?? [])
    .filter((o) => o.Key && !o.Key.endsWith('/'))
    .map((o) => ({
      key: o.Key!,
      fileName: o.Key!.split('/').pop()!,
      size: o.Size,
      lastModified: o.LastModified?.toISOString(),
    }));
}

export async function deleteFile(prefix: string, fileName: string) {
  const key = buildKey(prefix, fileName);
  await getClient().send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
}
