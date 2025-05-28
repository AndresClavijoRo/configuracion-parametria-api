import { EventHubProducerClient } from '@azure/event-hubs';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { IncomingHttpHeaders } from 'http';
import { Observable, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';

@Injectable()
export class EventHubInterceptor implements NestInterceptor {
  private producerClient: EventHubProducerClient;

  constructor(
    private readonly connectionString: string,
    private readonly eventHubName: string,
  ) {
    this.producerClient = new EventHubProducerClient(this.connectionString, this.eventHubName);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const httpCtx = context.switchToHttp();
    const request = httpCtx.getRequest();
    const response = httpCtx.getResponse<Response>();

    const {
      method,
      url,
      headers,
      query,
      body,
    }: {
      method: string;
      url: string;
      headers: IncomingHttpHeaders;
      query: any;
      body: any;
    } = request;
    const uuid = uuidv4();

    return next.handle().pipe(
      tap((resultRequest: any) => {
        const endTime = Date.now();
        const finalResponse = resultRequest;
        void this.producerClient
          .sendBatch([
            {
              body: {
                idlog: uuid,
                serviceName: 'pendig-ms-seguridad-configuracion-parametria-nodejs',
                tipoMetodo: method,
                headers: headers,
                parameters: query,
                uri: url,
                timeInput: new Date(startTime).toISOString(),
                timeOutput: new Date(endTime).toISOString(),
                timeExecution: endTime - startTime,
                requestBody: body,
                responseBody: finalResponse,
                codeError: String(response.statusCode),
                tracerError: '',
                componentName: 'pendig-ms-seguridad-configuracion-parametria-nodejs',
                iVEncript: '',
              },
            },
          ])
          .catch((error) => {
            console.error('Error sending event to event hub:', error);
          });
      }),
    );
  }
}
