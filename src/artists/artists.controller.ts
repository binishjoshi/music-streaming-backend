import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CreateArtistDto } from './dtos/create-artist.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentArtistManager } from '../artist-managers/decorators/current-artist-manager.decorator';
import { ArtistManger } from '../artist-managers/artist-manager.entity';
import { FileTypeValidationPipe } from '../pipes/file-type-validation.pipe';
import { FileType } from '../types/file.type';
import { ImageDownscalePipe } from '../pipes/image-downscale.pipe';
import { ArtistsService } from './artists.service';
import { UpdateArtistDto } from './dtos/update-artist.dto';
// import { Serialize } from '../interceptor/serialize.interceptor';
// import { ArtistDto } from './dtos/artist.dto';

@Controller('artists')
// @Serialize(ArtistDto)
export class ArtistsController {
  constructor(private artistsService: ArtistsService) {}

  @Get()
  fetch() {
    return this.artistsService.find();
  }

  @Get(':id')
  getArtistById(@Param('id') id: string) {
    return this.artistsService.findOneById(id);
  }

  @Post('/create')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('picture'))
  async create(
    @CurrentArtistManager() artistManager: ArtistManger,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 25 * 1024 * 1024 })],
      }),
      new FileTypeValidationPipe('image'),
      new ImageDownscalePipe(),
    )
    picture: FileType,
    @Body() body: CreateArtistDto,
  ) {
    if (!artistManager) {
      throw new ForbiddenException();
    }

    return this.artistsService.create(
      body.name,
      body.description,
      picture,
      artistManager,
    );
  }

  @Patch('/:id')
  @UseGuards(AuthGuard)
  updateArtist(
    @CurrentArtistManager() artistManager: ArtistManger,
    @Param('id') id,
    @Body() body: UpdateArtistDto,
  ) {
    if (!artistManager) {
      throw new ForbiddenException();
    }

    return this.artistsService.update(id, body, artistManager);
  }

  @Post('/change-picture/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('picture'))
  changePicture(
    @CurrentArtistManager() artistManager: ArtistManger,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 25 * 1024 * 1024 })],
      }),
      new FileTypeValidationPipe('image'),
      new ImageDownscalePipe(),
    )
    picture: FileType,
    @Param('id') id: string,
  ) {
    if (!artistManager) {
      throw new ForbiddenException();
    }

    return this.artistsService.changePicture(picture, artistManager, id);
  }
}
