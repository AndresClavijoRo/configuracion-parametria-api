import { Body, Controller, Post } from '@nestjs/common';
import { OrquestadorService } from '../../services/orquestador/orquestador.service';
import { DynamicOperationDto } from '../../dto/dynamic-operation.dto';
import { ResponseDto } from 'src/common/dto/response.dto';

@Controller('orquestador')
export class OrquestadorController {
  constructor(private readonly orquestadorService: OrquestadorService) {}

  @Post('ejecutar')
  ejecutarOperacion(@Body() operacion: DynamicOperationDto) {
    const result = this.orquestadorService.ejecutarOperacion(operacion);
    return result;
  }
}
