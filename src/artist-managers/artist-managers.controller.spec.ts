import { Test, TestingModule } from '@nestjs/testing';
import { ArtistManagersController } from './artist-managers.controller';

describe('ArtistManagersController', () => {
  let controller: ArtistManagersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistManagersController],
    }).compile();

    controller = module.get<ArtistManagersController>(ArtistManagersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
