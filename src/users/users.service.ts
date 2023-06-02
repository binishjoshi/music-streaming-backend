import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';
import { FileType } from '../types/file.type';
import { writeFileSync } from 'fs';

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

  delete(user: User) {
    this.repo.remove(user);
  }

  changePreference(user: User) {
    user.preference = user.preference === 'flac' ? 'opus' : 'flac';
    this.repo.save(user);
  }

  savePicture(file: FileType, user: User) {
    const md5Hash = createHash('md5');
    md5Hash.update(file.buffer);
    const hashText = md5Hash.digest('hex');

    const fileName = `${hashText}.${file.ext}`;
    const filePath = 'uploads/images/' + fileName;
    writeFileSync(filePath, file.buffer);

    user.profilePicture = filePath;
    this.repo.save(user);
  }
}
