import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { MongoError } from 'mongodb';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let statusDescription = 'Error en el procesamiento de la solicitud.';

    // Manejar excepciones HTTP de NestJS
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        // Define the shape of the exception response
        const isErrorResponse = (obj: unknown): obj is { message: string | string[] } =>
          typeof obj === 'object' && obj !== null && 'message' in obj;

        if (isErrorResponse(exceptionResponse)) {
          message = Array.isArray(exceptionResponse.message)
            ? exceptionResponse.message.join(', ')
            : exceptionResponse.message || 'Error en la solicitud';
        } else {
          message = 'Error en la solicitud';
        }
      } else {
        message = exceptionResponse.toString();
      }

      if (status === HttpStatus.BAD_REQUEST) {
        statusDescription = 'Valores nulos o incorrectos en los parámetros de entrada.';
      } else if (status === HttpStatus.NOT_FOUND) {
        statusDescription = 'Recurso no encontrado.';
      } else if (status === HttpStatus.UNAUTHORIZED) {
        statusDescription = 'No autorizado para realizar esta operación.';
      } else if (status === HttpStatus.FORBIDDEN) {
        statusDescription = 'Acceso prohibido a este recurso.';
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

    const errorResponse = new ErrorResponseDto(message, status, statusDescription);

    // Registrar el error para debugging
    console.error(
      `[${new Date().toISOString()}] Error procesando ${request.method} ${request.url}:`,
      exception,
    );

    response.status(status).json(errorResponse);
  }
}
