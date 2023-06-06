import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GenresService } from './genres.service';
import { Genre } from './genre.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Genre])],
  providers: [GenresService],
  exports: [GenresService],
})
export class GenresModule {}
