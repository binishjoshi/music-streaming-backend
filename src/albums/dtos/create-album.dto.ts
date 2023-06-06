import { Type } from 'class-transformer';
import { IsDate, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAlbumDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  name: string;

  @IsString()
  type: 'album' | 'single' | 'ep';

  @IsString()
  artist: string;

  @Type(() => Date)
  @IsDate()
  releaseDate: Date;

  @IsString()
  songDetails;
}
