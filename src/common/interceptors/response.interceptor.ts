import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../dto/response.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Si ya es una instancia de ResponseDto, simplemente lo devolvemos
        if (data instanceof ResponseDto) {
          return data;
        }

        // De lo contrario, lo envolvemos en un ResponseDto
        return new ResponseDto(data);
      }),
    );
  }
}
