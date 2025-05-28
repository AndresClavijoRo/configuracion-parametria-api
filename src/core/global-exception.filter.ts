import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Error interno del servidor';
    let statusDescription = 'Error en el procesamiento de la solicitud.';
    let stack: string | undefined = undefined;
    let path = request?.url || '';
    let timestamp = new Date().toISOString();

    // Manejar excepciones HTTP de NestJS
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        // Si es un DTO custom, devolverlo tal cual
        if (
          'status' in exceptionResponse &&
          'statusDescription' in exceptionResponse &&
          ('message' in exceptionResponse || 'data' in exceptionResponse)
        ) {
          // Logging
          console.error(
            `[${new Date().toISOString()}] Error procesando ${request.method} ${request.url}:`,
            exception,
          );
          return response.status(status).json(exceptionResponse);
        }
        // Si es un objeto con message
        if ('message' in exceptionResponse) {
          if (Array.isArray((exceptionResponse as any).message)) {
            message = (exceptionResponse as any).message.join(', ');
          } else {
            message = (exceptionResponse as any).message || 'Error en la solicitud';
          }
        } else {
          message = 'Error en la solicitud';
        }
      } else {
        message = exceptionResponse?.toString?.() || 'Error en la solicitud';
      }
      // Descripciones por status
      if (status === HttpStatus.BAD_REQUEST) {
        statusDescription = 'Valores nulos o incorrectos en los parámetros de entrada.';
      } else if (status === HttpStatus.NOT_FOUND) {
        statusDescription = 'Recurso no encontrado.';
      } else if (status === HttpStatus.UNAUTHORIZED) {
        statusDescription = 'No autorizado para realizar esta operación.';
      } else if (status === HttpStatus.FORBIDDEN) {
        statusDescription = 'Acceso prohibido a este recurso.';
      } else if (status === HttpStatus.CONFLICT) {
        statusDescription = 'Violación de restricción de unicidad.';
      } else if (status === HttpStatus.UNPROCESSABLE_ENTITY) {
        statusDescription = 'Validation failed';
      }
    }
    // Manejar errores específicos de MongoDB
    else if (exception instanceof MongoError) {
      if (exception.code === 11000) {
        status = HttpStatus.CONFLICT;
        message = 'Violación de restricción de unicidad.';
        statusDescription = 'Ya existe un registro con esos datos.';
      }
    }
    // Manejar errores de validación de class-validator
    else if (exception instanceof Error && exception.name === 'ValidationError') {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      statusDescription = 'Error de validación en los datos de entrada.';
    }
    // Otros errores estándar
    else if (exception instanceof Error) {
      message = exception.message || '';
      if (process.env.NODE_ENV !== 'production' && exception.stack) {
        stack = exception.stack;
      }
    } else if (exception === null) {
      message = 'null';
    } else if (typeof exception === 'undefined') {
      message = 'undefined';
    } else if (typeof exception === 'string') {
      message = exception;
    }

    // Construir respuesta
    const errorResponse: any = {
      message,
      status,
      statusDescription,
      path,
      timestamp,
    };
    if (stack) {
      errorResponse.stack = stack;
    }

    // Logging
    console.error(
      `[${new Date().toISOString()}] Error procesando ${request.method} ${request.url}:`,
      exception,
    );

    response.status(status).json(errorResponse);
  }
}
