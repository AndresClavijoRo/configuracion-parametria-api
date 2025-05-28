import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { TipoOperacion } from '../../../../common/enums/tipo-operacion.enum';
import { CreateEntidadDto } from '../../dto/create-entidad.dto';
import { FiltroEntidadDto } from '../../dto/filtro-entidad.dto';
import { UpdateEntidadDto } from '../../dto/update-entidad.dto';
import { Modulo } from '../../../modulo/schemas/modulo.schema';
import { EntidadService } from './entidad.service';

describe('EntidadService', () => {
  let service: EntidadService;
  let mockModuloModel: any;

  // Datos de prueba
  const mockModuloId = '507f1f77bcf86cd799439011';
  const mockEntidadId = '507f1f77bcf86cd799439012';

  const mockEntidadData = {
    _id: new Types.ObjectId(mockEntidadId),
    nombre: 'Entidad Test',
    nombreTabla: 'test_table',
    descripcion: 'Descripción de prueba',
    activo: true,
    operaciones: [TipoOperacion.GET_ONE, TipoOperacion.GET_MANY],
    fechaCreacion: new Date(),
    usuarioCreacion: 'test_user',
    atributosTabla: [],
  };

  const mockCreateEntidadDto: CreateEntidadDto = {
    nombre: 'Nueva Entidad',
    nombreTabla: 'nueva_tabla',
    descripcion: 'Nueva descripción',
    operaciones: [TipoOperacion.CREATE, TipoOperacion.UPDATE],
    activo: true,
    usuarioCreacion: 'test_user',
  };

  beforeEach(async () => {
    // Crear un mock completamente limpio para cada test
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    // Mock del modelo Mongoose con funciones que retornan objetos con exec()
    mockModuloModel = {
      findOne: jest.fn(() => mockQuery),
      findById: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntidadService,
        {
          provide: getModelToken(Modulo.name),
          useValue: mockModuloModel,
        },
      ],
    }).compile();

    service = module.get<EntidadService>(EntidadService);
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
    beforeEach(() => {
      // Reset mocks before each test in this describe block
      jest.clearAllMocks();
    });

    it('debería retornar lista de entidades de un módulo', async () => {
      const mockModulo = {
        _id: mockModuloId,
        nombre: 'Módulo Test',
        activo: true,
        entidades: [mockEntidadData],
      };

      // Mock the complete chain: findOne().select().exec()
      const mockSelectChain = {
        exec: jest.fn().mockResolvedValue(mockModulo),
      };

      mockModuloModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain),
      });

      const result = await service.findAll(mockModuloId);

      expect(result).toEqual({
        response: [mockEntidadData],
        paginacion: {
          total: 1,
          pagina: 1,
          size: 10,
          paginas: 1,
        },
      });

      expect(mockModuloModel.findOne).toHaveBeenCalledWith(
        { _id: mockModuloId, activo: true },
        { 'entidades.atributosTabla': 0 },
      );
    });

    it('debería retornar null si no encuentra el módulo', async () => {
      const mockSelectChain = {
        exec: jest.fn().mockResolvedValue(null),
      };

      mockModuloModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain),
      });

      const result = await service.findAll('507f1f77bcf86cd799439999');

      expect(result).toEqual({ response: null, mensaje: 'Modulo no encontrado' });
    });

    it('debería aplicar filtros correctamente', async () => {
      const filtros: FiltroEntidadDto = {
        nombre: 'Test',
        operaciones: [TipoOperacion.GET_ONE],
      };

      const mockModulo = {
        _id: mockModuloId,
        entidades: [mockEntidadData],
      };

      const mockSelectChain = {
        exec: jest.fn().mockResolvedValue(mockModulo),
      };

      mockModuloModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain),
      });

      const result = await service.findAll(mockModuloId, filtros);

      expect(result.response).toHaveLength(1);
    });

    it('debería manejar paginación personalizada', async () => {
      const entidadesMultiples = Array.from({ length: 15 }, (_, i) => ({
        ...mockEntidadData,
        _id: new Types.ObjectId(),
        nombre: `Entidad ${i + 1}`,
      }));

      const mockModulo = {
        _id: mockModuloId,
        entidades: entidadesMultiples,
      };

      const mockSelectChain = {
        exec: jest.fn().mockResolvedValue(mockModulo),
      };

      mockModuloModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain),
      });

      const result = await service.findAll(mockModuloId, undefined, 2, 5);

      expect(result.paginacion).toEqual({
        total: 15,
        pagina: 2,
        size: 5,
        paginas: 3,
      });
    });

    it('debería filtrar solo entidades activas', async () => {
      const entidadInactiva = {
        ...mockEntidadData,
        _id: new Types.ObjectId(),
        nombre: 'Entidad Inactiva',
        activo: false,
      };

      const mockModulo = {
        _id: mockModuloId,
        entidades: [mockEntidadData, entidadInactiva],
      };

      const mockSelectChain = {
        exec: jest.fn().mockResolvedValue(mockModulo),
      };

      mockModuloModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain),
      });

      const result = await service.findAll(mockModuloId);

      expect(result.response).toHaveLength(1);
      expect(result.response?.[0].nombre).toBe('Entidad Test');
    });
  });

  describe('findOne', () => {
    it('debería retornar una entidad por ID', async () => {
      const mockModulo = {
        _id: mockModuloId,
        entidades: [mockEntidadData],
      };

      mockModuloModel.findOne.mockResolvedValue(mockModulo);

      const result = await service.findOne(mockEntidadId);

      expect(result).toEqual({ response: mockEntidadData });
      expect(mockModuloModel.findOne).toHaveBeenCalledWith({
        'entidades._id': new Types.ObjectId(mockEntidadId),
        'entidades.activo': true,
      });
    });

    it('debería retornar null si no encuentra el módulo', async () => {
      mockModuloModel.findOne.mockResolvedValue(null);

      const result = await service.findOne(mockEntidadId);

      expect(result).toEqual({ response: null, mensaje: 'Modulo no encontrado' });
    });

    it('debería retornar null si no encuentra la entidad', async () => {
      const moduloSinEntidad = {
        _id: mockModuloId,
        entidades: [],
      };

      mockModuloModel.findOne.mockResolvedValue(moduloSinEntidad);

      const result = await service.findOne(mockEntidadId);

      expect(result).toEqual({ response: null, mensaje: 'Entidad no encontrada' });
    });
  });

  describe('create', () => {
    it('debería crear una entidad exitosamente', async () => {
      const mockModuloSinEntidades = {
        _id: mockModuloId,
        entidades: [],
        save: jest.fn().mockResolvedValue({
          entidades: [
            {
              ...mockCreateEntidadDto,
              _id: new Types.ObjectId(),
              fechaCreacion: new Date(),
              fechaActualizacion: new Date(),
              usuarioActualizacion: mockCreateEntidadDto.usuarioCreacion,
              atributosTabla: [],
            },
          ],
        }),
      };

      mockModuloModel.findById.mockResolvedValue(mockModuloSinEntidades);

      const result = await service.create(mockModuloId, mockCreateEntidadDto);

      expect(result.response).toEqual(
        expect.objectContaining({
          nombre: mockCreateEntidadDto.nombre,
          nombreTabla: mockCreateEntidadDto.nombreTabla,
        }),
      );

      expect(mockModuloModel.findById).toHaveBeenCalledWith(mockModuloId);
    });

    it('debería retornar null si no encuentra el módulo', async () => {
      mockModuloModel.findById.mockResolvedValue(null);

      const result = await service.create(mockModuloId, mockCreateEntidadDto);

      expect(result).toEqual({ response: null, mensaje: 'Modulo no encontrado' });
    });

    it('debería lanzar error si ya existe una entidad con el mismo nombre', async () => {
      const mockModuloConDuplicado = {
        _id: mockModuloId,
        entidades: [
          {
            ...mockEntidadData,
            nombre: mockCreateEntidadDto.nombre,
          },
        ],
      };

      mockModuloModel.findById.mockResolvedValue(mockModuloConDuplicado);

      await expect(service.create(mockModuloId, mockCreateEntidadDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(mockModuloId, mockCreateEntidadDto)).rejects.toThrow(
        'Ya existe una entidad con el mismo nombre',
      );
    });
  });

  describe('update', () => {
    it('debería actualizar una entidad exitosamente', async () => {
      const updateDto: UpdateEntidadDto = {
        nombre: 'Entidad Actualizada',
        nombreTabla: 'tabla_actualizada',
        descripcion: 'Descripción actualizada',
        operaciones: [TipoOperacion.GET_ONE],
        usuarioActualizacion: 'admin',
      };

      const mockModuloParaDuplicados = {
        _id: mockModuloId,
        entidades: [mockEntidadData],
      };

      const mockModuloActualizado = {
        _id: mockModuloId,
        entidades: [
          {
            ...mockEntidadData,
            ...updateDto,
            fechaActualizacion: new Date(),
          },
        ],
      };

      // Mock para findOne - verificar duplicados
      mockModuloModel.findOne.mockResolvedValue(mockModuloParaDuplicados);

      // Mock para findOneAndUpdate - actualizar entidad
      mockModuloModel.findOneAndUpdate.mockResolvedValue(mockModuloActualizado);

      const result = await service.update(mockModuloId, mockEntidadId, updateDto);

      expect(result?.response).toEqual(
        expect.objectContaining({
          nombre: updateDto.nombre,
          nombreTabla: updateDto.nombreTabla,
        }),
      );

      expect(mockModuloModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: mockModuloId,
          'entidades._id': new Types.ObjectId(mockEntidadId),
        },
        expect.objectContaining({
          $set: expect.objectContaining({
            'entidades.$.nombre': updateDto.nombre,
            'entidades.$.nombreTabla': updateDto.nombreTabla,
          }),
        }),
        { new: true },
      );
    });

    it('debería retornar null si no encuentra el módulo', async () => {
      const updateDto: UpdateEntidadDto = {
        nombre: 'Test',
        nombreTabla: 'test_tabla',
        operaciones: [TipoOperacion.GET_ONE],
        usuarioActualizacion: 'admin',
      };

      mockModuloModel.findOne.mockResolvedValue(null);

      const result = await service.update(mockModuloId, mockEntidadId, updateDto);

      expect(result).toEqual({ response: null, mensaje: 'Modulo no encontrado' });
    });

    it('debería lanzar error si ya existe otra entidad con el mismo nombre', async () => {
      const updateDto: UpdateEntidadDto = {
        nombre: 'Nombre Duplicado',
        nombreTabla: 'tabla_duplicada',
        operaciones: [TipoOperacion.GET_ONE],
        usuarioActualizacion: 'admin',
      };

      const otraEntidad = {
        ...mockEntidadData,
        _id: new Types.ObjectId(),
        nombre: 'Nombre Duplicado',
      };

      const mockModuloConDuplicado = {
        _id: mockModuloId,
        entidades: [mockEntidadData, otraEntidad],
      };

      mockModuloModel.findOne.mockResolvedValue(mockModuloConDuplicado);

      await expect(service.update(mockModuloId, mockEntidadId, updateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(mockModuloId, mockEntidadId, updateDto)).rejects.toThrow(
        'Ya existe una entidad con el mismo nombre en este módulo',
      );
    });

    it('debería retornar null si no encuentra la entidad a actualizar', async () => {
      const updateDto: UpdateEntidadDto = {
        nombre: 'Test',
        nombreTabla: 'test_tabla',
        operaciones: [TipoOperacion.GET_ONE],
        usuarioActualizacion: 'admin',
      };

      const mockModuloSinDuplicados = {
        _id: mockModuloId,
        entidades: [mockEntidadData],
      };

      mockModuloModel.findOne.mockResolvedValue(mockModuloSinDuplicados);
      mockModuloModel.findOneAndUpdate.mockResolvedValue(null);

      const result = await service.update(mockModuloId, mockEntidadId, updateDto);

      expect(result).toEqual({ response: null, mensaje: 'Entidad no encontrada' });
    });
  });

  describe('remove', () => {
    it('debería eliminar (desactivar) una entidad exitosamente', async () => {
      const mockModuloConSave = {
        _id: mockModuloId,
        entidades: [mockEntidadData],
        save: jest.fn().mockResolvedValue(true),
      };

      mockModuloModel.findOne.mockResolvedValue(mockModuloConSave);

      const result = await service.remove(mockEntidadId);

      expect(result).toEqual({ response: true });
      expect(mockModuloModel.findOne).toHaveBeenCalledWith({
        'entidades._id': new Types.ObjectId(mockEntidadId),
      });
    });

    it('debería retornar null si no encuentra el módulo', async () => {
      mockModuloModel.findOne.mockResolvedValue(null);

      const result = await service.remove(mockEntidadId);

      expect(result).toEqual({ response: null, mensaje: 'Modulo no encontrado' });
    });

    it('debería retornar null si no encuentra la entidad', async () => {
      const moduloSinEntidad = {
        _id: mockModuloId,
        entidades: [],
        save: jest.fn(),
      };

      mockModuloModel.findOne.mockResolvedValue(moduloSinEntidad);

      const result = await service.remove(mockEntidadId);

      expect(result).toEqual({ response: null, mensaje: 'Entidad no encontrada' });
    });
  });

  describe('Filtros y ordenamiento', () => {
    it('debería crear filtros con criterios complejos', async () => {
      const filtros: FiltroEntidadDto = {
        nombre: 'Test',
        nombreTabla: 'test_table',
        descripcion: 'desc',
        operaciones: [TipoOperacion.GET_ONE, TipoOperacion.CREATE],
      };

      const entidadesVariadas = [
        {
          ...mockEntidadData,
          nombre: 'Test Entity',
          nombreTabla: 'test_table_match',
          descripcion: 'desc test',
          operaciones: [TipoOperacion.GET_ONE, TipoOperacion.CREATE, TipoOperacion.UPDATE],
        },
        {
          ...mockEntidadData,
          _id: new Types.ObjectId(),
          nombre: 'Other Entity',
          nombreTabla: 'other_table',
          operaciones: [TipoOperacion.DELETE],
        },
      ];

      const mockModulo = {
        _id: mockModuloId,
        entidades: entidadesVariadas,
      };

      mockModuloModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockModulo),
      });

      const result = await service.findAll(mockModuloId, filtros);

      // Solo debería retornar la primera entidad que cumple todos los criterios
      expect(result.response).toHaveLength(1);
      expect(result.response?.[0].nombre).toBe('Test Entity');
    });

    it('debería aplicar ordenamiento personalizado', async () => {
      const entidadesDesordenadas = [
        { ...mockEntidadData, nombre: 'Z Entity', fechaCreacion: new Date('2023-01-01') },
        {
          ...mockEntidadData,
          _id: new Types.ObjectId(),
          nombre: 'A Entity',
          fechaCreacion: new Date('2023-01-02'),
        },
        {
          ...mockEntidadData,
          _id: new Types.ObjectId(),
          nombre: 'M Entity',
          fechaCreacion: new Date('2023-01-03'),
        },
      ];

      const mockModulo = {
        _id: mockModuloId,
        entidades: entidadesDesordenadas,
      };

      mockModuloModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockModulo),
      });

      const result = await service.findAll(mockModuloId, undefined, 1, 10, { nombre: 'ASC' });

      expect(result.response?.[0].nombre).toBe('A Entity');
      expect(result.response?.[1].nombre).toBe('M Entity');
      expect(result.response?.[2].nombre).toBe('Z Entity');
    });

    it('debería usar ordenamiento por defecto (fechaCreacion DESC)', async () => {
      const entidadesPorFecha = [
        { ...mockEntidadData, nombre: 'First', fechaCreacion: new Date('2023-01-01') },
        {
          ...mockEntidadData,
          _id: new Types.ObjectId(),
          nombre: 'Latest',
          fechaCreacion: new Date('2023-01-03'),
        },
        {
          ...mockEntidadData,
          _id: new Types.ObjectId(),
          nombre: 'Middle',
          fechaCreacion: new Date('2023-01-02'),
        },
      ];

      const mockModulo = {
        _id: mockModuloId,
        entidades: entidadesPorFecha,
      };

      mockModuloModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockModulo),
      });

      const result = await service.findAll(mockModuloId);

      expect(result.response?.[0].nombre).toBe('Latest');
      expect(result.response?.[1].nombre).toBe('Middle');
      expect(result.response?.[2].nombre).toBe('First');
    });
  });

  describe('Casos edge', () => {
    it('debería manejar módulo sin entidades', async () => {
      const mockModulo = {
        _id: mockModuloId,
        entidades: [],
      };

      mockModuloModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockModulo),
      });

      const result = await service.findAll(mockModuloId);

      expect(result.response).toEqual([]);
      expect(result.paginacion?.total).toBe(0);
      expect(result.paginacion?.paginas).toBe(0);
    });

    it('debería calcular paginación correctamente con números decimales', async () => {
      const entidadesMultiples = Array.from({ length: 23 }, (_, i) => ({
        ...mockEntidadData,
        _id: new Types.ObjectId(),
        nombre: `Entidad ${i + 1}`,
      }));

      const mockModulo = {
        _id: mockModuloId,
        entidades: entidadesMultiples,
      };

      mockModuloModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockModulo),
      });

      const result = await service.findAll(mockModuloId);

      expect(result.paginacion?.paginas).toBe(3); // 23 / 10 = 2.3 -> 3 páginas
    });

    it('debería manejar error durante save en create', async () => {
      const mockModuloConError = {
        _id: mockModuloId,
        entidades: [],
        save: jest.fn().mockRejectedValue(new Error('Error de base de datos')),
      };

      mockModuloModel.findById.mockResolvedValue(mockModuloConError);

      await expect(service.create(mockModuloId, mockCreateEntidadDto)).rejects.toThrow(
        'Error al crear la entidad',
      );
    });

    it('debería manejar error durante save en remove', async () => {
      const mockModuloConError = {
        _id: mockModuloId,
        entidades: [mockEntidadData],
        save: jest.fn().mockRejectedValue(new Error('Error de base de datos')),
      };

      mockModuloModel.findOne.mockResolvedValue(mockModuloConError);

      await expect(service.remove(mockEntidadId)).rejects.toThrow('Error al eliminar la entidad');
    });

    it('debería manejar entidad con campos opcionales vacíos', async () => {
      const entidadMinima = {
        ...mockEntidadData,
        descripcion: '',
        operaciones: [],
      };

      const mockModulo = {
        _id: mockModuloId,
        entidades: [entidadMinima],
      };

      mockModuloModel.findOne.mockResolvedValue(mockModulo);

      const result = await service.findOne(mockEntidadId);

      expect(result.response?.descripcion).toBe('');
      expect(result.response?.operaciones).toEqual([]);
    });
  });
});
