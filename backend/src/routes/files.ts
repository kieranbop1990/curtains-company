import { Hono } from 'hono';
import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const filesRoutes = new Hono();

function getS3Client() {
  return new S3Client({ region: process.env.S3_REGION || 'eu-west-2' });
}

function getBucket() {
  return process.env.S3_BUCKET_NAME!;
}

filesRoutes.get('/:orderId', async (c) => {
  const { orderId } = c.req.param();
  const prefix = c.req.query('prefix');
  const s3 = getS3Client();

  const s3Prefix = prefix
    ? `public/${orderId}/${prefix}/`
    : `public/${orderId}/`;

  const response = await s3.send(
    new ListObjectsV2Command({
      Bucket: getBucket(),
      Prefix: s3Prefix,
      MaxKeys: 100,
    })
  );

  const files = (response.Contents ?? [])
    .filter((obj) => obj.Key && !obj.Key.endsWith('/'))
    .map((obj) => ({
      id: obj.Key!.split('/').pop()!,
      path: obj.Key!,
      extension: obj.Key!.split('.').pop(),
      size: obj.Size,
      lastModified: obj.LastModified?.toISOString(),
    }));

  return c.json(files);
});

filesRoutes.post('/upload-url', async (c) => {
  const { key, contentType } = await c.req.json();
  const s3 = getS3Client();

  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: `public/${key}`,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return c.json({ url });
});

filesRoutes.post('/download-url', async (c) => {
  const { key } = await c.req.json();
  const s3 = getS3Client();

  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key.startsWith('public/') ? key : `public/${key}`,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return c.json({ url });
});

filesRoutes.delete('/:orderId/:fileName', async (c) => {
  const { orderId, fileName } = c.req.param();
  const s3 = getS3Client();

  await s3.send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: `public/${orderId}/${fileName}`,
    })
  );

  return c.json({ message: 'File deleted' });
});
