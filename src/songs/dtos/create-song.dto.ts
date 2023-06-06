import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSongDto {
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  title: string;

  @IsString()
  genres: string[];
}
