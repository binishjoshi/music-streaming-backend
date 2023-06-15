import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { SongsService } from './songs.service';

@Controller('songs')
export class SongsController {
  constructor(private songsSerivce: SongsService) {}

  @Get('/url/:id')
  @UseGuards(AuthGuard)
  async getSongUrl(@Param('id') id: string, @CurrentUser() user: User) {
    const url = await this.songsSerivce.getSongUrl(id, user);
    return { url };
  }
}
