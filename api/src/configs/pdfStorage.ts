// storage.config.ts
import { diskStorage } from 'multer';
import * as path from 'path';

export const pdfStorage = (pdfPath: string) => diskStorage({
  destination: path.join(process.cwd(), pdfPath),
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
