import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ArtistManger } from './artist-manager.entity';
import { Admin } from '../admins/admin.entity';

@Injectable()
export class ArtistManagersService {
  constructor(
    @InjectRepository(ArtistManger) private repo: Repository<ArtistManger>,
  ) {}

  findUserById(id: string) {
    if (!id) {
      return null;
    }

    return this.repo.findOne({
      where: {
        id,
      },
    });
  }

  findUserByEmail(email: string) {
    return this.repo.find({
      where: {
        email,
      },
    });
  }

  create(email: string, username: string, password: string) {
    const user = this.repo.create({ email, username, password });

    return this.repo.save(user);
  }

  delete(user: ArtistManger) {
    this.repo.remove(user);
  }

  async verify(id: string, admin: Admin) {
    const artistManager = await this.repo.findOne({ where: { id: id } });
    artistManager.verified = true;
    artistManager.verifiedBy = admin;

    this.repo.save(artistManager);
  }

  async fetchArtists(artistManager: ArtistManger) {
    const artistManagerWithArtists = await this.repo.findOne({
      where: { id: artistManager.id },
      relations: {
        artists: true,
      },
    });
    return artistManagerWithArtists.artists;
  }
}
