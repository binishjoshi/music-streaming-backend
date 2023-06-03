import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateArtistDto {
  @IsString()
  @MinLength(1)
  @MaxLength(52)
  name: string;

  @IsString()
  @MinLength(8)
  @MaxLength(1024)
  description: string;
}
