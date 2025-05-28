import { Test, TestingModule } from '@nestjs/testing';
import { EnumsController } from './enums.controller';
import { EnumsService } from '../../services/enums/enums.service';
import { ResponseDto } from 'src/common/dto/response.dto';

describe('EnumsController', () => {
  let controller: EnumsController;
  let enumsService: { getEnums: jest.Mock; getEnum: jest.Mock };

  beforeEach(async () => {
    const mockEnumsService = {
      getEnums: jest.fn(),
      getEnum: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnumsController],
      providers: [
        {
          provide: EnumsService,
          useFactory: () => mockEnumsService,
        },
      ],
    }).compile();

    controller = module.get<EnumsController>(EnumsController);
    enumsService = module.get(EnumsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getEnums', () => {
    it('should return all enums wrapped in ResponseDto', () => {
      const enumsMock = { response: { foo: ['A', 'B'], bar: [1, 2] } };
      enumsService.getEnums.mockReturnValue(enumsMock);
      const result = controller.getEnums();
      expect(result).toEqual(new ResponseDto(enumsMock));
      expect(enumsService.getEnums).toHaveBeenCalled();
    });
  });

  describe('getEnum', () => {
    it('should return the requested enum wrapped in ResponseDto', () => {
      const enumName = 'foo';
      const enumValues = { response: ['A', 'B'] };
      enumsService.getEnum.mockReturnValue(enumValues);
      const result = controller.getEnum(enumName);
      expect(result).toEqual(new ResponseDto(enumValues));
      expect(enumsService.getEnum).toHaveBeenCalledWith(enumName);
    });
  });
});
