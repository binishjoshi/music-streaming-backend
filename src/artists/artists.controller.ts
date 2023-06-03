import {
  Body,
  Controller,
  ForbiddenException,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { CreateArtistDto } from './dtos/create-artist.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentArtistManager } from '../artist-managers/decorators/current-artist-manager.decorator';
import { ArtistManger } from '../artist-managers/artist-manager.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from '../pipes/image-validation.pipe';
import { FileType } from '../types/file.type';
import { ImageDownscalePipe } from '../pipes/image-downscale.pipe';
import { ArtistsService } from './artists.service';

@Controller('artists')
export class ArtistsController {
  constructor(private artistsService: ArtistsService) {}

  @Post('/create')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('picture'))
  async create(
    @CurrentArtistManager() artistManager: ArtistManger,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 25 * 1024 * 1024 })],
      }),
      new ImageValidationPipe(),
      new ImageDownscalePipe(),
    )
    picture: FileType,
    @Body() body: CreateArtistDto,
  ) {
    if (!artistManager) {
      throw new ForbiddenException();
    }

    this.artistsService.create(
      body.name,
      body.description,
      picture,
      artistManager,
    );
  }
}
