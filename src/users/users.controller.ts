import {
  Body,
  Controller,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  ParseFilePipe,
  Patch,
  Post,
  Session,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AuthService } from '../auth/auth.service';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserDto } from './dtos/user.dto';
import { SigninDto } from './dtos/signin.dto';
import { Serialize } from '../interceptor/serialize.interceptor';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './user.entity';
import { AuthGuard } from '../guards/auth.guard';
import { FileTypeValidationPipe } from '../pipes/file-type-validation.pipe';
import { FileType } from '../types/file.type';
import { ImageDownscalePipe } from '../pipes/image-downscale.pipe';

@Controller('users')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Get('/whoami')
  @UseGuards(AuthGuard)
  whoAmI(@CurrentUser() user: User) {
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  @Post('/signup')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signup(
      { email: body.email, username: body.username, password: body.password },
      'user',
    );
    session.userId = user.id;
    return user;
  }

  @Post('/signin')
  async signin(@Body() body: SigninDto, @Session() session: any) {
    const user = await this.authService.signin(
      { email: body.email, password: body.password },
      'user',
    );
    session.userId = user.id;
    return user;
  }

  @Post('signout')
  signout(@Session() session: any) {
    session.userId = null;
  }

  @Post('deactivate')
  @UseGuards(AuthGuard)
  async deactivate(
    @CurrentUser() user: User,
    @Session() session: any,
    @Body() body: SigninDto,
  ) {
    await this.authService.signin(
      { email: body.email, password: body.password },
      'user',
    );
    session.userId = null;
    this.usersService.delete(user);
  }

  @Patch('/change-preference')
  @UseGuards(AuthGuard)
  async changePrefernce(@CurrentUser() user: User) {
    await this.usersService.changePreference(user);
  }

  @Post('/change-profile')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('picture'))
  changeProfile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 8 * 1024 * 1024 })],
      }),
      new FileTypeValidationPipe('image'),
      new ImageDownscalePipe(),
    )
    file: FileType,
    @CurrentUser() user: User,
  ) {
    this.usersService.savePicture(file, user);
  }
}
