import { createHash } from 'crypto';
import { writeFileSync } from 'fs';

import { FileType } from '../types/file.type';

export function saveFile(file: FileType) {
  const md5Hash = createHash('md5');
  md5Hash.update(file.buffer);
  const hashText = md5Hash.digest('hex');

  const fileName = `${hashText}.${file.ext}`;
  const filePath = 'uploads/images/' + fileName;
  writeFileSync(filePath, file.buffer);

  return filePath;
}
