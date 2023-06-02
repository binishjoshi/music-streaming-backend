import { MiddlewareConsumer, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { UsersModule } from '../users/users.module';
import { AuthService } from '../auth/auth.service';
import { ArtistManagersModule } from '../artist-managers/artist-managers.module';
import { Admin } from './admin.entity';
import { CurrentAdminMiddleware } from './middlewares/current-admin.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    forwardRef(() => UsersModule),
    forwardRef(() => ArtistManagersModule),
  ],
  controllers: [AdminsController],
  providers: [AdminsService, AuthService],
  exports: [AdminsService],
})
export class AdminsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentAdminMiddleware).forRoutes('*');
  }
}
