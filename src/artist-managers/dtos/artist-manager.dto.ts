import { Expose } from 'class-transformer';

export class ArtistManagerDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  verified: boolean;

  @Expose()
  documents: string;
}
