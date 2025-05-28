import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EntidadController } from './entidad.controller';
import { EntidadService } from '../../services/entidad/entidad.service';
import { FiltrosSortingDto } from 'src/common/dto/filtros-sorting.dto';
import { FiltroEntidadDto } from '../../dto/filtro-entidad.dto';
import { CreateEntidadDto } from '../../dto/create-entidad.dto';
import { UpdateEntidadDto } from '../../dto/update-entidad.dto';

describe('EntidadController', () => {
  let controller: EntidadController;
  let service: EntidadService;

  const mockEntidadService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntidadController],
      providers: [
        {
          provide: EntidadService,
          useValue: mockEntidadService,
        },
      ],
    }).compile();

    controller = module.get<EntidadController>(EntidadController);
    service = module.get<EntidadService>(EntidadService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of entidades', async () => {
      const mockResult = {
        response: [{ _id: '1', nombre: 'Entidad 1' }],
        paginacion: { total: 1, pagina: 1, size: 10, paginas: 1 },
      };
      const mockRequest: FiltrosSortingDto<FiltroEntidadDto> = {
        filtros: { nombre: 'Entidad' },
        paginacion: { pagina: 1, size: 10 },
        sorting: { nombre: 'ASC' },
      };
      mockEntidadService.findAll.mockResolvedValue(mockResult);
      const result = await controller.findAll('modulo1', mockRequest);
      expect(service.findAll).toHaveBeenCalledWith(
        'modulo1',
        mockRequest.filtros,
        mockRequest.paginacion?.pagina,
        mockRequest.paginacion?.size,
        mockRequest.sorting,
      );
      expect(result.data).toEqual(mockResult);
      expect(result.status.statusCode).toEqual(200);
    });
  });

  describe('create', () => {
    it('should create a new entidad and return it', async () => {
      const createDto: CreateEntidadDto = { nombre: 'Nueva Entidad' } as any;
      const mockRequest: FiltrosSortingDto<CreateEntidadDto> = { data: createDto };
      const mockResult = { response: { _id: '123', ...createDto } };
      mockEntidadService.create.mockResolvedValue(mockResult);
      const result = await controller.create('modulo1', mockRequest);
      expect(service.create).toHaveBeenCalledWith('modulo1', createDto);
      expect(result.data).toEqual(mockResult);
      expect(result.status.statusCode).toEqual(200);
    });
    it('should throw BadRequestException if data is not provided', async () => {
      const mockRequest: FiltrosSortingDto<CreateEntidadDto> = {} as any;
      await expect(controller.create('modulo1', mockRequest)).rejects.toThrow(BadRequestException);
      expect(service.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an entidad and return it', async () => {
      const idModulo = 'modulo1';
      const _id = '123';
      const updateDto: UpdateEntidadDto = { nombre: 'Entidad Actualizada' } as any;
      const mockRequest: FiltrosSortingDto<UpdateEntidadDto & { _id: string }> = {
        data: { _id, ...updateDto },
      };
      const mockResult = { response: { _id, ...updateDto } };
      mockEntidadService.update.mockResolvedValue(mockResult);
      const result = await controller.update(idModulo, mockRequest);
      expect(service.update).toHaveBeenCalledWith(idModulo, _id, updateDto);
      expect(result.data).toEqual(mockResult);
      expect(result.status.statusCode).toEqual(200);
    });
    it('should throw BadRequestException if idModulo is not provided', async () => {
      const mockRequest: FiltrosSortingDto<UpdateEntidadDto & { _id: string }> = {
        data: { _id: '1' } as any,
      };
      await expect(controller.update(undefined as any, mockRequest)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.update).not.toHaveBeenCalled();
    });
    it('should throw BadRequestException if data is not provided', async () => {
      await expect(controller.update('modulo1', {} as any)).rejects.toThrow(BadRequestException);
      expect(service.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an entidad and return true', async () => {
      const _id = '123';
      const mockRequest: FiltrosSortingDto<{ _id: string }> = { data: { _id } };
      const mockResult = { response: true };
      mockEntidadService.remove.mockResolvedValue(mockResult);
      const result = await controller.remove(mockRequest);
      expect(service.remove).toHaveBeenCalledWith(_id);
      expect(result.data).toEqual(mockResult);
      expect(result.status.statusCode).toEqual(200);
    });
    it('should throw BadRequestException if data is not provided', async () => {
      const mockRequest: FiltrosSortingDto<{ _id: string }> = {} as any;
      await expect(controller.remove(mockRequest)).rejects.toThrow(BadRequestException);
      expect(service.remove).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an entidad by id', async () => {
      const _id = '123';
      const mockRequest: FiltrosSortingDto<{ _id: string }> = { data: { _id } };
      const mockResult = { response: { _id, nombre: 'Entidad 1' } };
      mockEntidadService.findOne.mockResolvedValue(mockResult);
      const result = await controller.findOne(mockRequest);
      expect(service.findOne).toHaveBeenCalledWith(_id);
      expect(result.data).toEqual(mockResult);
      expect(result.status.statusCode).toEqual(200);
    });
    it('should throw BadRequestException if data is not provided', async () => {
      const mockRequest: FiltrosSortingDto<{ _id: string }> = {} as any;
      await expect(controller.findOne(mockRequest)).rejects.toThrow(BadRequestException);
      expect(service.findOne).not.toHaveBeenCalled();
    });
  });
});
