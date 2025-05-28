import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AtributosTablaController } from './atributos-tabla.controller';
import { AtributosTablaService } from '../../services/atributos-tabla/atributos-tabla.service';
import { FiltrosSortingDto } from 'src/common/dto/filtros-sorting.dto';
import { CreateAtributosTablaDto } from '../../dto/create-atributos-tabla.dto';
import { UpdateAtributosTablaDto } from '../../dto/update-atributos-tabla.dto';
import { FiltroAtributosTablaDto } from '../../dto/filtro-atributos-tabla.dto';

describe('AtributosTablaController', () => {
  let controller: AtributosTablaController;
  let service: AtributosTablaService;

  const mockAtributosTablaService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AtributosTablaController],
      providers: [
        {
          provide: AtributosTablaService,
          useValue: mockAtributosTablaService,
        },
      ],
    })
      .overrideProvider(AtributosTablaService)
      .useValue(mockAtributosTablaService)
      .compile();

    controller = module.get<AtributosTablaController>(AtributosTablaController);
    service = module.get<AtributosTablaService>(AtributosTablaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of atributos', async () => {
      const mockResult = {
        response: [{ _id: '1', nombre: 'Atributo 1' }],
        paginacion: { total: 1, pagina: 1, size: 10, paginas: 1 },
      };
      const mockRequest: FiltrosSortingDto<FiltroAtributosTablaDto> = {
        filtros: { nombre: 'Atributo' },
        paginacion: { pagina: 1, size: 10 },
        sorting: { nombre: 'ASC' },
      };
      mockAtributosTablaService.findAll.mockResolvedValue(mockResult);
      const result = await controller.findAll('entidad1', mockRequest);
      expect(service.findAll).toHaveBeenCalledWith(
        'entidad1',
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
    it('should create a new atributo and return it', async () => {
      const createDto: CreateAtributosTablaDto = {
        nombre: 'Nuevo Atributo',
        usuarioCreacion: 'user',
      } as any;
      const mockRequest: FiltrosSortingDto<CreateAtributosTablaDto> = { data: createDto };
      const mockResult = { response: { _id: '123', ...createDto } };
      mockAtributosTablaService.create.mockResolvedValue(mockResult);
      const result = await controller.create('entidad1', mockRequest);
      expect(service.create).toHaveBeenCalledWith('entidad1', createDto);
      expect(result.data).toEqual(mockResult);
      expect(result.status.statusCode).toEqual(200);
    });
    it('should throw BadRequestException if data is not provided', async () => {
      const mockRequest: FiltrosSortingDto<CreateAtributosTablaDto> = {} as any;
      await expect(controller.create('entidad1', mockRequest)).rejects.toThrow(BadRequestException);
      expect(service.create).not.toHaveBeenCalled();
    });
    it('should throw BadRequestException if idEntidad is not provided', async () => {
      const mockRequest: FiltrosSortingDto<CreateAtributosTablaDto> = {
        data: { nombre: 'A', usuarioCreacion: 'u' } as any,
      };
      await expect(controller.create(undefined as any, mockRequest)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an atributo and return it', async () => {
      const idEntidad = 'entidad1';
      const _id = '123';
      const updateDto: UpdateAtributosTablaDto = {
        nombre: 'Atributo Actualizado',
        usuarioActualizacion: 'user',
      } as any;
      const mockRequest: FiltrosSortingDto<UpdateAtributosTablaDto & { _id: string }> = {
        data: { _id, ...updateDto },
      };
      const mockResult = { response: { _id, ...updateDto } };
      mockAtributosTablaService.update.mockResolvedValue(mockResult);
      const result = await controller.update(idEntidad, mockRequest);
      expect(service.update).toHaveBeenCalledWith(idEntidad, _id, updateDto);
      expect(result.data).toEqual(mockResult);
      expect(result.status.statusCode).toEqual(200);
    });
    it('should throw BadRequestException if idEntidad is not provided', async () => {
      const mockRequest: FiltrosSortingDto<UpdateAtributosTablaDto & { _id: string }> = {
        data: { _id: '1', nombre: 'A', usuarioActualizacion: 'u' } as any,
      };
      await expect(controller.update(undefined as any, mockRequest)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.update).not.toHaveBeenCalled();
    });
    it('should throw BadRequestException if data is not provided', async () => {
      await expect(controller.update('entidad1', {} as any)).rejects.toThrow(BadRequestException);
      expect(service.update).not.toHaveBeenCalled();
    });
    it('should throw BadRequestException if _id is not provided', async () => {
      const mockRequest: FiltrosSortingDto<UpdateAtributosTablaDto & { _id: string }> = {
        data: { nombre: 'A', usuarioActualizacion: 'u' } as any,
      };
      await expect(controller.update('entidad1', mockRequest)).rejects.toThrow(BadRequestException);
      expect(service.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an atributo and return true', async () => {
      const idEntidad = 'entidad1';
      const _id = '123';
      const mockRequest: FiltrosSortingDto<{ _id: string }> = { data: { _id } };
      const mockResult = { result: true };
      mockAtributosTablaService.remove.mockResolvedValue(mockResult);
      const result = await controller.remove(idEntidad, mockRequest);
      expect(service.remove).toHaveBeenCalledWith(idEntidad, _id);
      expect(result).toEqual(mockResult);
    });

    it('should throw BadRequestException if idEntidad is not provided', async () => {
      const mockRequest: FiltrosSortingDto<{ _id: string }> = { data: { _id: '1' } };
      try {
        await controller.remove(undefined as any, mockRequest);
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toContain('idEntidad es requerido');
      }
    });

    it('should throw BadRequestException if data is not provided', async () => {
      try {
        await controller.remove('entidad1', {} as any);
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toContain('Data es requerido');
      }
    });

    it('should throw BadRequestException if _id is not provided', async () => {
      const mockRequest: FiltrosSortingDto<{ _id: string }> = { data: {} as any };
      try {
        await controller.remove('entidad1', mockRequest);
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toContain('id atributo tabla es requerido');
      }
    });
  });
});
