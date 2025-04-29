import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const typedResponse = exceptionResponse as Record<string, unknown>;
        message =
          typeof typedResponse.message === 'string'
            ? typedResponse.message
            : 'Error en la solicitud';
      } else {
        message = exceptionResponse.toString();
      }
    }

    const errorResponse = new ErrorResponseDto(
      message,
      status,
      status === HttpStatus.BAD_REQUEST
        ? 'Valores nulos o incorrectos en los parámetros de entrada.'
        : 'Error en el procesamiento de la solicitud.',
    );

    response.status(status).json(errorResponse);
  }
}
