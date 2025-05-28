import { Test, TestingModule } from '@nestjs/testing';
import { OrquestadorService } from './orquestador.service';
import { HttpService, HttpModule } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { BadRequestException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { TipoOperacion } from './../../../../common/enums/tipo-operacion.enum';
import { ResponseDto } from './../../../../common/dto/response.dto';

describe('OrquestadorService', () => {
  let service: OrquestadorService;
  let httpService: HttpService;

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  const baseOperation = {
    endpoint: 'http://fake-endpoint',
    type: TipoOperacion.CREATE,
    data: { foo: 'bar' },
    entityDefinition: {
      fields: [{ name: 'id', isPrimary: true }],
    },
  };
  const baseOperationWithId = {
    ...baseOperation,
    id: 1,
    type: TipoOperacion.GET_ONE,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [OrquestadorService, { provide: HttpService, useValue: mockHttpService }],
    }).compile();

    service = module.get<OrquestadorService>(OrquestadorService);
    httpService = module.get<HttpService>(HttpService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('ejecutarOperacion', () => {
    it('should return success response', async () => {
      mockHttpService.post.mockReturnValueOnce(
        of({
          data: { data: { result: 'ok', status: { statusDescription: 'Hecho' } } },
          status: 200,
        }),
      );
      const result = await service.ejecutarOperacion(baseOperation as any);
      expect(result).toBeInstanceOf(ResponseDto);
      expect(result.status.statusCode).toBe(200);
      expect(result.status.statusDescription).toBe('Hecho');
    });

    it('should handle AxiosError with response', async () => {
      const axiosError = new AxiosError('fail', 'ERR', undefined, undefined, {
        status: 400,
        data: { data: { requestError: 'error' } },
        headers: {},
        config: {},
        statusText: 'Bad Request',
      } as any);
      mockHttpService.post.mockReturnValueOnce(throwError(() => axiosError));
      const result = await service.ejecutarOperacion(baseOperation as any);
      expect(result.status.statusCode).toBe(400);
      expect(result.status.statusDescription).toContain('Error en la operación');
    });

    it('should handle AxiosError with request', async () => {
      const axiosError = new AxiosError('timeout', 'ERR', undefined, {}, undefined);
      mockHttpService.post.mockReturnValueOnce(throwError(() => axiosError));
      const op = { ...baseOperation };
      const result = await service.ejecutarOperacion(op as any);
      expect(result.status.statusCode).toBe(503);
      expect(result.status.statusDescription).toBe('Servicio no disponible');
    });

    it('should handle generic error', async () => {
      mockHttpService.post.mockReturnValueOnce(throwError(() => new Error('fail')));
      const result = await service.ejecutarOperacion(baseOperation as any);
      expect(result.status.statusCode).toBe(400);
      expect(result.status.statusDescription).toBe('Error en el procesamiento de la operación');
    });

    it('should return ResponseDto with error if endpoint is missing', async () => {
      const result = await service.ejecutarOperacion({
        ...baseOperation,
        endpoint: undefined,
      } as any);
      expect(result).toBeInstanceOf(ResponseDto);
      expect(result.status.statusCode).toBe(400);
      expect(result.status.statusDescription).toBe('Error en el procesamiento de la operación');
      expect(result.data && (result.data as any).error).toBe(
        'El endpoint es requerido para ejecutar la operación',
      );
    });
  });

  describe('checkTemplateHealth', () => {
    it('should return connected response', async () => {
      mockHttpService.get.mockReturnValueOnce(of({ status: 200 }));
      const result = await service.checkTemplateHealth('http://fake-endpoint');
      expect(result.status.statusCode).toBe(200);
      expect(result.data.response.status).toBe('connected');
    });

    it('should return disconnected response on error', async () => {
      mockHttpService.get.mockReturnValueOnce(throwError(() => new Error('fail')));
      const result = await service.checkTemplateHealth('http://fake-endpoint');
      expect(result.status.statusCode).toBe(503);
      expect(result.data.response.status).toBe('disconnected');
    });
  });

  describe('validateOperation', () => {
    it('should throw if id is missing for GET_ONE', () => {
      const op = { ...baseOperation, type: TipoOperacion.GET_ONE };
      expect(() => (service as any).validateOperation(op)).toThrow(BadRequestException);
    });
    it('should throw if data is missing for CREATE', () => {
      const op = { ...baseOperation, data: undefined };
      expect(() => (service as any).validateOperation(op)).toThrow(BadRequestException);
    });

    it('should throw if no primary key', () => {
      const op = {
        ...baseOperation,
        entityDefinition: { fields: [{ name: 'foo', isPrimary: false }] },
      };
      expect(() => (service as any).validateOperation(op)).toThrow(BadRequestException);
    });

    it('should not throw if id is present for GET_ONE', () => {
      const op = { ...baseOperation, id: 1, type: TipoOperacion.GET_ONE };
      expect(() => (service as any).validateOperation(op)).not.toThrow();
    });
  });
});
