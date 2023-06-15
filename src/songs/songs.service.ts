import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Song } from './song.entity';
import { User } from '../users/user.entity';

@Injectable()
export class SongsService {
  constructor(@InjectRepository(Song) private repo: Repository<Song>) {}

  findById(id: string) {
    return this.repo.findOne({
      where: {
        id,
      },
    });
  }

  async getSongUrl(id: string, user: User) {
    const song = await this.findById(id);

    const url = user.preference === 'flac' ? song.pathLossless : song.pathLossy;

    return url;
  }
}
