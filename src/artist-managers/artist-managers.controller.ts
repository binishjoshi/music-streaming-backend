import { Body, Controller, Post, Session } from '@nestjs/common';

import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { SigninDto } from '../users/dtos/signin.dto';

@Controller('artist-managers')
export class ArtistManagersController {
  constructor(private authService: AuthService) {}

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
}
