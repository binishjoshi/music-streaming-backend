import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { AppModule } from './../src/app.module';
import { Admin } from '../src/admins/admin.entity';
import { ArtistManger } from '../src/artist-managers/artist-manager.entity';
import { ArtistManagerRequest } from '../src/artist-managers/artist-manager-request.entity';
import { Artist } from '../src/artists/artist.entity';
import { deleteFile } from './lib/deleteFile';
import { Song } from '../src/songs/song.entity';
import { Album } from '../src/albums/album.entity';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  const EMAIL = 'test@pm.me';
  const USERNAME = 'test1234';
  const PASSWORD = 'test123456';
  const ADMIN_SIGNUP_ROUTE = '/admins/signup';
  const ARTIST_MANAGER_SIGNUP_ROUTE = '/artist-managers/signup';

  const TEST_IMAGE = 'test/images/Adele_for_Vogue_in_2021.png';
  const TEST_AUDIO = 'test/audio/01 - Sa Karnali.flac';

  const ALBUM_NAME = 'Album Name';
  const ALBUM_TYPE = 'single';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    const dataSource = app.get(DataSource);
    await dataSource.createQueryBuilder().delete().from(Admin).execute();
    await dataSource.createQueryBuilder().delete().from(ArtistManger).execute();
    await dataSource.createQueryBuilder().delete().from(Artist).execute();
    await dataSource.createQueryBuilder().delete().from(Song).execute();
    await dataSource.createQueryBuilder().delete().from(Album).execute();
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
    await dataSource.createQueryBuilder().delete().from(Artist).execute();
    await dataSource.createQueryBuilder().delete().from(Song).execute();
    await dataSource.createQueryBuilder().delete().from(Album).execute();
    await dataSource
      .createQueryBuilder()
      .delete()
      .from(ArtistManagerRequest)
      .execute();
  });

  it('creates album', async () => {
    const res = await request(app.getHttpServer())
      .post(ARTIST_MANAGER_SIGNUP_ROUTE)
      .send({
        email: EMAIL,
        username: USERNAME,
        password: PASSWORD,
      })
      .expect(201);
    const artistManagerCookie = res.get('Set-Cookie');

    const requestedResponse = await request(app.getHttpServer())
      .post('/artist-managers/request-for-verification')
      .set('Cookie', artistManagerCookie)
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

    const artistCreationResponse = await request(app.getHttpServer())
      .post('/artists/create')
      .set('Cookie', artistManagerCookie)
      .field('name', 'Adele')
      .field('description', 'Good singer.')
      .attach('picture', TEST_IMAGE)
      .expect(201);

    const songDetailsString = `{
      "songs": [{
        "title": "Sa Karnali",
        "genres": ["blues", "pop"]
      }]
    }`;
    const albumCreationResponse = await request(app.getHttpServer())
      .post('/albums/create')
      .set('Cookie', artistManagerCookie)
      .field('name', ALBUM_NAME)
      .field('type', ALBUM_TYPE)
      .field('artist', artistCreationResponse.body.id)
      .field('releaseDate', '2021-09-24')
      .field('songDetails', songDetailsString)
      .attach('songs', TEST_AUDIO)
      .attach('cover', TEST_IMAGE)
      .expect(201);

    const createdAlbum: Album = albumCreationResponse.body;

    expect(createdAlbum.name).toBe(ALBUM_NAME);
    expect(createdAlbum.type).toBe(ALBUM_TYPE);

    deleteFile(createdAlbum.coverArt);

    const getAlbumWithSongsResponse = await request(app.getHttpServer()).get(
      `/albums/${albumCreationResponse.body.id}`,
    );

    const songs: Song[] = getAlbumWithSongsResponse.body.songs;
    songs.forEach((song) => {
      deleteFile(song.pathLossless);
      deleteFile(song.pathLossy);
    });

    const artistManagerRequest: ArtistManagerRequest = requestedResponse.body;
    artistManagerRequest.documents.forEach((file) => {
      deleteFile(file);
    });

    deleteFile(artistCreationResponse.body.picture);
  });

  it("throws 403 when creating album from an artist that you don't manage", async () => {
    const res = await request(app.getHttpServer())
      .post(ARTIST_MANAGER_SIGNUP_ROUTE)
      .send({
        email: EMAIL,
        username: USERNAME,
        password: PASSWORD,
      })
      .expect(201);
    const artistManagerCookie = res.get('Set-Cookie');

    const res2 = await request(app.getHttpServer())
      .post(ARTIST_MANAGER_SIGNUP_ROUTE)
      .send({
        email: '2' + EMAIL,
        username: USERNAME,
        password: PASSWORD,
      })
      .expect(201);
    const secondArtistManagerCookie = res2.get('Set-Cookie');

    const requestedResponse = await request(app.getHttpServer())
      .post('/artist-managers/request-for-verification')
      .set('Cookie', artistManagerCookie)
      .field('letter', 'pls accept')
      .attach('documents', TEST_IMAGE)
      .expect(201);

    const secondRequestedResponse = await request(app.getHttpServer())
      .post('/artist-managers/request-for-verification')
      .set('Cookie', secondArtistManagerCookie)
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

    await request(app.getHttpServer())
      .patch(
        `/artist-managers/requests/verify/${secondRequestedResponse.body.id}`,
      )
      .set('Cookie', adminCookie)
      .expect(200);

    const artistCreationResponse = await request(app.getHttpServer())
      .post('/artists/create')
      .set('Cookie', artistManagerCookie)
      .field('name', 'Adele')
      .field('description', 'Good singer.')
      .attach('picture', TEST_IMAGE)
      .expect(201);

    deleteFile(artistCreationResponse.body.picture);

    const songDetailsString = `{
      "songs": [{
        "title": "Sa Karnali",
        "genres": ["blues", "pop"]
      }]
    }`;
    const albumCreationResponse = await request(app.getHttpServer())
      .post('/albums/create')
      .set('Cookie', secondArtistManagerCookie)
      .field('name', ALBUM_NAME)
      .field('type', ALBUM_TYPE)
      .field('artist', artistCreationResponse.body.id)
      .field('releaseDate', '2021-09-24')
      .field('songDetails', songDetailsString)
      .attach('songs', TEST_AUDIO)
      .attach('cover', TEST_IMAGE)
      .expect(403);

    expect(albumCreationResponse.body.message).toBe(
      "You don't manage this artist.",
    );

    const artistManagerRequest: ArtistManagerRequest = requestedResponse.body;
    artistManagerRequest.documents.forEach((file) => {
      deleteFile(file);
    });
  });

  it('throws 403 when creating album with unverified artist account', async () => {
    const res = await request(app.getHttpServer())
      .post(ARTIST_MANAGER_SIGNUP_ROUTE)
      .send({
        email: EMAIL,
        username: USERNAME,
        password: PASSWORD,
      })
      .expect(201);
    const artistManagerCookie = res.get('Set-Cookie');

    const res2 = await request(app.getHttpServer())
      .post(ARTIST_MANAGER_SIGNUP_ROUTE)
      .send({
        email: '2' + EMAIL,
        username: USERNAME,
        password: PASSWORD,
      })
      .expect(201);
    const secondArtistManagerCookie = res2.get('Set-Cookie');

    const requestedResponse = await request(app.getHttpServer())
      .post('/artist-managers/request-for-verification')
      .set('Cookie', artistManagerCookie)
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

    const artistCreationResponse = await request(app.getHttpServer())
      .post('/artists/create')
      .set('Cookie', artistManagerCookie)
      .field('name', 'Adele')
      .field('description', 'Good singer.')
      .attach('picture', TEST_IMAGE)
      .expect(201);

    const songDetailsString = `{
      "songs": [{
        "title": "Sa Karnali",
        "genres": ["blues", "pop"]
      }]
    }`;
    const albumCreationResponse = await request(app.getHttpServer())
      .post('/albums/create')
      .set('Cookie', secondArtistManagerCookie)
      .field('name', ALBUM_NAME)
      .field('type', ALBUM_TYPE)
      .field('artist', artistCreationResponse.body.id)
      .field('releaseDate', '2021-09-24')
      .field('songDetails', songDetailsString)
      .attach('songs', TEST_AUDIO)
      .attach('cover', TEST_IMAGE)
      .expect(403);

    expect(albumCreationResponse.body.message).toBe('You have to be verified.');

    const artistManagerRequest: ArtistManagerRequest = requestedResponse.body;
    artistManagerRequest.documents.forEach((file) => {
      deleteFile(file);
    });

    deleteFile(artistCreationResponse.body.picture);
  });
});
