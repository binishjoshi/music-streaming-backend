import { exec } from 'child_process';
import path from 'path';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { parseFile } from 'music-metadata';

import { Album } from './album.entity';
import { ArtistManger } from '../artist-managers/artist-manager.entity';
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

@Injectable()
export class AlbumsService {
  constructor(
    @InjectRepository(Album) private repo: Repository<Album>,
    @InjectRepository(Song) private songRepo: Repository<Song>,
    private dataSource: DataSource,
    private artistManagersService: ArtistManagersService,
    private artistsService: ArtistsService,
    private genresService: GenresService,
  ) {}

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
      const artist = await this.artistsService.findOneById(body.artist);

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
        exec(`opusenc --bitrate 256 ${losslessPath} ${lossyPath}`, (error) => {
          if (error) {
            console.log(error);
          }
        });
        songsInformationArray.push({
          title: songDetails.songs[i].title,
          genres: songDetails.songs[i].genres,
          pathLossy: lossyPath,
          pathLossless: losslessPath,
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
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
