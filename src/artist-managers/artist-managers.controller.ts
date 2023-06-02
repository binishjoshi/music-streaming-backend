import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  ParseFilePipe,
  Post,
  Session,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

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

@Controller('artist-managers')
export class ArtistManagersController {
  constructor(
    private authService: AuthService,
    private artistManagersRequestService: ArtistManagerRequestsService,
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

    this.artistManagersRequestService.create(
      body.letter,
      documents,
      artistManager,
    );
  }
}
