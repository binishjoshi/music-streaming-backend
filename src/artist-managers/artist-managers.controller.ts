import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Session,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QueryFailedError } from 'typeorm';

import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { SigninDto } from '../users/dtos/signin.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentArtistManager } from './decorators/current-artist-manager.decorator';
import { ArtistManger } from './artist-manager.entity';
import { ArtistManagerRequestsService } from './artist-manager-requests.service';
import { CurrentAdmin } from '../admins/decorators/current-admin.decorator';
import { Admin } from '../admins/admin.entity';
import { ImageValidationPipe } from '../pipes/image-validation.pipe';
import { FileType } from '../types/file.type';
import { ArtistManagersService } from './artist-managers.service';

@Controller('artist-managers')
export class ArtistManagersController {
  constructor(
    private authService: AuthService,
    private artistManagersRequestService: ArtistManagerRequestsService,
    private artistManagersService: ArtistManagersService,
  ) {}

  @Post('/signup')
  async signup(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signup(
      {
        email: body.email,
        username: body.username,
        password: body.password,
      },
      'artistManager',
    );
    session.userId = user.id;
    return user;
  }

  @Post('/signin')
  async signin(@Body() body: SigninDto, @Session() session: any) {
    const user = await this.authService.signin(
      { email: body.email, password: body.password },
      'artistManager',
    );
    session.userId = user.id;
    return user;
  }

  @Post('signout')
  signout(@Session() session: any) {
    session.userId = null;
  }

  @Get('whoami')
  @UseGuards(AuthGuard)
  whoAmI(@CurrentArtistManager() artistManager: ArtistManger) {
    if (!artistManager) {
      throw new NotFoundException();
    }
    return artistManager;
  }

  @Get('requests')
  @UseGuards(AuthGuard)
  fetchRequests(@CurrentAdmin() admin: Admin) {
    if (!admin) {
      throw new ForbiddenException();
    }
    return this.artistManagersRequestService.fetchAll();
  }

  @Patch('requests/verify/:id')
  @UseGuards(AuthGuard)
  async verify(@Param('id') id: string, @CurrentAdmin() admin: Admin) {
    if (!admin) {
      throw new ForbiddenException();
    }

    let request;
    try {
      request = await this.artistManagersRequestService.findById(id);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new NotFoundException();
      }
      throw new InternalServerErrorException();
    }

    if (!request) {
      throw new NotFoundException();
    }

    this.artistManagersRequestService.verify(request, admin);
  }

  @Post('request-for-verification')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('documents'))
  requestForVerification(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 25 * 1024 * 1024 })],
      }),
      new ImageValidationPipe(),
    )
    documents: FileType,
    @CurrentArtistManager() artistManager: ArtistManger,
    @Body() body,
  ) {
    if (!artistManager) {
      throw new ForbiddenException();
    }

    return this.artistManagersRequestService.create(
      body.letter,
      documents,
      artistManager,
    );
  }

  @Get('artists')
  @UseGuards(AuthGuard)
  fetchManagingArtists(@CurrentArtistManager() artistManager: ArtistManger) {
    if (!artistManager) {
      throw new ForbiddenException();
    }
    return this.artistManagersService.fetchArtists(artistManager);
  }
}
