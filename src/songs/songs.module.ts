import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';
import { Song } from './song.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Song])],
  controllers: [SongsController],
  providers: [SongsService],
})
export class SongsModule {}
