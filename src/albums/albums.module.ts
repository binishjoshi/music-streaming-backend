import { Module } from '@nestjs/common';
import { AlbumsController } from './albums.controller';
import { AlbumsService } from './albums.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Album } from './album.entity';
import { ArtistManagersModule } from '../artist-managers/artist-managers.module';
import { Song } from '../songs/song.entity';
import { ArtistsModule } from '../artists/artists.module';
import { GenresModule } from '../genres/genres.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Album, Song]),
    ArtistManagersModule,
    ArtistsModule,
    GenresModule,
  ],
  controllers: [AlbumsController],
  providers: [AlbumsService],
})
export class AlbumsModule {}
