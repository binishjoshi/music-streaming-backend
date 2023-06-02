import { writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ArtistManagerRequest } from './artist-manager-request.entity';
import { FileType } from '../types/file.type';
import { ArtistManger } from './artist-manager.entity';

@Injectable()
export class ArtistManagerRequestsService {
  constructor(
    @InjectRepository(ArtistManagerRequest)
    private repo: Repository<ArtistManagerRequest>,
  ) {}

  fetchAll() {
    return this.repo.find();
  }

  create(letter: string, documents: FileType, artistManager: ArtistManger) {
    const md5Hash = createHash('md5');
    md5Hash.update(documents.buffer);
    const hashText = md5Hash.digest('hex');

    const fileName = `${hashText}.${documents.ext}`;
    const filePath = 'uploads/images/' + fileName;
    writeFileSync(filePath, documents.buffer);

    const request = this.repo.create({
      letter,
      documents: [filePath],
      requestedBy: artistManager,
    });

    return this.repo.save(request);
  }
}
