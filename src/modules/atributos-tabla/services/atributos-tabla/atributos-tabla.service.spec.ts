import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AtributosTablaService } from './atributos-tabla.service';
import { Modulo } from 'src/modules/modulo/schemas/modulo.schema';
import { Types, Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

describe('AtributosTablaService', () => {
  let service: AtributosTablaService;
  let mockModuloModel: any;

  const mockEntidadId = '507f1f77bcf86cd799439012';
  const mockAtributoId = '507f1f77bcf86cd799439013';

  const mockAtributo = {
    _id: new Types.ObjectId(mockAtributoId),
    nombre: 'Atributo Test',
    nombreColumna: 'columna_test',
    tipoDato: 'string',
    activo: true,
    fechaCreacion: new Date(),
    usuarioCreacion: 'user1',
  };

  const mockEntidad = {
    _id: new Types.ObjectId(mockEntidadId),
    nombre: 'Entidad Test',
    atributosTabla: [mockAtributo],
    activo: true,
  };

  const mockModulo = {
    _id: new Types.ObjectId(),
    entidades: [mockEntidad],
    save: jest.fn(),
    activo: true,
  };

  beforeEach(async () => {
    mockModuloModel = {
      findOne: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AtributosTablaService,
        {
          provide: getModelToken(Modulo.name),
          useValue: mockModuloModel,
        },
      ],
    })
      .useMocker((token) => {
        if (token === Model) {
          return mockModuloModel;
        }
      })
      .compile();
    service = module.get<AtributosTablaService>(AtributosTablaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('debería retornar atributos de una entidad', async () => {
      mockModuloModel.findOne.mockResolvedValue(mockModulo);
      const result = await service.findAll(mockEntidadId);
      expect(result.response).toEqual([mockAtributo]);
      expect(result.paginacion?.total).toBe(1);
      expect(mockModuloModel.findOne).toHaveBeenCalled();
    });
    it('debería retornar null si no encuentra el módulo', async () => {
      mockModuloModel.findOne.mockResolvedValue(null);
      const result = await service.findAll(mockEntidadId);
      expect(result).toEqual({ response: null, mensaje: 'Modulo no encontrado' });
    });
    it('debería retornar null si no encuentra la entidad', async () => {
      const moduloSinEntidad = { ...mockModulo, entidades: [] };
      mockModuloModel.findOne.mockResolvedValue(moduloSinEntidad);
      const result = await service.findAll(mockEntidadId);
      expect(result).toEqual({ response: null, mensaje: 'Entidad no encontrada' });
    });
  });

  describe('create', () => {
    it('debería crear un atributo exitosamente', async () => {
      const mockSave = jest
        .fn()
        .mockResolvedValue({ entidades: [{ ...mockEntidad, atributosTabla: [mockAtributo] }] });
      const moduloConSave = { ...mockModulo, save: mockSave };
      mockModuloModel.findOne.mockResolvedValue(moduloConSave);
      const createDto = { nombre: 'Nuevo', nombreColumna: 'nuevo', usuarioCreacion: 'user1' };
      const result = await service.create(mockEntidadId, createDto as any);
      expect(result.response).toBeDefined();
      expect(mockSave).toHaveBeenCalled();
    });
    it('debería retornar null si no encuentra el módulo', async () => {
      mockModuloModel.findOne.mockResolvedValue(null);
      const result = await service.create(mockEntidadId, { nombre: 'Nuevo' } as any);
      expect(result).toEqual({ response: null, mensaje: 'Modulo no encontrado' });
    });
    it('debería retornar null si no encuentra la entidad', async () => {
      const moduloSinEntidad = { ...mockModulo, entidades: [] };
      mockModuloModel.findOne.mockResolvedValue(moduloSinEntidad);
      const result = await service.create(mockEntidadId, { nombre: 'Nuevo' } as any);
      expect(result).toEqual({ response: null, mensaje: 'Entidad no encontrada' });
    });
    it('debería lanzar error si ya existe un atributo con el mismo nombre', async () => {
      mockModuloModel.findOne.mockResolvedValue(mockModulo);
      await expect(
        service.create(mockEntidadId, { nombre: 'Atributo Test' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('debería actualizar un atributo exitosamente', async () => {
      const mockSave = jest
        .fn()
        .mockResolvedValue({ entidades: [{ ...mockEntidad, atributosTabla: [mockAtributo] }] });
      const moduloConSave = { ...mockModulo, save: mockSave };
      mockModuloModel.findOne.mockResolvedValue(moduloConSave);
      const updateDto = { nombre: 'Actualizado', usuarioActualizacion: 'user2' };
      const result = await service.update(mockEntidadId, mockAtributoId, updateDto as any);
      expect(result.response).toBeDefined();
      expect(mockSave).toHaveBeenCalled();
    });
    it('debería retornar null si no encuentra el módulo', async () => {
      mockModuloModel.findOne.mockResolvedValue(null);
      const result = await service.update(mockEntidadId, mockAtributoId, { nombre: 'X' } as any);
      expect(result).toEqual({ response: null, mensaje: 'Modulo no encontrado' });
    });
    it('debería retornar null si no encuentra la entidad', async () => {
      const moduloSinEntidad = { ...mockModulo, entidades: [] };
      mockModuloModel.findOne.mockResolvedValue(moduloSinEntidad);
      const result = await service.update(mockEntidadId, mockAtributoId, { nombre: 'X' } as any);
      expect(result).toEqual({ response: null, mensaje: 'Entidad no encontrada' });
    });
    it('debería retornar null si no encuentra el atributo', async () => {
      const entidadSinAtributo = { ...mockEntidad, atributosTabla: [] };
      const moduloSinAtributo = { ...mockModulo, entidades: [entidadSinAtributo] };
      mockModuloModel.findOne.mockResolvedValue(moduloSinAtributo);
      const result = await service.update(mockEntidadId, mockAtributoId, { nombre: 'X' } as any);
      expect(result).toEqual({ response: null, mensaje: 'Atributo no encontrado' });
    });
  });

  describe('remove', () => {
    it('debería eliminar (desactivar) un atributo exitosamente', async () => {
      const mockSave = jest
        .fn()
        .mockResolvedValue({ entidades: [{ ...mockEntidad, atributosTabla: [mockAtributo] }] });
      const moduloConSave = { ...mockModulo, save: mockSave };
      mockModuloModel.findOne.mockResolvedValue(moduloConSave);
      const result = await service.remove(mockEntidadId, mockAtributoId);
      expect(result.result).toBe(true);
      expect(mockSave).toHaveBeenCalled();
    });
    it('debería retornar null si no encuentra el módulo', async () => {
      mockModuloModel.findOne.mockResolvedValue(null);
      const result = await service.remove(mockEntidadId, mockAtributoId);
      expect(result).toEqual({ response: null, mensaje: 'Modulo no encontrado' });
    });
    it('debería retornar null si no encuentra la entidad', async () => {
      const moduloSinEntidad = { ...mockModulo, entidades: [] };
      mockModuloModel.findOne.mockResolvedValue(moduloSinEntidad);
      const result = await service.remove(mockEntidadId, mockAtributoId);
      expect(result).toEqual({ response: null, mensaje: 'Entidad no encontrada' });
    });
    it('debería retornar null si no encuentra el atributo', async () => {
      const entidadSinAtributo = { ...mockEntidad, atributosTabla: [] };
      const moduloSinAtributo = { ...mockModulo, entidades: [entidadSinAtributo] };
      mockModuloModel.findOne.mockResolvedValue(moduloSinAtributo);
      const result = await service.remove(mockEntidadId, mockAtributoId);
      expect(result).toEqual({ response: null, mensaje: 'Atributo no encontrado' });
    });
  });
});
