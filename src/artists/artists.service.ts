import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Artist } from './artist.entity';
import { Repository } from 'typeorm';
import { FileType } from '../types/file.type';
import { saveFile } from '../lib/save-file';
import { ArtistManger } from '../artist-managers/artist-manager.entity';

@Injectable()
export class ArtistsService {
  constructor(@InjectRepository(Artist) private repo: Repository<Artist>) {}

  create(
    name: string,
    description: string,
    picture: FileType,
    artistManager: ArtistManger,
  ) {
    const filePath = saveFile(picture);
    const artist = this.repo.create({
      name: name,
      description: description,
      picture: filePath,
      managedBy: artistManager,
    });

    return this.repo.save(artist);
  }
}
