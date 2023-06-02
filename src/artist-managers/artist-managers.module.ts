import { MiddlewareConsumer, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtistManagersService } from './artist-managers.service';
import { ArtistManagersController } from './artist-managers.controller';
import { ArtistManger } from './artist-manager.entity';
import { AuthService } from '../auth/auth.service';
import { UsersModule } from '../users/users.module';
import { CurrentArtistManagerMiddleware } from './middlewares/current-artist-manager.middleware';
import { AdminsModule } from '../admins/admins.module';
import { ArtistManagerRequest } from './artist-manager-request.entity';
import { ArtistManagerRequestsService } from './artist-manager-requests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArtistManger, ArtistManagerRequest]),
    forwardRef(() => UsersModule),
    forwardRef(() => AdminsModule),
  ],
  providers: [ArtistManagersService, AuthService, ArtistManagerRequestsService],
  controllers: [ArtistManagersController],
  exports: [ArtistManagersService],
})
export class ArtistManagersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentArtistManagerMiddleware).forRoutes('*');
  }
}
