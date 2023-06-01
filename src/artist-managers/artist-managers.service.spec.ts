import { Test, TestingModule } from '@nestjs/testing';
import { ArtistManagersService } from './artist-managers.service';

describe('ArtistManagersService', () => {
  let service: ArtistManagersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArtistManagersService],
    }).compile();

    service = module.get<ArtistManagersService>(ArtistManagersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
