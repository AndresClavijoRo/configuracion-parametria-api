import { TipoOperacion } from './../../../../common/enums/tipo-operacion.enum';
import { ResponseDto } from './../../../../common/dto/response.dto';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DynamicOperationDto } from '../../dto/dynamic-operation.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrquestadorService {
  private readonly logger = new Logger(OrquestadorService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Ejecuta una operación enviándola al template API correspondiente
   * @param operacion Datos de la operación a ejecutar
   * @returns Resultado de la operación
   */
  async ejecutarOperacion(operacion: DynamicOperationDto) {
    try {
      if (!operacion.endpoint) {
        throw new BadRequestException('El endpoint es requerido para ejecutar la operación');
      }

      this.validateOperation(operacion);

      const { endpoint, ...templateOperation } = operacion;

      const response = await firstValueFrom(
        this.httpService.post(
          `${endpoint}/service/pendig/transversales/template-parametria/api/v1/crud`,
          templateOperation,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return new ResponseDto(
        response.data?.data || null,
        response.status,
        response.data?.status?.statusDescription || 'Operación ejecutada exitosamente',
      );
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage =
          error.response.data?.data?.requestError || error.response.data?.message || error.message;

        return new ResponseDto(
          {
            response: null,
            error: errorMessage,
            details: error.response.data,
          },
          statusCode,
          `Error en la operación: ${errorMessage}`,
        );
      } else if (error.request) {
        return new ResponseDto(
          {
            response: null,
            error: 'No se pudo conectar con el servicio template',
            details: 'Timeout o error de conexión',
          },
          503,
          'Servicio no disponible',
        );
      } else {
        return new ResponseDto(
          {
            response: null,
            error: error.message || 'Error interno del servidor',
          },
          400,
          'Error en el procesamiento de la operación',
        );
      }
    }
  }

  /**
   * Valida que la operación tenga todos los campos requeridos según su tipo
   * @param operacion Operación a validar
   */
  private validateOperation(operacion: DynamicOperationDto): void {
    // Validaciones específicas por tipo de operación
    switch (operacion.type) {
      case TipoOperacion.GET_ONE:
      case TipoOperacion.UPDATE:
      case TipoOperacion.PATCH:
      case TipoOperacion.DELETE:
        if (!operacion.id) {
          throw new BadRequestException(`La operación ${operacion.type} requiere un ID`);
        }
        break;

      case TipoOperacion.CREATE:
      case TipoOperacion.UPDATE:
      case TipoOperacion.PATCH:
        if (!operacion.data || Object.keys(operacion.data).length === 0) {
          throw new BadRequestException(`La operación ${operacion.type} requiere datos`);
        }
        break;
    }

    // Validar que la entidad tenga campos definidos
    if (!operacion.entityDefinition.fields || operacion.entityDefinition.fields.length === 0) {
      throw new BadRequestException('La definición de entidad debe tener al menos un campo');
    }

    // Validar que exista al menos una clave primaria
    const hasPrimaryKey = operacion.entityDefinition.fields.some((field) => field.isPrimary);
    if (!hasPrimaryKey) {
      throw new BadRequestException('La entidad debe tener al menos un campo como clave primaria');
    }
  }

  /**
   * Verifica si el template API está disponible
   * @param endpoint URL del template API
   * @returns Estado de conexión con el servicio
   */
  async checkTemplateHealth(endpoint: string): Promise<ResponseDto<any>> {
    try {
      await firstValueFrom(
        this.httpService.get(endpoint, {
          timeout: 5000,
        }),
      );

      return new ResponseDto(
        {
          response: {
            status: 'connected',
            endpoint: endpoint,
            message: 'Template API is available',
          },
        },
        200,
        'Connection successful',
      );
    } catch (error) {
      this.logger.error(`Error connecting to template: ${error.message}`);

      return new ResponseDto(
        {
          response: {
            status: 'disconnected',
            endpoint: endpoint,
            error: 'Unable to connect to template API',
          },
        },
        503,
        'Connection failed',
      );
    }
  }
}
