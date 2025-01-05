<<<<<<< HEAD
import multer from "multer";
=======
import { Request } from "express";
import multer from "multer";
import path from "path";
>>>>>>> 29015dbb829ec7e191342e3e6ac54a2e823e33b7

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, fileName: string) => void;

export const uploader = (
<<<<<<< HEAD
  type: "memoryStorage" = "memoryStorage",
  filePrefix: string,
  folderName?: string
) => {
  const storage = multer.memoryStorage();

  return multer({ storage });
};
=======
  type: "memoryStorage" | "diskStorage" = "memoryStorage",
  filePrefix: string,
  folderName?: string
) => {
  const defaultDir = path.join(__dirname, "../../public");

  const storage =
    type == "memoryStorage"
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: (
            req: Request,
            file: Express.Multer.File,
            cb: DestinationCallback
          ) => {
            const destination = folderName
              ? defaultDir + folderName
              : defaultDir;
            cb(null, destination);
          },
          filename: (
            req: Request,
            file: Express.Multer.File,
            cb: FileNameCallback
          ) => {
            // asd.png
            const originalNameParts = file.originalname.split("."); // [asd, png]
            const fileExtension =
              originalNameParts[originalNameParts.length - 1]; // png
            const newFileName = filePrefix + Date.now() + "." + fileExtension;
            cb(null, newFileName);
          },
        });

  return multer({ storage });
};
>>>>>>> 29015dbb829ec7e191342e3e6ac54a2e823e33b7
