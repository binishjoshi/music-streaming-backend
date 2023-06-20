import {
  BadGatewayException,
  Controller,
  Get,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { SongsService } from './songs.service';
import { createReadStream, statSync } from 'fs';

@Controller('songs')
export class SongsController {
  constructor(private songsSerivce: SongsService) {}

  @Get('/url/:id')
  @UseGuards(AuthGuard)
  async getSongUrl(@Param('id') id: string, @CurrentUser() user: User) {
    const url = await this.songsSerivce.getSongUrl(id, user);
    return { url };
  }

  @Get('stream/:file')
  stream(
    @Param('file') file: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const range = req.headers.range;

    if (!range) {
      throw new BadGatewayException('Requires range header.');
    }

    let contentTypeHeader, songPath;

    if (file.match(/\.opus/)) {
      songPath = 'uploads/audio/lossy/' + file;
      contentTypeHeader = 'audio/opus';
    } else {
      songPath = 'uploads/audio/lossless/' + file;
      contentTypeHeader = 'audio/flac';
    }

    const songSize = statSync(songPath).size;
    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, songSize - 1);

    const contentLength = end - start + 1;
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${songSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': contentTypeHeader,
    };

    res.writeHead(206, headers);

    const audioStream = createReadStream(songPath, { start, end });
    audioStream.pipe(res);
  }
}
