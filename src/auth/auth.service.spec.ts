import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  const TEST_EMAIL = 'test@pm.me';
  const TEST_USERNAME = 'test123';
  const TEST_PASSWORD = 'test123456';

  beforeEach(async () => {
    const users: User[] = [];

    fakeUsersService = {
      findUserByEmail: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, username: string, password: string) => {
        const randomId = `some-random-id-${Math.floor(Math.random() * 99999)}`;
        const user = {
          id: randomId,
          email,
          username,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates new user with hashed password', async () => {
    const user = await service.signup(TEST_EMAIL, TEST_USERNAME, TEST_PASSWORD);

    expect(user.password).not.toEqual(TEST_PASSWORD);
  });

  it('throws when email already in use', async () => {
    await service.signup(TEST_EMAIL, TEST_USERNAME, TEST_PASSWORD);
    await expect(
      service.signup(TEST_EMAIL, TEST_USERNAME, TEST_PASSWORD),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws and error when signing in using non-existent email', async () => {
    await expect(service.signin(TEST_EMAIL, TEST_PASSWORD)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws when signing in with invalid password', async () => {
    await service.signup(TEST_EMAIL, TEST_USERNAME, TEST_PASSWORD);

    await expect(
      service.signin(TEST_EMAIL, TEST_PASSWORD + 'd'),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns user for valid password', async () => {
    await service.signup(TEST_EMAIL, TEST_USERNAME, TEST_PASSWORD);

    const user = await service.signin(TEST_EMAIL, TEST_PASSWORD);
    expect(user).toBeDefined();
  });
});
