import { Express } from 'express';

export interface FileType extends Express.Multer.File {
  ext?: string;
  mime?: string;
}
