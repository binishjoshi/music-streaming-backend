import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { fromBuffer } from 'file-type';

import { FileType } from '../types/file.type';

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  async transform(value: FileType) {
    const { ext, mime } = await fromBuffer(value.buffer);
    const MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    if (!MIME_TYPES.includes(mime)) {
      throw new BadRequestException(
        'The image should be either jpeg, png, or webp.',
      );
    }

    value.ext = ext;
    return value;
  }
}
