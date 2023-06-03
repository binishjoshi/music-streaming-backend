import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { AppModule } from './../src/app.module';
import { User } from '../src/users/user.entity';
import { ArtistManger } from '../src/artist-managers/artist-manager.entity';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  const EMAIL = 'test@pm.me';
  const USERNAME = 'test1234';
  const PASSWORD = 'test123456';
  const SIGNUP_ROUTE = '/users/signup';
  const SIGNIN_ROUTE = '/users/signin';
  const SIGNOUT_ROUTE = '/users/signout';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = app.get(DataSource);
    await dataSource.createQueryBuilder().delete().from(User).execute();
    await dataSource.createQueryBuilder().delete().from(ArtistManger).execute();
  });

  afterAll(async () => {
    const dataSource = app.get(DataSource);
    await dataSource.createQueryBuilder().delete().from(ArtistManger).execute();
    await dataSource.createQueryBuilder().delete().from(User).execute();
  });

  it('handles signup request', () => {
    return request(app.getHttpServer())
      .post(SIGNUP_ROUTE)
      .send({ email: EMAIL, username: USERNAME, password: PASSWORD })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(email).toEqual(EMAIL);
      });
  });

  it('signs up as a new user and gets the current logged in user', async () => {
    const res = await request(app.getHttpServer())
      .post(SIGNUP_ROUTE)
      .send({ email: EMAIL, username: USERNAME, password: PASSWORD })
      .expect(201);

    const cookie = res.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .get('/users/whoami')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.email).toEqual(EMAIL);
  });

  it('signs in', async () => {
    const res = await request(app.getHttpServer())
      .post(SIGNUP_ROUTE)
      .send({ email: EMAIL, username: USERNAME, password: PASSWORD })
      .expect(201);

    await request(app.getHttpServer())
      .post(SIGNIN_ROUTE)
      .send({ email: EMAIL, password: PASSWORD })
      .expect(201);

    const cookie = res.get('Set-Cookie');
    const { body } = await request(app.getHttpServer())
      .get('/users/whoami')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.email).toEqual(EMAIL);
  });

  it('signs out', async () => {
    await request(app.getHttpServer())
      .post(SIGNUP_ROUTE)
      .send({ email: EMAIL, username: USERNAME, password: PASSWORD })
      .expect(201);

    await request(app.getHttpServer())
      .post(SIGNIN_ROUTE)
      .send({ email: EMAIL, password: PASSWORD })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post(SIGNOUT_ROUTE)
      .expect(201);
    const cookie = res.get('Set-Cookie');

    await request(app.getHttpServer())
      .get('/whoami')
      .set('Cookie', cookie)
      .expect(404);
  });

  it('fails to fetch artists as artist manager', async () => {
    const res = await request(app.getHttpServer())
      .post(SIGNUP_ROUTE)
      .send({ email: EMAIL, username: USERNAME, password: PASSWORD })
      .expect(201);

    const cookie = res.get('Set-Cookie');

    await request(app.getHttpServer())
      .get('/artist-managers/artists')
      .set('Cookie', cookie)
      .expect(403);
  });

  it('fails to create artists as artist manager', async () => {
    const res = await request(app.getHttpServer())
      .post(SIGNUP_ROUTE)
      .send({ email: EMAIL, username: USERNAME, password: PASSWORD })
      .expect(201);

    const cookie = res.get('Set-Cookie');

    await request(app.getHttpServer())
      .post('/artists/create')
      .set('Cookie', cookie)
      .field('name', 'Adele')
      .field('description', 'Good singer.')
      .attach('picture', 'uploads/images/49f08cc2ae6facc3cef894d9d751e4d2.jpg')
      .expect(403);
  });

  it('deactivates user', async () => {
    const res = await request(app.getHttpServer())
      .post(SIGNUP_ROUTE)
      .send({ email: EMAIL, username: USERNAME, password: PASSWORD })
      .expect(201);

    const cookie = res.get('Set-Cookie');

    await request(app.getHttpServer())
      .post('/users/deactivate')
      .set('Cookie', cookie)
      .send({ email: EMAIL, password: PASSWORD })
      .expect(201);
  });
});
