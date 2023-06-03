import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateArtistDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(52)
  name: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  @MaxLength(1024)
  description: string;
}
