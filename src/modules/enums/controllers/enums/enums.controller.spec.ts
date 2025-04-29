import { Test, TestingModule } from '@nestjs/testing';
import { EnumsController } from './enums.controller';

describe('EnumsController', () => {
  let controller: EnumsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnumsController],
    }).compile();

    controller = module.get<EnumsController>(EnumsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
