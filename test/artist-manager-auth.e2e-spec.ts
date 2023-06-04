import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { AppModule } from './../src/app.module';
import { ArtistManger } from '../src/artist-managers/artist-manager.entity';
import { ArtistManagerRequest } from '../src/artist-managers/artist-manager-request.entity';
import { Artist } from '../src/artists/artist.entity';
import { Admin } from '../src/admins/admin.entity';
import { deleteFile } from './lib/deleteFile';

describe('Artist Manager (e2e)', () => {
  let app: INestApplication;

  const EMAIL = 'test@pm.me';
  const USERNAME = 'test1234';
  const PASSWORD = 'test123456';
  const SIGNUP_ROUTE = '/artist-managers/signup';
  const SIGNIN_ROUTE = '/artist-managers/signin';
  const SIGNOUT_ROUTE = '/artist-managers/signout';
  const WHOAMI_ROUTE = '/artist-managers/whoami';
  const ADMIN_SIGNUP_ROUTE = '/admins/signup';

  const TEST_IMAGE = 'test/images/Adele_for_Vogue_in_2021.png';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = app.get(DataSource);
    await dataSource
      .createQueryBuilder()
      .delete()
      .from(ArtistManagerRequest)
      .execute();
    await dataSource.createQueryBuilder().delete().from(ArtistManger).execute();
    await dataSource.createQueryBuilder().delete().from(Artist).execute();
    await dataSource.createQueryBuilder().delete().from(Admin).execute();
  });

  afterAll(async () => {
    const dataSource = app.get(DataSource);
    await dataSource
      .createQueryBuilder()
      .delete()
      .from(ArtistManagerRequest)
      .execute();
    await dataSource.createQueryBuilder().delete().from(ArtistManger).execute();
    await dataSource.createQueryBuilder().delete().from(Artist).execute();
    await dataSource.createQueryBuilder().delete().from(Admin).execute();
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

  it('requests for verification', async () => {
    const res = await request(app.getHttpServer())
      .post(SIGNUP_ROUTE)
      .send({ email: EMAIL, username: USERNAME, password: PASSWORD })
      .expect(201);

    const cookie = res.get('Set-Cookie');

    await request(app.getHttpServer())
      .post('/artist-managers/request-for-verification')
      .set('Cookie', cookie)
      .field('letter', 'pls accept')
      .attach('documents', TEST_IMAGE)
      .expect(201);
  });

  it('fails verifies artist manager request', async () => {
    const res = await request(app.getHttpServer())
      .post(SIGNUP_ROUTE)
      .send({
        email: EMAIL,
        username: USERNAME,
        password: PASSWORD,
      })
      .expect(201);
    const cookie = res.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .post('/artist-managers/request-for-verification')
      .set('Cookie', cookie)
      .field('letter', 'pls accept')
      .attach('documents', TEST_IMAGE)
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/artist-managers/requests/verify/${body.id}`)
      .set('Cookie', cookie)
      .expect(403);

    body.documents.forEach((document) => deleteFile(document));
  });

  it('creates an aritst', async () => {
    const res = await request(app.getHttpServer())
      .post(SIGNUP_ROUTE)
      .send({
        email: EMAIL,
        username: USERNAME,
        password: PASSWORD,
      })
      .expect(201);
    const cookie = res.get('Set-Cookie');

    const requestedResponse = await request(app.getHttpServer())
      .post('/artist-managers/request-for-verification')
      .set('Cookie', cookie)
      .field('letter', 'pls accept')
      .attach('documents', TEST_IMAGE)
      .expect(201);

    const adminSignupResponse = await request(app.getHttpServer())
      .post(ADMIN_SIGNUP_ROUTE)
      .send({ email: EMAIL, username: USERNAME, password: PASSWORD })
      .expect(201);
    const adminCookie = adminSignupResponse.get('Set-Cookie');

    await request(app.getHttpServer())
      .patch(`/artist-managers/requests/verify/${requestedResponse.body.id}`)
      .set('Cookie', adminCookie)
      .expect(200);

    const { body } = await request(app.getHttpServer())
      .post('/artists/create')
      .set('Cookie', cookie)
      .field('name', 'Adele')
      .field('description', 'Good singer.')
      .attach('picture', TEST_IMAGE)
      .expect(201);

    deleteFile(body.picture);
  });

  it('fetches artists that it manages', async () => {
    const res = await request(app.getHttpServer())
      .post(SIGNUP_ROUTE)
      .send({
        email: EMAIL,
        username: USERNAME,
        password: PASSWORD,
      })
      .expect(201);
    const cookie = res.get('Set-Cookie');

    const requestedResponse = await request(app.getHttpServer())
      .post('/artist-managers/request-for-verification')
      .set('Cookie', cookie)
      .field('letter', 'pls accept')
      .attach('documents', TEST_IMAGE)
      .expect(201);

    const adminSignupResponse = await request(app.getHttpServer())
      .post(ADMIN_SIGNUP_ROUTE)
      .send({ email: EMAIL, username: USERNAME, password: PASSWORD })
      .expect(201);
    const adminCookie = adminSignupResponse.get('Set-Cookie');
    await request(app.getHttpServer())
      .patch(`/artist-managers/requests/verify/${requestedResponse.body.id}`)
      .set('Cookie', adminCookie)
      .expect(200);

    const createRequest = await request(app.getHttpServer())
      .post('/artists/create')
      .set('Cookie', cookie)
      .field('name', 'Adele')
      .field('description', 'Good singer.')
      .attach('picture', TEST_IMAGE)
      .expect(201);

    const createRequest2 = await request(app.getHttpServer())
      .post('/artists/create')
      .set('Cookie', cookie)
      .field('name', 'Doom')
      .field('description', 'Good singer.')
      .attach('picture', TEST_IMAGE)
      .expect(201);

    const { body } = await request(app.getHttpServer())
      .get('/artist-managers/artists')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.length).toBe(2);

    requestedResponse.body.documents.forEach((document) =>
      deleteFile(document),
    );
    deleteFile(createRequest.body.picture);
    deleteFile(createRequest2.body.picture);
  });

  it('fails to create artist without verification', async () => {
    const res = await request(app.getHttpServer())
      .post(SIGNUP_ROUTE)
      .send({
        email: EMAIL,
        username: USERNAME,
        password: PASSWORD,
      })
      .expect(201);
    const cookie = res.get('Set-Cookie');

    await request(app.getHttpServer())
      .post('/artists/create')
      .set('Cookie', cookie)
      .field('name', 'Adele')
      .field('description', 'Good singer.')
      .attach('picture', TEST_IMAGE)
      .expect(403);
  });

  it('fails fetching artists it manages', async () => {
    await request(app.getHttpServer())
      .get('/artist-managers/artists')
      .expect(403);
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
