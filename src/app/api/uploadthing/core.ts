import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

const validateFileType = (file: File): boolean => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];
  
  return allowedTypes.includes(file.type);
};

const validateFileSize = (file: File): boolean => {
  const maxSizeForDocs = 16 * 1024 * 1024; // 16MB
  const maxSizeForImages = 4 * 1024 * 1024; // 4MB
  
  if (file.type.startsWith('image/')) {
    return file.size <= maxSizeForImages;
  } else {
    return file.size <= maxSizeForDocs;
  }
};

export const ourFileRouter = {
  resumeUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { 
      maxFileSize: "16MB", 
      maxFileCount: 1 
    },
    "application/msword": { maxFileSize: "16MB", maxFileCount: 1 },
    "image/jpeg": { maxFileSize: "4MB", maxFileCount: 1 },
    "image/png": { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);

      try {
        const resume = await prisma.resume.create({
          data: {
            userId: metadata.userId,
            originalName: file.name,
            fileUrl: file.url,
            fileSize: file.size,
            mimeType: file.type || 'application/pdf',
          },
        });

        return { resumeId: resume.id, fileUrl: file.url };
      } catch (error) {
        console.error("Error saving resume to database:", error);
        throw new Error("Failed to save resume to database");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;