import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

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

  changePreference(user: User) {
    user.preference = user.preference === 'flac' ? 'opus' : 'flac';
    this.repo.save(user);
  }
}
