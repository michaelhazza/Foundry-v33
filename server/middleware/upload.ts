import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import { config } from '../config.js';
import { FileError } from '../errors/index.js';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, '/tmp/uploads');
  },
  filename: (_req, file, cb) => {
    const uniqueName = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new FileError(`Invalid file type: ${file.mimetype}. Allowed: ${config.upload.allowedMimeTypes.join(', ')}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 10,
  },
});
