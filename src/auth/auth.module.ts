import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { ArtistManagersModule } from '../artist-managers/artist-managers.module';
import { AdminsModule } from '../admins/admins.module';

@Module({
  imports: [UsersModule, ArtistManagersModule, AdminsModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
