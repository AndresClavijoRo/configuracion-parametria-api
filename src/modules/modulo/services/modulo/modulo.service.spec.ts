import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { TipoConexion } from '../../../../common/enums/tipo-conexion.enum';
import { CreateModuloDto } from '../../dto/create-modulo.dto';
import { FiltroModuloDto } from '../../dto/filtro-modulo.dto';
import { UpdateModuloDto } from '../../dto/update-modulo.dto';
import { Modulo } from '../../schemas/modulo.schema';
import { ModuloService } from './modulo.service';

describe('ModuloService', () => {
  let service: ModuloService;
  let mockModuloModel: any;

  // Datos de prueba
  const mockModuloData = {
    _id: '507f1f77bcf86cd799439011',
    nombre: 'Módulo Test',
    descripcion: 'Descripción de prueba',
    tipoConexion: TipoConexion.ORACLE,
    database: 'test_db',
    apiEndpoint: 'http://localhost:3000/api',
    activo: true,
    entidades: [],
    fechaCreacion: new Date(),
    usuarioCreacion: 'test_user',
  };

  const mockCreateModuloDto: CreateModuloDto = {
    nombre: 'Nuevo Módulo',
    descripcion: 'Nueva descripción',
    tipoConexion: TipoConexion.POSTGRES,
    database: 'nueva_db',
    apiEndpoint: 'http://localhost:3000/api/nuevo',
    activo: true,
    usuarioCreacion: 'test_user',
  };

  beforeEach(async () => {
    // Mock completo para la cadena de métodos de Mongoose
    const mockQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const mockCountQuery = {
      exec: jest.fn(),
    };

    // Mock del constructor del modelo
    const mockModelInstance = {
      save: jest.fn(),
      toObject: jest.fn(),
    };

    // El modelo debe ser una función constructora que retorna la instancia mock
    const MockModuloModel: any = jest.fn(function (this: any, ...args: any[]) {
      Object.assign(this, mockModelInstance);
    });
    // Métodos estáticos
    MockModuloModel.find = jest.fn().mockReturnValue(mockQuery);
    MockModuloModel.findById = jest.fn().mockReturnValue(mockQuery);
    MockModuloModel.findOne = jest.fn().mockReturnValue(mockQuery);
    MockModuloModel.findByIdAndUpdate = jest.fn().mockReturnValue(mockQuery);
    MockModuloModel.countDocuments = jest.fn().mockReturnValue(mockCountQuery);

    // Permitir sobrescribir el constructor en los tests
    MockModuloModel.mockImplementation = (impl: any) => {
      MockModuloModel.mockImplementationOnce(impl);
    };

    mockModuloModel = MockModuloModel;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuloService,
        {
          provide: getModelToken(Modulo.name),
          useValue: mockModuloModel,
        },
      ],
    }).compile();

    service = module.get<ModuloService>(ModuloService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definición del servicio', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('debería retornar lista de módulos con paginación', async () => {
      const mockModulos = [mockModuloData];
      const mockTotal = 1;

      // Configurar mocks para la consulta principal
      const mockQuery = mockModuloModel.find();
      mockQuery.exec.mockResolvedValue(mockModulos);

      // Configurar mock para countDocuments
      const mockCountQuery = mockModuloModel.countDocuments();
      mockCountQuery.exec.mockResolvedValue(mockTotal);

      const result = await service.findAll();

      expect(result).toEqual({
        response: mockModulos,
        paginacion: {
          total: mockTotal,
          pagina: 1,
          size: 10,
          paginas: 1,
        },
      });

      expect(mockModuloModel.find).toHaveBeenCalledWith({ activo: true });
      expect(mockQuery.sort).toHaveBeenCalledWith({ fechaCreacion: -1 });
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.select).toHaveBeenCalledWith('-entidades -__v');
    });

    it('debería aplicar filtros correctamente', async () => {
      const filtros: FiltroModuloDto = {
        nombre: 'Test',
        tipoConexion: 'oracle',
      };

      const mockQuery = mockModuloModel.find();
      mockQuery.exec.mockResolvedValue([]);

      const mockCountQuery = mockModuloModel.countDocuments();
      mockCountQuery.exec.mockResolvedValue(0);

      await service.findAll(filtros);

      expect(mockModuloModel.find).toHaveBeenCalledWith({
        activo: true,
        nombre: { $regex: 'Test', $options: 'i' },
        tipoConexion: 'oracle',
      });
    });

    it('debería manejar paginación personalizada', async () => {
      const mockQuery = mockModuloModel.find();
      mockQuery.exec.mockResolvedValue([]);

      const mockCountQuery = mockModuloModel.countDocuments();
      mockCountQuery.exec.mockResolvedValue(0);

      await service.findAll(undefined, 2, 5);

      expect(mockQuery.skip).toHaveBeenCalledWith(5); // (2-1) * 5
      expect(mockQuery.limit).toHaveBeenCalledWith(5);
    });
  });

  describe('create', () => {
    it('debería crear un módulo exitosamente', async () => {
      // Mock para verificar nombre duplicado
      const mockFindOneQuery = mockModuloModel.findOne();
      mockFindOneQuery.exec.mockResolvedValue(null);

      // Mock para el nuevo módulo
      const mockNewModulo = {
        save: jest.fn().mockResolvedValue({
          toObject: jest.fn().mockReturnValue({
            ...mockCreateModuloDto,
            _id: '507f1f77bcf86cd799439012',
            entidades: [],
            fechaCreacion: new Date(),
          }),
        }),
      };

      mockModuloModel.mockReturnValue(mockNewModulo);

      const result = await service.create(mockCreateModuloDto);

      expect(result.response).toEqual(
        expect.objectContaining({
          nombre: mockCreateModuloDto.nombre,
          descripcion: mockCreateModuloDto.descripcion,
        }),
      );

      expect(mockModuloModel.findOne).toHaveBeenCalledWith({
        nombre: mockCreateModuloDto.nombre,
      });
      expect(mockNewModulo.save).toHaveBeenCalled();
    });

    it('debería lanzar error si ya existe un módulo con el mismo nombre', async () => {
      const mockFindOneQuery = mockModuloModel.findOne();
      mockFindOneQuery.exec.mockResolvedValue(mockModuloData);

      await expect(service.create(mockCreateModuloDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(mockCreateModuloDto)).rejects.toThrow(
        'Ya existe una entidad con el mismo nombre',
      );
    });
  });

  describe('findOne', () => {
    it('debería retornar un módulo por ID', async () => {
      const moduleId = '507f1f77bcf86cd799439011';

      const mockQuery = mockModuloModel.findById();
      mockQuery.exec.mockResolvedValue(mockModuloData);

      const result = await service.findOne(moduleId);

      expect(result).toEqual({ response: mockModuloData });
      expect(mockModuloModel.findById).toHaveBeenCalledWith(moduleId);
      expect(mockQuery.select).toHaveBeenCalledWith('-entidades -__v');
    });

    it('debería retornar null si no encuentra el módulo', async () => {
      const moduleId = 'nonexistent';

      const mockQuery = mockModuloModel.findById();
      mockQuery.exec.mockResolvedValue(null);

      const result = await service.findOne(moduleId);

      expect(result).toEqual({ response: null, mensaje: 'Modulo no encontrado' });
    });
  });
  describe('update', () => {
    it('debería actualizar un módulo exitosamente', async () => {
      const moduleId = '507f1f77bcf86cd799439011';
      const updateDto: UpdateModuloDto = {
        nombre: 'Módulo Actualizado',
        descripcion: 'Descripción actualizada',
        usuarioActualizacion: 'admin',
      };

      // Reseteamos mocks primero
      jest.clearAllMocks();

      // Creamos los mocks en orden
      // 1. findById: Necesitamos que encuentre el módulo existente
      mockModuloModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockModuloData),
      });

      // 2. findByIdAndUpdate: Simulamos la actualización exitosa
      const mockUpdatedModuleObject = {
        ...mockModuloData,
        ...updateDto,
        entidades: [],
        __v: 0,
      };

      mockModuloModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          toObject: jest.fn().mockReturnValue(mockUpdatedModuleObject),
        }),
      });

      // 3. findOne: Verificamos que no haya duplicados (retorna null)
      mockModuloModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Ejecutamos la actualización
      const result = await service.update(moduleId, updateDto);

      // Verificamos el resultado
      expect(result?.response).toEqual(
        expect.objectContaining({
          nombre: updateDto.nombre,
          descripcion: updateDto.descripcion,
        }),
      );

      // Verificamos las llamadas
      expect(mockModuloModel.findById).toHaveBeenCalledWith(moduleId);
      expect(mockModuloModel.findByIdAndUpdate).toHaveBeenCalled();
    });
    it('debería retornar null si no encuentra el módulo a actualizar', async () => {
      const moduleId = 'nonexistent';
      const updateDto: UpdateModuloDto = {
        nombre: 'Test',
        usuarioActualizacion: 'admin',
      };

      // Reseteamos mocks
      jest.clearAllMocks();

      // Mock para findById - no encuentra el módulo
      mockModuloModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.update(moduleId, updateDto);

      expect(result).toEqual({ response: null, mensaje: 'Modulo no encontrado' });
    });

    it('debería lanzar error si ya existe otro módulo con el mismo nombre', async () => {
      const moduleId = '507f1f77bcf86cd799439011';
      const updateDto: UpdateModuloDto = {
        nombre: 'Nombre Duplicado',
        usuarioActualizacion: 'admin',
      };

      const otroModulo = { ...mockModuloData, _id: 'otro_id' };

      // Reseteamos mocks
      jest.clearAllMocks();

      // 1. findById - encuentra el módulo
      mockModuloModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockModuloData),
      });

      // 2. findByIdAndUpdate - actualiza el módulo
      mockModuloModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          toObject: jest.fn().mockReturnValue({
            ...mockModuloData,
            ...updateDto,
          }),
        }),
      });

      // 3. findOne - encuentra un duplicado
      mockModuloModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(otroModulo),
      });

      await expect(service.update(moduleId, updateDto)).rejects.toThrow(BadRequestException);
      await expect(service.update(moduleId, updateDto)).rejects.toThrow(
        'Ya existe otro módulo con el mismo nombre',
      );
    });
  });

  describe('remove', () => {
    it('debería eliminar (desactivar) un módulo exitosamente', async () => {
      const moduleId = '507f1f77bcf86cd799439011';

      // Mock para findById
      const mockFindByIdQuery = mockModuloModel.findById();
      mockFindByIdQuery.exec.mockResolvedValue(mockModuloData);

      // Mock para findByIdAndUpdate
      const mockUpdateQuery = mockModuloModel.findByIdAndUpdate();
      mockUpdateQuery.exec.mockResolvedValue(true);

      const result = await service.remove(moduleId);

      expect(result).toEqual({ response: true });
      expect(mockModuloModel.findById).toHaveBeenCalledWith(moduleId);
      expect(mockModuloModel.findByIdAndUpdate).toHaveBeenCalledWith(moduleId, { activo: false });
    });

    it('debería retornar null si no encuentra el módulo a eliminar', async () => {
      const moduleId = 'nonexistent';

      const mockFindByIdQuery = mockModuloModel.findById();
      mockFindByIdQuery.exec.mockResolvedValue(null);

      const result = await service.remove(moduleId);

      expect(result).toEqual({ response: null, mensaje: 'Modulo no encontrado' });
    });
  });

  describe('saveDocument', () => {
    it('debería guardar un documento de módulo', async () => {
      const mockDocument = {
        save: jest.fn().mockResolvedValue(mockModuloData),
      } as any;

      const result = await service.saveDocument(mockDocument);

      expect(mockDocument.save).toHaveBeenCalled();
      expect(result).toEqual(mockModuloData);
    });
  });

  describe('Filtros y ordenamiento', () => {
    it('debería crear query con filtros complejos', async () => {
      const filtros: FiltroModuloDto = {
        nombre: 'Test',
        descripcion: 'Desc',
        tipoConexion: 'postgres',
        database: 'db_test',
        apiEndpoint: 'http://test',
        activo: 'true',
      };

      const mockQuery = mockModuloModel.find();
      mockQuery.exec.mockResolvedValue([]);

      const mockCountQuery = mockModuloModel.countDocuments();
      mockCountQuery.exec.mockResolvedValue(0);

      await service.findAll(filtros);

      expect(mockModuloModel.find).toHaveBeenCalledWith({
        activo: true,
        nombre: { $regex: 'Test', $options: 'i' },
        descripcion: { $regex: 'Desc', $options: 'i' },
        tipoConexion: 'postgres',
        database: { $regex: 'db_test', $options: 'i' },
        apiEndpoint: { $regex: 'http://test', $options: 'i' },
      });
    });

    it('debería usar ordenamiento por defecto', async () => {
      const mockQuery = mockModuloModel.find();
      mockQuery.exec.mockResolvedValue([]);

      const mockCountQuery = mockModuloModel.countDocuments();
      mockCountQuery.exec.mockResolvedValue(0);

      await service.findAll();

      expect(mockQuery.sort).toHaveBeenCalledWith({ fechaCreacion: -1 });
    });

    it('debería aplicar ordenamiento personalizado', async () => {
      const sorting = { nombre: 'ASC' as const, fechaCreacion: 'DESC' as const };

      const mockQuery = mockModuloModel.find();
      mockQuery.exec.mockResolvedValue([]);

      const mockCountQuery = mockModuloModel.countDocuments();
      mockCountQuery.exec.mockResolvedValue(0);

      await service.findAll(undefined, 1, 10, sorting);

      expect(mockQuery.sort).toHaveBeenCalledWith({ nombre: 1, fechaCreacion: -1 });
    });
  });

  describe('Casos edge', () => {
    it('debería manejar error en save durante create', async () => {
      // Mock para verificar nombre duplicado
      const mockFindOneQuery = mockModuloModel.findOne();
      mockFindOneQuery.exec.mockResolvedValue(null);

      // Mock para el nuevo módulo con error
      const mockNewModulo = {
        save: jest.fn().mockRejectedValue(new Error('Error de base de datos')),
      };

      mockModuloModel.mockReturnValue(mockNewModulo);

      await expect(service.create(mockCreateModuloDto)).rejects.toThrow('Error de base de datos');
    });

    it('debería calcular paginación correctamente con números decimales', async () => {
      const mockQuery = mockModuloModel.find();
      mockQuery.exec.mockResolvedValue([]);

      const mockCountQuery = mockModuloModel.countDocuments();
      mockCountQuery.exec.mockResolvedValue(23); // 23 / 10 = 2.3 -> 3 páginas

      const result = await service.findAll();

      expect(result.paginacion.paginas).toBe(3);
    });

    it('debería manejar filtro activo como string false', async () => {
      const filtros: FiltroModuloDto = {
        activo: 'false',
      };

      const mockQuery = mockModuloModel.find();
      mockQuery.exec.mockResolvedValue([]);

      const mockCountQuery = mockModuloModel.countDocuments();
      mockCountQuery.exec.mockResolvedValue(0);

      await service.findAll(filtros);

      expect(mockModuloModel.find).toHaveBeenCalledWith({
        activo: false, // Se convierte correctamente a boolean
      });
    });

    it('debería manejar array vacío en findAll', async () => {
      const mockQuery = mockModuloModel.find();
      mockQuery.exec.mockResolvedValue([]);

      const mockCountQuery = mockModuloModel.countDocuments();
      mockCountQuery.exec.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.response).toEqual([]);
      expect(result.paginacion.total).toBe(0);
      expect(result.paginacion.paginas).toBe(0);
    });
  });
});
