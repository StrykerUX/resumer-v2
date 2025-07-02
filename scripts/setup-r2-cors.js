#!/usr/bin/env node

const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');

// Configuración del cliente R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: 'https://33da78a61008af7cef00a37eca328081.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: 'b9a1f3877421deb041a8b6bed0a3e4a8',
    secretAccessKey: '23005a3585ab19012801fc65921f00e2fca3df95baff36aac30558fb303ba520',
  },
  forcePathStyle: true,
});

// Configuración CORS
const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
      AllowedOrigins: [
        'http://localhost:3000',
        'http://localhost:3001', 
        'https://your-production-domain.com'
      ],
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3000,
    },
  ],
};

async function setupCORS() {
  try {
    console.log('🔧 Configurando CORS para bucket resumer-cvs...');
    
    const command = new PutBucketCorsCommand({
      Bucket: 'resumer-cvs',
      CORSConfiguration: corsConfiguration,
    });

    await r2Client.send(command);
    
    console.log('✅ CORS configurado exitosamente!');
    console.log('📋 Configuración aplicada:');
    console.log(JSON.stringify(corsConfiguration, null, 2));
    
  } catch (error) {
    console.error('❌ Error configurando CORS:', error);
    
    if (error.name === 'NoSuchBucket') {
      console.log('💡 Asegúrate de que el bucket "resumer-cvs" existe en tu cuenta de Cloudflare R2');
    }
    
    if (error.name === 'AccessDenied') {
      console.log('💡 Verifica que las credenciales tengan permisos para modificar configuraciones de bucket');
    }
  }
}

setupCORS();