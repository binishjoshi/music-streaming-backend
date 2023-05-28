import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as argon2 from 'argon2';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  async signup(email: string, username: string, password: string) {
    const users = await this.usersService.findUserByEmail(email);

    if (users.length) {
      throw new BadRequestException('Email already in use.');
    }

    let hash;
    try {
      hash = await argon2.hash(password);
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }

    const user = await this.usersService.create(email, username, hash);

    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.findUserByEmail(email);
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
