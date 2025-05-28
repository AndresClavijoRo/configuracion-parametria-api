import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { GlobalExceptionFilter } from './global-exception.filter';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockArgumentsHost: jest.Mocked<ArgumentsHost>;
  let mockHttpArgumentsHost: any;
  let mockResponse: jest.Mocked<Response>;
  let mockRequest: jest.Mocked<Request>;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

    // Mock del Request
    mockRequest = {
      method: 'GET',
      url: '/api/test',
    } as any;

    // Mock del Response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    // Mock del HttpArgumentsHost
    mockHttpArgumentsHost = {
      getResponse: jest.fn().mockReturnValue(mockResponse),
      getRequest: jest.fn().mockReturnValue(mockRequest),
    };

    // Mock del ArgumentsHost
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue(mockHttpArgumentsHost),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as any;

    // Mock console methods para testing limpio
    jest.spyOn(console, 'error').mockImplementation();

    // Mock process.env para testing
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Definición del filtro', () => {
    it('should be defined', () => {
      expect(filter).toBeDefined();
    });
  });

  describe('catch - HttpException con ResponseDto', () => {
    it('debería manejar HttpException que contiene ResponseDto', () => {
      const errorResponseDto = new ErrorResponseDto(
        'Custom error',
        HttpStatus.BAD_REQUEST,
        'Invalid request parameters',
      );

      const httpException = new HttpException(errorResponseDto, HttpStatus.BAD_REQUEST);

      filter.catch(httpException, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('debería loggear HttpException con ResponseDto', () => {
      const loggerSpy = jest.spyOn(console, 'error').mockImplementation();

      const errorResponseDto = new ErrorResponseDto(
        'Test error',
        HttpStatus.FORBIDDEN,
        'Access denied',
      );

      const httpException = new HttpException(errorResponseDto, HttpStatus.FORBIDDEN);

      filter.catch(httpException, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error procesando'),
        httpException,
      );

      loggerSpy.mockRestore();
    });
  });

  describe('catch - HttpException con objeto de error', () => {
    it('debería manejar HttpException con mensaje string', () => {
      process.env.NODE_ENV = 'production';
      const httpException = new HttpException('Simple error message', HttpStatus.BAD_REQUEST);
      filter.catch(httpException, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Simple error message',
          status: HttpStatus.BAD_REQUEST,
          statusDescription: expect.any(String),
        }),
      );
    });

    it('debería manejar HttpException con array de mensajes', () => {
      const errorResponse = {
        message: ['Field is required', 'Field must be valid email'],
        error: 'Validation Error',
        statusCode: HttpStatus.BAD_REQUEST,
      };
      const httpException = new HttpException(errorResponse, HttpStatus.BAD_REQUEST);
      filter.catch(httpException, mockArgumentsHost);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Field is required, Field must be valid email',
        }),
      );
    });

    it('debería manejar HttpException con mensaje string en objeto', () => {
      const errorResponse = {
        message: 'Single validation error',
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
      };
      const httpException = new HttpException(errorResponse, HttpStatus.BAD_REQUEST);
      filter.catch(httpException, mockArgumentsHost);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Single validation error',
        }),
      );
    });
  });

  describe('catch - Diferentes códigos de estado HTTP', () => {
    it('debería manejar BAD_REQUEST (400)', () => {
      const httpException = new HttpException('Bad request', HttpStatus.BAD_REQUEST);
      filter.catch(httpException, mockArgumentsHost);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Bad request',
          status: HttpStatus.BAD_REQUEST,
          statusDescription: 'Valores nulos o incorrectos en los parámetros de entrada.',
        }),
      );
    });
    it('debería manejar NOT_FOUND (404)', () => {
      const httpException = new HttpException('Resource not found', HttpStatus.NOT_FOUND);
      filter.catch(httpException, mockArgumentsHost);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Resource not found',
          status: HttpStatus.NOT_FOUND,
          statusDescription: 'Recurso no encontrado.',
        }),
      );
    });
    it('debería manejar UNAUTHORIZED (401)', () => {
      const httpException = new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      filter.catch(httpException, mockArgumentsHost);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unauthorized',
          status: HttpStatus.UNAUTHORIZED,
          statusDescription: 'No autorizado para realizar esta operación.',
        }),
      );
    });
    it('debería manejar FORBIDDEN (403)', () => {
      const httpException = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      filter.catch(httpException, mockArgumentsHost);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Forbidden',
          status: HttpStatus.FORBIDDEN,
          statusDescription: 'Acceso prohibido a este recurso.',
        }),
      );
    });
    it('debería manejar CONFLICT (409)', () => {
      const httpException = new HttpException('Conflict', HttpStatus.CONFLICT);
      filter.catch(httpException, mockArgumentsHost);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Conflict',
          status: HttpStatus.CONFLICT,
          statusDescription: 'Violación de restricción de unicidad.',
        }),
      );
    });
    it('debería manejar UNPROCESSABLE_ENTITY (422)', () => {
      const httpException = new HttpException('Validation failed', HttpStatus.UNPROCESSABLE_ENTITY);
      filter.catch(httpException, mockArgumentsHost);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          statusDescription: expect.any(String),
        }),
      );
    });
    it('debería manejar códigos de estado desconocidos', () => {
      const httpException = new HttpException('Teapot error', HttpStatus.I_AM_A_TEAPOT);
      filter.catch(httpException, mockArgumentsHost);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Teapot error',
          status: HttpStatus.I_AM_A_TEAPOT,
          statusDescription: 'Error en el procesamiento de la solicitud.',
        }),
      );
    });
  });

  describe('catch - Error genérico (no HttpException)', () => {
    it('debería manejar Error estándar', () => {
      const genericError = new Error('Generic error message');
      filter.catch(genericError, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Generic error message',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          statusDescription: 'Error en el procesamiento de la solicitud.',
        }),
      );
    });
    it('debería manejar Error sin mensaje', () => {
      const errorWithoutMessage = new Error();
      filter.catch(errorWithoutMessage, mockArgumentsHost);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '',
        }),
      );
    });
    it('debería manejar excepción que no es Error ni HttpException', () => {
      const unknownException = 'String exception';
      filter.catch(unknownException, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'String exception',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          statusDescription: 'Error en el procesamiento de la solicitud.',
        }),
      );
    });
    it('debería manejar excepción null', () => {
      filter.catch(null, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'null',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          statusDescription: 'Error en el procesamiento de la solicitud.',
        }),
      );
    });
    it('debería manejar excepción undefined', () => {
      filter.catch(undefined, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'undefined',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          statusDescription: 'Error en el procesamiento de la solicitud.',
        }),
      );
    });
  });

  describe('catch - Logging', () => {
    it('debería loggear HttpException correctamente', () => {
      const loggerSpy = jest.spyOn(console, 'error').mockImplementation();
      const httpException = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      filter.catch(httpException, mockArgumentsHost);
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error procesando'),
        httpException,
      );
      loggerSpy.mockRestore();
    });
    it('debería loggear Error genérico correctamente', () => {
      const loggerSpy = jest.spyOn(console, 'error').mockImplementation();
      const genericError = new Error('Generic error');
      filter.catch(genericError, mockArgumentsHost);
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error procesando'),
        genericError,
      );
      loggerSpy.mockRestore();
    });
    it('debería loggear con diferentes métodos HTTP', () => {
      const loggerSpy = jest.spyOn(console, 'error').mockImplementation();
      mockRequest.method = 'POST';
      mockRequest.url = '/api/users';
      const httpException = new HttpException('User creation failed', HttpStatus.BAD_REQUEST);
      filter.catch(httpException, mockArgumentsHost);
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error procesando'),
        httpException,
      );
      loggerSpy.mockRestore();
    });
  });

  describe('catch - Stack trace en desarrollo', () => {
    it('debería incluir stack trace cuando NODE_ENV no es production', () => {
      process.env.NODE_ENV = 'development';
      const errorWithStack = new Error('Error with stack');
      errorWithStack.stack = 'Error: Error with stack\n    at test.js:1:1';
      filter.catch(errorWithStack, mockArgumentsHost);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: 'Error: Error with stack\n    at test.js:1:1',
        }),
      );
    });
    it('debería NO incluir stack trace cuando NODE_ENV es production', () => {
      process.env.NODE_ENV = 'production';
      const errorWithStack = new Error('Error with stack');
      errorWithStack.stack = 'Error: Error with stack\n    at test.js:1:1';
      filter.catch(errorWithStack, mockArgumentsHost);
      expect(mockResponse.json).not.toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.anything(),
        }),
      );
    });
    it('debería manejar Error sin stack trace', () => {
      const errorWithoutStack = new Error('Error without stack');
      delete errorWithoutStack.stack;
      filter.catch(errorWithoutStack, mockArgumentsHost);
      expect(mockResponse.json).not.toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.anything(),
        }),
      );
    });
  });

  describe('catch - Estructura de respuesta', () => {
    it('debería incluir todos los campos requeridos en la respuesta', () => {
      const genericError = new Error('Test error');
      filter.catch(genericError, mockArgumentsHost);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error',
          status: expect.any(Number),
          statusDescription: expect.any(String),
        }),
      );
    });
    it('debería generar timestamp válido', () => {
      const genericError = new Error('Test error');
      filter.catch(genericError, mockArgumentsHost);
      const callArgs = mockResponse.json.mock.calls[0][0];
      expect(callArgs).toHaveProperty('timestamp');
      const timestamp = callArgs.timestamp;
      expect(timestamp).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
      expect(new Date(timestamp).getTime()).not.toBeNaN();
    });
    it('debería incluir path correcto del request', () => {
      mockRequest.url = '/api/complex/path/with/params?query=value';
      const genericError = new Error('Test error');
      filter.catch(genericError, mockArgumentsHost);
      const callArgs = mockResponse.json.mock.calls[0][0];
      expect(callArgs).toHaveProperty('path', '/api/complex/path/with/params?query=value');
    });
  });

  describe('catch - Casos edge complejos', () => {
    it('debería manejar HttpException con response como string', () => {
      const httpException = new HttpException('String response', HttpStatus.BAD_REQUEST);
      filter.catch(httpException, mockArgumentsHost);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'String response',
        }),
      );
    });
    it('debería manejar objeto de error complejo en HttpException', () => {
      const complexErrorResponse = {
        message: ['Error 1', 'Error 2'],
        error: 'Complex Error',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        details: {
          field1: 'Invalid value',
          field2: 'Required field missing',
        },
      };
      const httpException = new HttpException(
        complexErrorResponse,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      filter.catch(httpException, mockArgumentsHost);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error 1, Error 2',
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          statusDescription: expect.any(String),
        }),
      );
    });
    it('debería manejar Error con propiedades adicionales', () => {
      const customError = new Error('Custom error');
      (customError as any).code = 'CUSTOM_CODE';
      (customError as any).details = { field: 'value' };
      filter.catch(customError, mockArgumentsHost);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Custom error',
        }),
      );
    });
  });

  describe('catch - Diferentes tipos de request', () => {
    it('debería manejar request PUT', () => {
      mockRequest.method = 'PUT';
      mockRequest.url = '/api/users/123';
      const httpException = new HttpException('Update failed', HttpStatus.BAD_REQUEST);
      filter.catch(httpException, mockArgumentsHost);
      const callArgs = mockResponse.json.mock.calls[0][0];
      expect(callArgs).toHaveProperty('path', '/api/users/123');
    });
    it('debería manejar request DELETE', () => {
      mockRequest.method = 'DELETE';
      mockRequest.url = '/api/users/456';
      const httpException = new HttpException('Delete failed', HttpStatus.FORBIDDEN);
      filter.catch(httpException, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      const callArgs = mockResponse.json.mock.calls[0][0];
      expect(callArgs).toHaveProperty('path', '/api/users/456');
    });
    it('debería manejar request PATCH', () => {
      mockRequest.method = 'PATCH';
      mockRequest.url = '/api/users/789';
      const httpException = new HttpException('Patch failed', HttpStatus.UNPROCESSABLE_ENTITY);
      filter.catch(httpException, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    });
  });
});
