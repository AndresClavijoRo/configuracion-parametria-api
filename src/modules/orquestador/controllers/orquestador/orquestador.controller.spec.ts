import { Test, TestingModule } from '@nestjs/testing';
import { OrquestadorController } from './orquestador.controller';

describe('OrquestadorController', () => {
  let controller: OrquestadorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrquestadorController],
    }).compile();

    controller = module.get<OrquestadorController>(OrquestadorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
