import { BadRequestException, Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { OrquestadorService } from '../../services/orquestador/orquestador.service';
import { DynamicOperationDto } from '../../dto/dynamic-operation.dto';
import { ResponseDto } from 'src/common/dto/response.dto';

@Controller('orquestador')
export class OrquestadorController {
  constructor(private readonly orquestadorService: OrquestadorService) {}

  /**
   * Ejecuta una operación CRUD en el template API correspondiente
   * @param operacion Configuración de la operación a ejecutar
   * @returns Resultado de la operación
   */
  @Post('ejecutar')
  @HttpCode(200)
  async ejecutarOperacion(@Body() operacion: DynamicOperationDto): Promise<ResponseDto<any>> {
    return await this.orquestadorService.ejecutarOperacion(operacion);
  }

  /**
   * Verifica si hay conexión con el template API
   * @param endpoint URL del template API a verificar
   * @returns Estado de conexión
   */
  @Get('health')
  async checkHealth(@Query('endPoint') endPoint: string): Promise<ResponseDto<any>> {
    if (!endPoint) {
      throw new BadRequestException('El QueryParam endPoint es requerido');
    }

    return await this.orquestadorService.checkTemplateHealth(endPoint);
  }
}
