import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Response } from 'express';
import { map, of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';
import { ResponseDto } from '../dto/response.dto';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockCallHandler: jest.Mocked<CallHandler>;
  let mockResponse: jest.Mocked<Response>;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();

    // Mock del Response de Express
    mockResponse = {
      status: jest.fn().mockReturnThis(),
    } as any;

    // Mock del ExecutionContext
    const mockHttpContext = {
      getResponse: jest.fn().mockReturnValue(mockResponse),
      getRequest: jest.fn(),
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as any;

    // Mock del CallHandler
    mockCallHandler = {
      handle: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definición del interceptor', () => {
    it('should be defined', () => {
      expect(interceptor).toBeDefined();
    });
  });

  describe('intercept', () => {
    it('debe retornar el mismo ResponseDto si no es array vacío, objeto vacío ni null', (done) => {
      const responseDto = new ResponseDto({ response: { foo: 'bar' } }, 200, 'OK');
      mockCallHandler.handle.mockReturnValueOnce(of(responseDto));
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((result) => {
        expect(result).toBe(responseDto);
        expect(mockResponse.status).not.toHaveBeenCalledWith(206);
        done();
      });
    });

    it('debe retornar 206 si response es array vacío', (done) => {
      const responseDto = new ResponseDto({ response: [] }, 200, 'OK');
      mockCallHandler.handle.mockReturnValueOnce(of(responseDto));
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((result) => {
        expect(result.status.statusCode).toBe(206);
        expect(result.status.statusDescription).toBe('Partial Content');
        expect(mockResponse.status).toHaveBeenCalledWith(206);
        done();
      });
    });

    it('debe retornar 206 si response es objeto vacío', (done) => {
      const responseDto = new ResponseDto({ response: {} }, 200, 'OK');
      mockCallHandler.handle.mockReturnValueOnce(of(responseDto));
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((result) => {
        expect(result.status.statusCode).toBe(206);
        expect(result.status.statusDescription).toBe('Partial Content');
        expect(mockResponse.status).toHaveBeenCalledWith(206);
        done();
      });
    });

    it('debe retornar 206 si response es null', (done) => {
      const responseDto = new ResponseDto({ response: null }, 200, 'OK');
      mockCallHandler.handle.mockReturnValueOnce(of(responseDto));
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((result) => {
        expect(result.status.statusCode).toBe(206);
        expect(result.status.statusDescription).toBe('Partial Content');
        expect(mockResponse.status).toHaveBeenCalledWith(206);
        done();
      });
    });

    it('debe envolver en ResponseDto si no es ResponseDto', (done) => {
      const plainData = { foo: 'bar' };
      mockCallHandler.handle.mockReturnValueOnce(of(plainData));
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((result) => {
        expect(result).toBeInstanceOf(ResponseDto);
        expect(result.data).toEqual(plainData);
        done();
      });
    });
  });
});
