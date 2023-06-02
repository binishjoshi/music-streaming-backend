import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { AppModule } from './../src/app.module';
import { Admin } from '../src/admins/admin.entity';
import { ArtistManger } from '../src/artist-managers/artist-manager.entity';
import { ArtistManagerRequest } from '../src/artist-managers/artist-manager-request.entity';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  const EMAIL = 'test@pm.me';
  const USERNAME = 'test1234';
  const PASSWORD = 'test123456';
  const SIGNUP_ROUTE = '/admins/signup';
  const SIGNIN_ROUTE = '/admins/signin';
  const SIGNOUT_ROUTE = '/admins/signout';
  const WHOAMI_ROUTE = '/admins/whoami';

  const ARTIST_MANAGER_EMAIL = 'manager@pm.me';
  const ARTIST_MANAGER_USERNAME = 'manager1234';
  const ARTIST_MANAGER_PASSWORD = 'test123456';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    const dataSource = app.get(DataSource);
    await dataSource.createQueryBuilder().delete().from(Admin).execute();
    await dataSource.createQueryBuilder().delete().from(ArtistManger).execute();
    await dataSource
      .createQueryBuilder()
      .delete()
      .from(ArtistManagerRequest)
      .execute();
  });

  afterAll(async () => {
    const dataSource = app.get(DataSource);
    await dataSource.createQueryBuilder().delete().from(Admin).execute();
    await dataSource.createQueryBuilder().delete().from(ArtistManger).execute();
    await dataSource
      .createQueryBuilder()
      .delete()
      .from(ArtistManagerRequest)
      .execute();
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
      .get(WHOAMI_ROUTE)
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
      .get(WHOAMI_ROUTE)
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

  it('signs in and fetches artist manager requests', async () => {
    await request(app.getHttpServer())
      .post(SIGNUP_ROUTE)
      .send({ email: EMAIL, username: USERNAME, password: PASSWORD })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post(SIGNIN_ROUTE)
      .send({ email: EMAIL, password: PASSWORD })
      .expect(201);

    const cookie = res.get('Set-Cookie');
    const { body } = await request(app.getHttpServer())
      .get('/artist-managers/requests')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.length).toBeGreaterThanOrEqual(0);
  });

  it('verifies artist manager request', async () => {
    const aritstManagerRes = await request(app.getHttpServer())
      .post('/artist-managers/signup')
      .send({
        email: ARTIST_MANAGER_EMAIL,
        username: ARTIST_MANAGER_USERNAME,
        password: ARTIST_MANAGER_PASSWORD,
      })
      .expect(201);
    const aritstManagerCookie = aritstManagerRes.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .post('/artist-managers/request-for-verification')
      .set('Cookie', aritstManagerCookie)
      .field('letter', 'pls accept')
      .attach(
        'documents',
        'uploads/images/49f08cc2ae6facc3cef894d9d751e4d2.jpg',
      )
      .expect(201);

    const res = await request(app.getHttpServer())
      .post(SIGNUP_ROUTE)
      .send({ email: EMAIL, username: USERNAME, password: PASSWORD })
      .expect(201);
    const cookie = res.get('Set-Cookie');
    await request(app.getHttpServer())
      .patch(`/artist-managers/requests/verify/${body.id}`)
      .set('Cookie', cookie)
      .expect(200);
  });

  it('throws for wrong artist manager request id', async () => {
    const res = await request(app.getHttpServer())
      .post(SIGNUP_ROUTE)
      .send({ email: EMAIL, username: USERNAME, password: PASSWORD })
      .expect(201);
    const cookie = res.get('Set-Cookie');
    await request(app.getHttpServer())
      .patch(
        `/artist-managers/requests/verify/9d98bcf3-2e4c-4346-a07a-e57022573937`,
      )
      .set('Cookie', cookie)
      .expect(404);

    await request(app.getHttpServer())
      .patch(`/artist-managers/requests/verify/sum_random_id_thats_not_uuid`)
      .set('Cookie', cookie)
      .expect(404);
  });

  // it('deactivates user', async () => {
  //   const res = await request(app.getHttpServer())
  //     .post(SIGNUP_ROUTE)
  //     .send({ email: EMAIL, username: USERNAME, password: PASSWORD })
  //     .expect(201);

  //   const cookie = res.get('Set-Cookie');

  //   await request(app.getHttpServer())
  //     .post('/users/deactivate')
  //     .set('Cookie', cookie)
  //     .send({ email: EMAIL, password: PASSWORD })
  //     .expect(201);
  // });
});
