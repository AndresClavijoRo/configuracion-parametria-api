/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../dto/response.dto';
import { Response } from 'express';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse<Response>();
    return next.handle().pipe(
      map((data) => {
        // Si ya es una instancia de ResponseDto, verificamos condiciones para 206
        if (data instanceof ResponseDto) {
          // Si es un array vacío
          if (data?.data?.response instanceof Array && data?.data?.response.length === 0) {
            response.status(206);
            return new ResponseDto(data?.data, 206, 'Partial Content');
          }

          // Si es un objeto vacío
          if (
            data?.data?.response &&
            typeof data.data.response === 'object' &&
            Object.keys(data?.data?.response).length === 0
          ) {
            response.status(206);
            return new ResponseDto(data?.data, 206, 'Partial Content');
          }

          // Si es null
          if (data?.data?.response === null) {
            response.status(206);
            return new ResponseDto(data?.data, 206, 'Partial Content');
          }

          return data;
        }

        // De lo contrario, lo envolvemos en un ResponseDto
        return new ResponseDto(data);
      }),
    );
  }
}
