import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { FileType } from '../types/file.type';
import { checkAudioFileType, checkImageFileType } from './lib/checkFileType';

@Injectable()
export class AlbumCreationValidationPipe implements PipeTransform {
  async transform(value: FileType[]) {
    const validatedFiles: FileType[] = [];

    for (let i = 0; i < value.length; i++) {
      if (value[i].fieldname === 'songs') {
        const validatedFile = await checkAudioFileType(value[i]);
        validatedFiles.push(validatedFile);
      } else if (value[i].fieldname === 'cover') {
        const validatedFile = await checkImageFileType(value[i]);
        validatedFiles.push(validatedFile);
      } else {
        throw new BadRequestException('Unknown file field.');
      }
    }

    return validatedFiles;
  }
}
