import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as argon2 from 'argon2';

import { UsersService } from '../users/users.service';
import { ArtistManagersService } from '../artist-managers/artist-managers.service';

type EntityType = 'user' | 'artistManager';

interface SigninPayloadType {
  email: string;
  password: string;
}

interface SignupPayloadType {
  email: string;
  username: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private artistManagersService: ArtistManagersService,
  ) {}
  async signup(
    { email, username, password }: SignupPayloadType,
    entity: EntityType,
  ) {
    let users;

    if (entity === 'user') {
      users = await this.usersService.findUserByEmail(email);
    } else {
      users = await this.artistManagersService.findUserByEmail(email);
    }

    if (users.length) {
      throw new BadRequestException('Email already in use.');
    }

    let hash;
    try {
      hash = await argon2.hash(password);
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }

    let user;
    if (entity === 'user') {
      user = await this.usersService.create(email, username, hash);
    } else {
      user = await this.artistManagersService.create(email, username, hash);
    }

    return user;
  }

  async signin({ email, password }: SigninPayloadType, entity: EntityType) {
    let user;
    if (entity === 'user') {
      [user] = await this.usersService.findUserByEmail(email);
    } else {
      [user] = await this.artistManagersService.findUserByEmail(email);
    }

    if (!user) {
      throw new BadRequestException('Invalid credentials.');
    }

    try {
      if (await argon2.verify(user.password, password)) {
        return user;
      } else {
        throw new BadRequestException('Invalid credentials.');
      }
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }
}
