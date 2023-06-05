import { createHash } from 'crypto';
import { writeFileSync } from 'fs';

import { FileType } from '../types/file.type';

/**
 * Saves the `file` in `path` with file's MD5 hash as its filename
 * @param file
 * @param path
 * @returns path to the file e.g. `path` + `fileName`, where `fileName` is the MD5 hash of the `file`
 */
export function saveFile(
  file: FileType,
  path: 'uploads/images' | 'uploads/audio/lossless' | 'uploads/audio/lossy',
) {
  const md5Hash = createHash('md5');
  md5Hash.update(file.buffer);
  const hashText = md5Hash.digest('hex');

  const fileName = `${hashText}.${file.ext}`;
  const filePath = path + fileName;
  writeFileSync(filePath, file.buffer);

  return filePath;
}
