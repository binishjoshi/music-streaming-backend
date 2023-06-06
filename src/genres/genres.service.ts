import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Genre } from './genre.entity';

@Injectable()
export class GenresService {
  constructor(@InjectRepository(Genre) private repo: Repository<Genre>) {}

  findGenresByNames(genreNames: string[]) {
    const genres: Genre[] = [];

    genreNames.forEach(async (genreName) => {
      const genre = await this.repo.findOne({
        where: {
          name: genreName,
        },
      });
      genres.push(genre);
    });

    return genres;
  }
}
