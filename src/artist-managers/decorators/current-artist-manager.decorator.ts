import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const CurrentArtistManager = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (!request.currentArtistManager) {
      throw new UnauthorizedException();
    }

    return request.currentArtistManager;
  },
);
