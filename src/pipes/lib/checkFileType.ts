import { fromBuffer } from 'file-type';
import { FileType } from '../../types/file.type';
import { BadRequestException } from '@nestjs/common';

export const checkImageFileType = async (file: FileType) => {
  const { ext, mime } = await fromBuffer(file.buffer);
  const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  if (!IMAGE_MIME_TYPES.includes(mime)) {
    throw new BadRequestException(
      'The image should be either jpeg, png, or webp.',
    );
  }

  file.ext = ext;
  file.mime = mime;
  return file;
};

export const checkAudioFileType = async (file: FileType) => {
  const { ext, mime } = await fromBuffer(file.buffer);
  const AUDIO_MIME_TYPES = [
    'audio/flac',
    'audio/x-flac',
    'audio/wave',
    'audio/wav',
    'audio/x-wav',
    'audio/x-pn-wav',
  ];

  if (!AUDIO_MIME_TYPES.includes(mime)) {
    throw new BadRequestException('The image should be either FLAC, or wave.');
  }

  file.ext = ext;
  file.mime = mime;
  return file;
};
