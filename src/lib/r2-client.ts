import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

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

/**
 * Genera una URL pre-firmada para descargar un archivo desde R2
 * @param objectKey - La clave del objeto en R2 (ej: "resumes/user123/file.pdf")
 * @param expiresIn - Tiempo de expiración en segundos (default: 300 = 5 minutos)
 * @returns URL pre-firmada temporal para descarga segura
 */
export async function generatePresignedDownloadUrl(objectKey: string, expiresIn: number = 300): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_CONFIG.bucketName,
    Key: objectKey,
  });

  return await getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Extrae el object key desde una URL almacenada
 * @param fileUrl - URL completa del archivo
 * @returns Object key para usar con R2
 */
export function extractObjectKey(fileUrl: string): string {
  const urlParts = new URL(fileUrl);
  return urlParts.pathname.substring(1); // Remover "/" inicial
}

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