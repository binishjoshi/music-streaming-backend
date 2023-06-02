/* eslint-disable @typescript-eslint/no-namespace */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { Admin } from '../admin.entity';
import { AdminsService } from '../admins.service';

declare global {
  namespace Express {
    interface Request {
      currentAdmin?: Admin;
    }
  }
}

@Injectable()
export class CurrentAdminMiddleware implements NestMiddleware {
  constructor(private adminsService: AdminsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.session || {};

    if (userId) {
      const user = await this.adminsService.findUserById(userId);
      req.currentAdmin = user;
    }

    next();
  }
}
