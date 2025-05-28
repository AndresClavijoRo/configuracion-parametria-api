import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Response, Request } from 'express';
import { of, throwError, tap } from 'rxjs';
import { EventHubInterceptor } from './event-hub.interceptor';

// Mock del EventHubProducerClient
jest.mock('@azure/event-hubs', () => ({
  EventHubProducerClient: jest.fn().mockImplementation(() => ({
    sendBatch: jest.fn(),
  })),
}));

// Mock de uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-123'),
}));

describe('EventHubInterceptor', () => {
  let interceptor: EventHubInterceptor;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockCallHandler: jest.Mocked<CallHandler>;
  let mockResponse: jest.Mocked<Response>;
  let mockRequest: jest.Mocked<Request>;
  let mockProducerClient: any;

  const testConnectionString =
    'Endpoint=sb://test.servicebus.windows.net/;SharedAccessKeyName=test;SharedAccessKey=test';
  const testEventHubName = 'test-event-hub';

  beforeEach(() => {
    // Mock del EventHubProducerClient
    const { EventHubProducerClient } = require('@azure/event-hubs');
    mockProducerClient = {
      sendBatch: jest.fn().mockResolvedValue(undefined),
    };
    EventHubProducerClient.mockImplementation(() => mockProducerClient);

    interceptor = new EventHubInterceptor(testConnectionString, testEventHubName);

    // Mock del Request
    mockRequest = {
      method: 'GET',
      url: '/api/test',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'test-agent',
        authorization: 'Bearer token',
      },
      query: { page: '1', size: '10' },
      body: { test: 'data' },
    } as any;

    // Mock del Response
    mockResponse = {
      statusCode: 200,
    } as any;

    // Mock del HttpContext
    const mockHttpContext = {
      getResponse: jest.fn().mockReturnValue(mockResponse),
      getRequest: jest.fn().mockReturnValue(mockRequest),
    };

    // Mock del ExecutionContext
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

    // Mock console.log para evitar ruido en tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Definición del interceptor', () => {
    it('should be defined', () => {
      expect(interceptor).toBeDefined();
    });

    it('debería crear EventHubProducerClient con parámetros correctos', () => {
      const { EventHubProducerClient } = require('@azure/event-hubs');
      expect(EventHubProducerClient).toHaveBeenCalledWith(testConnectionString, testEventHubName);
    });
  });

  describe('intercept - Operación exitosa', () => {
    it('debería enviar evento a EventHub después de operación exitosa', (done) => {
      const testResponse = { success: true, data: 'test' };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe((result) => {
        expect(result).toEqual(testResponse);

        // Dar tiempo para que se procese el tap
        setTimeout(() => {
          expect(mockProducerClient.sendBatch).toHaveBeenCalledWith([
            {
              body: expect.objectContaining({
                idlog: 'mocked-uuid-123',
                serviceName: 'pendig-ms-seguridad-configuracion-parametria-nodejs',
                tipoMetodo: 'GET',
                headers: mockRequest.headers,
                parameters: mockRequest.query,
                uri: '/api/test',
                timeInput: expect.any(String),
                timeOutput: expect.any(String),
                timeExecution: expect.any(Number),
                requestBody: mockRequest.body,
                responseBody: testResponse,
                codeError: '200',
                tracerError: '',
                componentName: 'pendig-ms-seguridad-configuracion-parametria-nodejs',
                iVEncript: '',
              }),
            },
          ]);
          done();
        }, 100);
      });
    });

    it('debería generar UUID único para cada request', (done) => {
      const { v4: uuidv4 } = require('uuid');
      let callCount = 0;
      uuidv4.mockImplementation(() => `uuid-${++callCount}`);

      const testResponse = { data: 'test1' };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe(() => {
        setTimeout(() => {
          expect(mockProducerClient.sendBatch).toHaveBeenCalledWith([
            {
              body: expect.objectContaining({
                idlog: 'uuid-1',
              }),
            },
          ]);
          done();
        }, 100);
      });
    });

    it('debería capturar tiempo de ejecución correctamente', (done) => {
      const testResponse = { data: 'test' };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe(() => {
        setTimeout(() => {
          const sentData = mockProducerClient.sendBatch.mock.calls[0][0][0].body;
          expect(sentData.timeExecution).toBeGreaterThanOrEqual(0);
          expect(typeof sentData.timeExecution).toBe('number');

          const timeInput = new Date(sentData.timeInput);
          const timeOutput = new Date(sentData.timeOutput);
          expect(timeOutput.getTime()).toBeGreaterThanOrEqual(timeInput.getTime());
          done();
        }, 100);
      });
    });
  });

  describe('intercept - Diferentes métodos HTTP', () => {
    it('debería manejar método POST', (done) => {
      mockRequest.method = 'POST';
      const testResponse = { created: true };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe(() => {
        setTimeout(() => {
          expect(mockProducerClient.sendBatch).toHaveBeenCalledWith([
            {
              body: expect.objectContaining({
                tipoMetodo: 'POST',
              }),
            },
          ]);
          done();
        }, 100);
      });
    });

    it('debería manejar método PUT', (done) => {
      mockRequest.method = 'PUT';
      const testResponse = { updated: true };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe(() => {
        setTimeout(() => {
          expect(mockProducerClient.sendBatch).toHaveBeenCalledWith([
            {
              body: expect.objectContaining({
                tipoMetodo: 'PUT',
              }),
            },
          ]);
          done();
        }, 100);
      });
    });

    it('debería manejar método DELETE', (done) => {
      mockRequest.method = 'DELETE';
      mockResponse.statusCode = 204;
      const testResponse = null;
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe(() => {
        setTimeout(() => {
          expect(mockProducerClient.sendBatch).toHaveBeenCalledWith([
            {
              body: expect.objectContaining({
                tipoMetodo: 'DELETE',
                codeError: '204',
                responseBody: null,
              }),
            },
          ]);
          done();
        }, 100);
      });
    });
  });

  describe('intercept - Diferentes códigos de estado', () => {
    it('debería capturar código de estado 201', (done) => {
      mockResponse.statusCode = 201;
      const testResponse = { created: true };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe(() => {
        setTimeout(() => {
          expect(mockProducerClient.sendBatch).toHaveBeenCalledWith([
            {
              body: expect.objectContaining({
                codeError: '201',
              }),
            },
          ]);
          done();
        }, 100);
      });
    });

    it('debería capturar código de estado 400', (done) => {
      mockResponse.statusCode = 400;
      const testResponse = { error: 'Bad Request' };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe(() => {
        setTimeout(() => {
          expect(mockProducerClient.sendBatch).toHaveBeenCalledWith([
            {
              body: expect.objectContaining({
                codeError: '400',
              }),
            },
          ]);
          done();
        }, 100);
      });
    });

    it('debería capturar código de estado 500', (done) => {
      mockResponse.statusCode = 500;
      const testResponse = { error: 'Internal Server Error' };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe(() => {
        setTimeout(() => {
          expect(mockProducerClient.sendBatch).toHaveBeenCalledWith([
            {
              body: expect.objectContaining({
                codeError: '500',
              }),
            },
          ]);
          done();
        }, 100);
      });
    });
  });

  describe('intercept - Datos de request complejos', () => {
    it('debería manejar headers complejos', (done) => {
      mockRequest.headers = {
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        'x-forwarded-for': '192.168.1.1',
        'x-custom-header': 'custom-value',
      };

      const testResponse = { data: 'test' };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe(() => {
        setTimeout(() => {
          expect(mockProducerClient.sendBatch).toHaveBeenCalledWith([
            {
              body: expect.objectContaining({
                headers: mockRequest.headers,
              }),
            },
          ]);
          done();
        }, 100);
      });
    });

    it('debería manejar query parameters complejos', (done) => {
      mockRequest.query = {
        page: '1',
        size: '20',
        filter: 'active',
        sort: 'name,asc',
        include: ['profile', 'settings'],
      };

      const testResponse = { data: 'test' };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe(() => {
        setTimeout(() => {
          expect(mockProducerClient.sendBatch).toHaveBeenCalledWith([
            {
              body: expect.objectContaining({
                parameters: mockRequest.query,
              }),
            },
          ]);
          done();
        }, 100);
      });
    });

    it('debería manejar body complejo', (done) => {
      mockRequest.body = {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          profile: {
            age: 30,
            preferences: ['dark-theme', 'notifications'],
          },
        },
        metadata: {
          source: 'web',
          timestamp: '2023-01-01T00:00:00Z',
        },
      };

      const testResponse = { success: true };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe(() => {
        setTimeout(() => {
          expect(mockProducerClient.sendBatch).toHaveBeenCalledWith([
            {
              body: expect.objectContaining({
                requestBody: mockRequest.body,
              }),
            },
          ]);
          done();
        }, 100);
      });
    });
  });

  describe('intercept - Manejo de errores en EventHub', () => {
    it('debería manejar error en sendBatch sin interrumpir el flujo', (done) => {
      const eventHubError = new Error('EventHub connection failed');
      mockProducerClient.sendBatch.mockRejectedValue(eventHubError);

      const testResponse = { data: 'test' };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe((result) => {
        expect(result).toEqual(testResponse);

        setTimeout(() => {
          expect(console.error).toHaveBeenCalledWith(
            'Error sending event to event hub:',
            eventHubError,
          );
          done();
        }, 100);
      });
    });

    it('debería continuar procesamiento incluso si EventHub falla', (done) => {
      mockProducerClient.sendBatch.mockRejectedValue(new Error('Network error'));

      const testResponse = { important: 'data' };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe((result) => {
        // La respuesta debe llegar sin problemas
        expect(result).toEqual(testResponse);
        done();
      });
    });
  });

  describe('intercept - Casos edge', () => {
    it('debería manejar request sin headers', (done) => {
      mockRequest.headers = {};
      const testResponse = { data: 'test' };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe(() => {
        setTimeout(() => {
          expect(mockProducerClient.sendBatch).toHaveBeenCalledWith([
            {
              body: expect.objectContaining({
                headers: {},
              }),
            },
          ]);
          done();
        }, 100);
      });
    });

    it('debería manejar request sin query parameters', (done) => {
      mockRequest.query = {};
      const testResponse = { data: 'test' };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe(() => {
        setTimeout(() => {
          expect(mockProducerClient.sendBatch).toHaveBeenCalledWith([
            {
              body: expect.objectContaining({
                parameters: {},
              }),
            },
          ]);
          done();
        }, 100);
      });
    });

    it('debería manejar request sin body', (done) => {
      mockRequest.body = undefined;
      const testResponse = { data: 'test' };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe(() => {
        setTimeout(() => {
          expect(mockProducerClient.sendBatch).toHaveBeenCalledWith([
            {
              body: expect.objectContaining({
                requestBody: undefined,
              }),
            },
          ]);
          done();
        }, 100);
      });
    });

    it('debería manejar URL muy larga', (done) => {
      const longUrl = '/api/very/long/url/' + 'segment/'.repeat(100) + 'end';
      mockRequest.url = longUrl;

      const testResponse = { data: 'test' };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe(() => {
        setTimeout(() => {
          expect(mockProducerClient.sendBatch).toHaveBeenCalledWith([
            {
              body: expect.objectContaining({
                uri: longUrl,
              }),
            },
          ]);
          done();
        }, 100);
      });
    });

    it('debería manejar response muy grande', (done) => {
      const largeResponse = {
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          description: 'x'.repeat(100),
        })),
      };

      mockCallHandler.handle.mockReturnValue(of(largeResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe(() => {
        setTimeout(() => {
          expect(mockProducerClient.sendBatch).toHaveBeenCalledWith([
            {
              body: expect.objectContaining({
                responseBody: largeResponse,
              }),
            },
          ]);
          done();
        }, 100);
      });
    });
  });

  describe('intercept - Formato de timestamps', () => {
    it('debería generar timestamps en formato ISO', (done) => {
      const testResponse = { data: 'test' };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe(() => {
        setTimeout(() => {
          const sentData = mockProducerClient.sendBatch.mock.calls[0][0][0].body;

          // Verificar que los timestamps están en formato ISO
          expect(sentData.timeInput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
          expect(sentData.timeOutput).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

          // Verificar que son fechas válidas
          expect(new Date(sentData.timeInput).getTime()).not.toBeNaN();
          expect(new Date(sentData.timeOutput).getTime()).not.toBeNaN();

          done();
        }, 100);
      });
    });
  });

  describe('intercept - Nombres de servicio', () => {
    it('debería usar el nombre de servicio correcto', (done) => {
      const testResponse = { data: 'test' };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe(() => {
        setTimeout(() => {
          expect(mockProducerClient.sendBatch).toHaveBeenCalledWith([
            {
              body: expect.objectContaining({
                serviceName: 'pendig-ms-seguridad-configuracion-parametria-nodejs',
                componentName: 'pendig-ms-seguridad-configuracion-parametria-nodejs',
              }),
            },
          ]);
          done();
        }, 100);
      });
    });
  });

  describe('intercept - Compatibilidad con errores en el pipeline', () => {
    it('debería manejar errores en el CallHandler', (done) => {
      const pipelineError = new Error('Controller error');
      mockCallHandler.handle.mockReturnValue(throwError(() => pipelineError));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe({
        next: () => {
          done.fail('No debería ejecutarse el next');
        },
        error: (error) => {
          expect(error).toBe(pipelineError);

          // El interceptor no debería enviar evento en caso de error en el pipeline
          setTimeout(() => {
            expect(mockProducerClient.sendBatch).not.toHaveBeenCalled();
            done();
          }, 100);
        },
      });
    });

    it('debería permitir que errores del pipeline continúen sin interferencia', (done) => {
      const controllerError = new Error('Validation failed');
      mockCallHandler.handle.mockReturnValue(throwError(() => controllerError));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$.subscribe({
        error: (error) => {
          expect(error).toBe(controllerError);
          expect(error.message).toBe('Validation failed');
          done();
        },
      });
    });
  });

  describe('intercept - Rendimiento y memoria', () => {
    it('debería procesar múltiples requests simultáneos', (done) => {
      const testResponse = { data: 'test' };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const requests = Array.from({ length: 10 }, () =>
        interceptor.intercept(mockExecutionContext, mockCallHandler),
      );

      Promise.all(requests.map((r) => r.toPromise())).then(() => {
        setTimeout(() => {
          expect(mockProducerClient.sendBatch).toHaveBeenCalledTimes(10);
          done();
        }, 200);
      });
    });

    it('debería manejar requests con tiempos de ejecución variables', (done) => {
      const fastResponse = { data: 'fast' };
      const slowResponse = { data: 'slow' };

      const fastCall = mockCallHandler.handle.mockReturnValueOnce(of(fastResponse));
      const slowCall = mockCallHandler.handle.mockReturnValueOnce(
        of(slowResponse).pipe(
          // Simular delay
          tap(() => new Promise((resolve) => setTimeout(resolve, 50))),
        ),
      );

      const fastResult$ = interceptor.intercept(mockExecutionContext, mockCallHandler);
      const slowResult$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      Promise.all([fastResult$.toPromise(), slowResult$.toPromise()]).then(() => {
        setTimeout(() => {
          expect(mockProducerClient.sendBatch).toHaveBeenCalledTimes(2);

          const calls = mockProducerClient.sendBatch.mock.calls;
          const fastExecution = calls[0][0][0].body.timeExecution;
          const slowExecution = calls[1][0][0].body.timeExecution;

          expect(typeof fastExecution).toBe('number');
          expect(typeof slowExecution).toBe('number');
          expect(slowExecution).toBeGreaterThanOrEqual(fastExecution);

          done();
        }, 200);
      });
    });
  });

  describe('intercept - Integración con Observable', () => {
    it('debería mantener la cadena de Observable intacta', (done) => {
      const testResponse = { data: 'test' };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      // Verificar que devuelve un Observable
      expect(result$.subscribe).toBeDefined();
      expect(typeof result$.subscribe).toBe('function');

      result$.subscribe((result) => {
        expect(result).toEqual(testResponse);
        done();
      });
    });

    it('debería permitir encadenamiento con otros operadores', (done) => {
      const testResponse = { data: 'original' };
      mockCallHandler.handle.mockReturnValue(of(testResponse));

      const result$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result$
        .pipe(
          tap((response) => {
            expect(response).toEqual(testResponse);
          }),
        )
        .subscribe((finalResult) => {
          expect(finalResult).toEqual(testResponse);
          done();
        });
    });
  });
});
