import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Admin } from './admin.entity';

@Injectable()
export class AdminsService {
  constructor(@InjectRepository(Admin) private repo: Repository<Admin>) {}
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
  delete(user: Admin) {
    this.repo.remove(user);
  }
}
