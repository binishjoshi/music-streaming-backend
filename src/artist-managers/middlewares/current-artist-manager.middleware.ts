/* eslint-disable @typescript-eslint/no-namespace */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { ArtistManger } from '../artist-manager.entity';
import { ArtistManagersService } from '../artist-managers.service';

declare global {
  namespace Express {
    interface Request {
      currentArtistManager?: ArtistManger;
    }
  }
}

@Injectable()
export class CurrentArtistManagerMiddleware implements NestMiddleware {
  constructor(private artistManagersService: ArtistManagersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.session || {};

    if (userId) {
      const user = await this.artistManagersService.findUserById(userId);
      req.currentArtistManager = user;
    }

    next();
  }
}
