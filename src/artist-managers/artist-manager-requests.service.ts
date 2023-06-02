import { writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { ArtistManagerRequest } from './artist-manager-request.entity';
import { FileType } from '../types/file.type';
import { ArtistManger } from './artist-manager.entity';
import { Admin } from '../admins/admin.entity';
import { ArtistManagersService } from './artist-managers.service';

@Injectable()
export class ArtistManagerRequestsService {
  constructor(
    @InjectRepository(ArtistManagerRequest)
    private repo: Repository<ArtistManagerRequest>,
    private artistManagersService: ArtistManagersService,
    private dataSource: DataSource,
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

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async verify(artistManagerRequest: ArtistManagerRequest, admin: Admin) {
    const artistManager = await this.artistManagersService.findUserById(
      artistManagerRequest.requestedBy.id,
    );

    artistManagerRequest.approved = true;
    artistManagerRequest.approvedBy = admin;
    artistManager.verified = true;
    artistManager.verifiedBy = admin;

    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(artistManager);
      await transactionalEntityManager.save(artistManagerRequest);
    });
  }
}
