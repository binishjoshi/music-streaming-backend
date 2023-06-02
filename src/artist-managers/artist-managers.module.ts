import { MiddlewareConsumer, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtistManagersService } from './artist-managers.service';
import { ArtistManagersController } from './artist-managers.controller';
import { ArtistManger } from './artist-manager.entity';
import { AuthService } from '../auth/auth.service';
import { UsersModule } from '../users/users.module';
import { CurrentArtistManagerMiddleware } from './middlewares/current-artist-manager.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArtistManger]),
    forwardRef(() => UsersModule),
  ],
  providers: [ArtistManagersService, AuthService],
  controllers: [ArtistManagersController],
  exports: [ArtistManagersService],
})
export class ArtistManagersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentArtistManagerMiddleware).forRoutes('*');
  }
}
