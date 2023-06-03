import { Expose } from 'class-transformer';

import { Album } from '../../albums/album.entity';

export class ArtistDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  picture: string;

  @Expose()
  description: string;

  @Expose()
  albums: Album[];
}
