import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { SigninDto } from '../users/dtos/signin.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentAdmin } from './decorators/current-admin.decorator';
import { Admin } from './admin.entity';
import { Serialize } from '../interceptor/serialize.interceptor';
import { AdminDto } from './dtos/admin.dto';

@Controller('admins')
@Serialize(AdminDto)
export class AdminsController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signup(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signup(
      {
        email: body.email,
        username: body.username,
        password: body.password,
      },
      'admin',
    );
    session.userId = user.id;
    return user;
  }

  @Post('/signin')
  async signin(@Body() body: SigninDto, @Session() session: any) {
    const user = await this.authService.signin(
      { email: body.email, password: body.password },
      'admin',
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
  whoAmI(@CurrentAdmin() admin: Admin) {
    if (!admin) {
      throw new NotFoundException();
    }
    return admin;
  }
}
