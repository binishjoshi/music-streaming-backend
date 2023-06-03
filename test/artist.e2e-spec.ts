import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { AppModule } from './../src/app.module';
import { ArtistManger } from '../src/artist-managers/artist-manager.entity';
import { ArtistManagerRequest } from '../src/artist-managers/artist-manager-request.entity';
import { Artist } from '../src/artists/artist.entity';

describe('Artist (e2e)', () => {
  let app: INestApplication;

  const EMAIL = 'test@pm.me';
  const USERNAME = 'test1234';
  const PASSWORD = 'test123456';
  const SIGNUP_ROUTE = '/artist-managers/signup';

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
  });

  it('edits', async () => {
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
      .post('/artists/create')
      .set('Cookie', cookie)
      .field('name', 'Adele')
      .field('description', 'Good singer.')
      .attach('picture', 'uploads/images/49f08cc2ae6facc3cef894d9d751e4d2.jpg')
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/artists/${body.id}`)
      .set('Cookie', cookie)
      .send({ description: 'Updated.' })
      .expect(200);
  });
});
