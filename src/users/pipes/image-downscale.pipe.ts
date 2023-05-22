import { Injectable, PipeTransform } from '@nestjs/common';
import sharp from 'sharp';

import { FileType } from '../types/file.type';

@Injectable()
export class ImageDownscalePipe implements PipeTransform {
  async transform(value: FileType) {
    const downscaledImage = await sharp(value.buffer)
      .resize({
        height: 128,
        width: 128,
        fit: 'cover',
      })
      .toFormat('jpeg')
      .toBuffer();

    value.buffer = downscaledImage;
    return value;
  }
}
