import { Test, TestingModule } from '@nestjs/testing';
import { AtributosTablaController } from './atributos-tabla.controller';

describe('AtributosTablaController', () => {
  let controller: AtributosTablaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AtributosTablaController],
    }).compile();

    controller = module.get<AtributosTablaController>(AtributosTablaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
