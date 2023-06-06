import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Song } from './song.entity';

@Injectable()
export class SongsService {
  constructor(@InjectRepository(Song) private repo: Repository<Song>) {}
}
