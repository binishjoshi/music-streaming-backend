import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/users/user.entity';

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
  });

  afterEach(async () => {
    const dataSource = app.get(DataSource);
    // const entityManager = app.get(EntityManager);
    // const tableNames = entityManager.connection.entityMetadatas
    //   .map((entity) => entity.tableName)
    //   .join(', ');
    // console.log(tableNames);
    // await entityManager.query(
    //   `TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`,
    // );
    // dataSource.dropDatabase();
    await dataSource.createQueryBuilder().delete().from(User).execute();

    // await dataSource.query(`truncate ${tableNames} restart;`);
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

  // it('deactivates user', async () => {});
});
