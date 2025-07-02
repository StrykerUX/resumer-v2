import { S3Client } from '@aws-sdk/client-s3'

// Cliente configurado para Cloudflare R2
export const r2Client = new S3Client({
  region: 'auto', // R2 usa 'auto' como región
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Requerido para R2
})

export const R2_CONFIG = {
  bucketName: process.env.R2_BUCKET_NAME!,
  publicUrl: process.env.R2_PUBLIC_URL || process.env.R2_ENDPOINT,
  maxFileSize: {
    image: 4 * 1024 * 1024, // 4MB
    document: 16 * 1024 * 1024, // 16MB
  },
  allowedTypes: {
    image: ['image/jpeg', 'image/png', 'image/jpg'],
    document: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ],
  },
  uploadExpiration: 5 * 60, // 5 minutos para URLs pre-firmadas
}