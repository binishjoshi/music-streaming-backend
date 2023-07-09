import { promisify } from 'util';
import { exec } from 'child_process';
import path from 'path';
import { unlinkSync } from 'fs';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { parseFile } from 'music-metadata';
import Annoy from 'annoy';

import { Album } from './album.entity';
import { ArtistManger } from '../artist-managers/artist-manager.entity';
import { Mrs } from '../mrs/mrs.entity';
import { FileType } from '../types/file.type';
import { CreateAlbumDto } from './dtos/create-album.dto';
import { saveFile } from '../lib/save-file';
import { ArtistManagersService } from '../artist-managers/artist-managers.service';
import { Song } from '../songs/song.entity';
import { ArtistsService } from '../artists/artists.service';
import { GenresService } from '../genres/genres.service';

interface SongDetailType {
  title: string;
  genres: string[];
}

interface SongDetailsType {
  songs: SongDetailType[];
}

interface MaxAudioEmbedding {
  status: string;
  embedding: Array<Array<number>>;
}

const promisifiedExec = promisify(exec);

@Injectable()
export class AlbumsService {
  constructor(
    @InjectRepository(Album) private repo: Repository<Album>,
    @InjectRepository(Song) private songRepo: Repository<Song>,
    @InjectRepository(Mrs) private mrsRepo: Repository<Mrs>,
    private dataSource: DataSource,
    private artistManagersService: ArtistManagersService,
    private artistsService: ArtistsService,
    private genresService: GenresService,
  ) {}

  get() {
    return this.repo.find({
      skip: 0,
      take: 10,
      relations: {
        artist: true,
      },
    });
  }

  async getAlbumWithSongs(id: string) {
    // ideally, songs shouldn't have filepaths
    const album = await this.repo.findOne({
      where: {
        id: id,
      },
      relations: {
        songs: true,
        artist: true,
      },
    });

    if (!album) {
      throw new NotFoundException();
    }

    return album;
  }

  async create(
    artistManager: ArtistManger,
    files: FileType[],
    body: CreateAlbumDto,
  ) {
    if (!artistManager.verified) {
      throw new ForbiddenException('You have to be verified.');
    }

    // check if the artist manager created the artist
    let artistManagerHasArtist = false;
    const managedArtists = await this.artistManagersService.fetchArtists(
      artistManager,
    );
    managedArtists.forEach((artist) => {
      if (artist.id === body.artist) {
        artistManagerHasArtist = true;
      }
    });
    if (!artistManagerHasArtist) {
      throw new ForbiddenException("You don't manage this artist.");
    }

    const songDetails: SongDetailsType = JSON.parse(body.songDetails);
    const songFilesArray: FileType[] = [];

    // separate songs and image so files only has image
    for (let i = 0; i < files.length; i++) {
      if (files[i].fieldname === 'songs') {
        songFilesArray.push(files[i]);
        files.splice(i, 1);
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const songsInformationArray = [];
      const savedSongs: Song[] = [];

      // find artist
      console.log('Finding artist...');
      const artist = await this.artistsService.findOneById(body.artist);

      console.log('Creating album...');
      // create album
      const album = this.repo.create({
        name: body.name,
        type: body.type,
        coverArt: saveFile(files[0], 'uploads/images/'),
        releaseDate: body.releaseDate,
        artist: artist,
      });
      const savedAlbum = await queryRunner.manager.save(album);

      // create song entries
      for (let i = 0; i < songFilesArray.length; i++) {
        const losslessPath = saveFile(
          songFilesArray[i],
          'uploads/audio/lossless/',
        );
        const baseMd5 = path.basename(losslessPath, '.flac');
        const lossyPath = 'uploads/audio/lossy/' + baseMd5 + '.opus';
        console.log(`Transcoding ${songDetails.songs[i].title} into opus...`);
        await promisifiedExec(
          `ffmpeg -y -i ${losslessPath} -c:a libopus -b:a 256k ${lossyPath}`,
        );
        songsInformationArray.push({
          title: songDetails.songs[i].title,
          genres: songDetails.songs[i].genres,
          pathLossy: lossyPath,
          pathLossless: losslessPath,
          artist: artist,
        });

        // get genres
        const genres = this.genresService.findGenresByNames(
          songDetails.songs[i].genres,
        );

        const metadata = await parseFile(losslessPath);

        // add song entry
        const song = this.songRepo.create({
          title: songDetails.songs[i].title,
          genres: genres,
          pathLossy: lossyPath,
          pathLossless: losslessPath,
          duration: metadata.format.duration,
          album: savedAlbum,
        });

        console.log('Transcoding to wav...');
        const wavPath = 'uploads/audio/lossless/' + baseMd5 + '.wav';
        await promisifiedExec(`ffmpeg -y -i ${losslessPath} ${wavPath}`);

        console.log('Calculating MAX Audio Embedding...');
        exec(
          `curl -X POST "host.docker.internal:5001/model/predict" -H  "accept: application/json" -H  "Content-Type: multipart/form-data" -F "audio=@${wavPath};type=audio/x-wav"`,
          async (error, stdout) => {
            if (error) {
              console.log(error);
            }

            const maxResponse: MaxAudioEmbedding = JSON.parse(stdout);
            const maxEmbedding = maxResponse.embedding.splice(0, 10).flat();

            console.log('Deleting transcoded wav...');
            unlinkSync(wavPath);

            const mrsIndex = this.mrsRepo.create({
              songId: song,
              maxEmbedding: maxEmbedding,
            });

            await this.mrsRepo.save(mrsIndex);
          },
        );
        await queryRunner.manager.save(song);

        savedSongs.push(song);
      }

      // album duration
      let albumDuration = 0;
      savedSongs.forEach((savedSong) => {
        albumDuration += savedSong.duration;
      });
      savedAlbum.duration = albumDuration;
      await queryRunner.manager.save(savedAlbum);

      await queryRunner.commitTransaction();

      // build annoy index

      const annoyIndex = new Annoy(1280, 'angular');

      this.mrsRepo.find().then((indices) => {
        indices.map((index) => {
          annoyIndex.addItem(index.id, index.maxEmbedding);
        });
        annoyIndex.build();
        annoyIndex.save('src/mrs/mrs.ann');
      });

      return savedAlbum;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }
}
