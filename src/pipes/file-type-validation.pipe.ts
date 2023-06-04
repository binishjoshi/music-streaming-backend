import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { fromBuffer } from 'file-type';

import { FileType } from '../types/file.type';

@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
  constructor(private type: 'image' | 'audio') {}

  async transform(value: FileType) {
    const { ext, mime } = await fromBuffer(value.buffer);

    if (this.type === 'image') {
      const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

      if (!IMAGE_MIME_TYPES.includes(mime)) {
        throw new BadRequestException(
          'The image should be either jpeg, png, or webp.',
        );
      }

      value.ext = ext;
      return value;
    } else {
      const AUDIO_MIME_TYPES = [
        'audio/flac',
        'audio/x-flac',
        'audio/wave',
        'audio/wav',
        'audio/x-wav',
        'audio/x-pn-wav',
      ];

      if (!AUDIO_MIME_TYPES.includes(mime)) {
        throw new BadRequestException(
          'The image should be either FLAC, or wave.',
        );
      }

      value.ext = ext;
      return value;
    }
  }
}
