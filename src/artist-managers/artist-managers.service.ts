import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ArtistManger } from './artist-manager.entity';

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
}
