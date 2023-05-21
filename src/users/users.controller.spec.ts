import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  const TEST_EMAIL = 'test@pm.me';
  const TEST_PASSWORD = 'test123456';
  const TEST_ID = 'test-1235';

  beforeEach(async () => {
    fakeAuthService = {
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: TEST_ID, email, password } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signin', () => {
    it('updates session object and returns user', async () => {
      const session = { userId: -69 };
      const user = await controller.signin(
        {
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        },
        session,
      );

      expect(user.id).toEqual(TEST_ID);
      expect(session.userId).toEqual(TEST_ID);
    });
  });

  describe('signout', () => {
    it('clears session', async () => {
      const session = { userId: null };
      await controller.signin(
        {
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        },
        session,
      );

      await controller.signout(session);
      expect(session.userId).toBe(null);
    });
  });
});
