import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ModuloController } from './modulo.controller';
import { ModuloService } from '../../services/modulo/modulo.service';
import { FiltrosSortingDto } from 'src/common/dto/filtros-sorting.dto';
import { FiltroModuloDto } from '../../dto/filtro-modulo.dto';
import { CreateModuloDto } from '../../dto/create-modulo.dto';
import { UpdateModuloDto } from '../../dto/update-modulo.dto';
import { TipoConexion } from 'src/common/enums/tipo-conexion.enum';

describe('ModuloController', () => {
  let controller: ModuloController;
  let service: ModuloService;

  const mockModuloService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModuloController],
      providers: [
        {
          provide: ModuloService,
          useValue: mockModuloService,
        },
      ],
    }).compile();

    controller = module.get<ModuloController>(ModuloController);
    service = module.get<ModuloService>(ModuloService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of modules', async () => {
      // Arrange
      const mockResult = {
        response: [
          {
            _id: '1',
            nombre: 'Módulo 1',
            descripcion: 'Descripción del módulo 1',
            tipoConexion: TipoConexion.MONGODB,
            database: 'db1',
            apiEndpoint: '/api/endpoint1',
            activo: true,
          },
        ],
        paginacion: {
          total: 1,
          pagina: 1,
          size: 10,
          paginas: 1,
        },
      };

      const mockRequest: FiltrosSortingDto<FiltroModuloDto> = {
        filtros: { nombre: 'Módulo' },
        paginacion: { pagina: 1, size: 10 },
        sorting: { nombre: 'ASC' },
      };

      mockModuloService.findAll.mockResolvedValue(mockResult);

      // Act
      const result = await controller.findAll(mockRequest);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(
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
    it('should create a new module and return it', async () => {
      // Arrange
      const createDto: CreateModuloDto = {
        nombre: 'Nuevo Módulo',
        descripcion: 'Descripción del nuevo módulo',
        tipoConexion: TipoConexion.MONGODB,
        database: 'db_new',
        apiEndpoint: '/api/new',
        usuarioCreacion: 'user1',
        activo: true,
      };

      const mockRequest: FiltrosSortingDto<CreateModuloDto> = {
        data: createDto,
      };

      const mockResult = {
        response: {
          _id: '123',
          ...createDto,
          fechaCreacion: new Date(),
        },
      };

      mockModuloService.create.mockResolvedValue(mockResult);

      // Act
      const result = await controller.create(mockRequest);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result.data).toEqual(mockResult);
      expect(result.status.statusCode).toEqual(200);
    });

    it('should throw BadRequestException if data is not provided', async () => {
      // Arrange
      const mockRequest: FiltrosSortingDto<CreateModuloDto> = {};

      // Act & Assert
      await expect(controller.create(mockRequest)).rejects.toThrow(BadRequestException);
      expect(service.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a module and return it', async () => {
      // Arrange
      const id = '123';
      const updateDto: UpdateModuloDto = {
        nombre: 'Módulo Actualizado',
        descripcion: 'Descripción actualizada',
        usuarioActualizacion: 'user1',
      };

      const mockRequest: FiltrosSortingDto<UpdateModuloDto & { id: string }> = {
        data: {
          id,
          ...updateDto,
        },
      };

      const mockResult = {
        response: {
          _id: id,
          nombre: 'Módulo Actualizado',
          descripcion: 'Descripción actualizada',
          tipoConexion: TipoConexion.MONGODB,
          database: 'db1',
          apiEndpoint: '/api/endpoint1',
          activo: true,
          fechaActualizacion: new Date(),
          usuarioActualizacion: 'user1',
        },
      };

      mockModuloService.update.mockResolvedValue(mockResult);

      // Act
      const result = await controller.update(mockRequest);

      // Assert
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result.data).toEqual(mockResult);
      expect(result.status.statusCode).toEqual(200);
    });

    it('should throw BadRequestException if data is not provided', async () => {
      // Arrange
      const mockRequest: FiltrosSortingDto<UpdateModuloDto & { id: string }> = {};

      // Act & Assert
      await expect(controller.update(mockRequest)).rejects.toThrow(BadRequestException);
      expect(service.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a module and return true', async () => {
      // Arrange
      const id = '123';
      const mockRequest: FiltrosSortingDto<{ id: string }> = {
        data: { id },
      };

      const mockResult = {
        response: true,
      };

      mockModuloService.remove.mockResolvedValue(mockResult);

      // Act
      const result = await controller.remove(mockRequest);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result.data).toEqual(mockResult);
      expect(result.status.statusCode).toEqual(200);
    });

    it('should throw BadRequestException if data is not provided', async () => {
      // Arrange
      const mockRequest: FiltrosSortingDto<{ id: string }> = {};

      // Act & Assert
      await expect(controller.remove(mockRequest)).rejects.toThrow(BadRequestException);
      expect(service.remove).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a module by id', async () => {
      // Arrange
      const id = '123';
      const mockRequest: FiltrosSortingDto<{ id: string }> = {
        data: { id },
      };

      const mockResult = {
        response: {
          _id: id,
          nombre: 'Módulo 1',
          descripcion: 'Descripción del módulo 1',
          tipoConexion: TipoConexion.MONGODB,
          database: 'db1',
          apiEndpoint: '/api/endpoint1',
          activo: true,
        },
      };

      mockModuloService.findOne.mockResolvedValue(mockResult);

      // Act
      const result = await controller.findOne(mockRequest);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result.data).toEqual(mockResult);
      expect(result.status.statusCode).toEqual(200);
    });

    it('should throw BadRequestException if data is not provided', async () => {
      // Arrange
      const mockRequest: FiltrosSortingDto<{ id: string }> = {};

      // Act & Assert
      await expect(controller.findOne(mockRequest)).rejects.toThrow(BadRequestException);
      expect(service.findOne).not.toHaveBeenCalled();
    });
  });
});
