import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ResponseDto } from 'src/common/dto/response.dto';
import { ConfiguracionService } from '../../services/configuracion/configuracion.service';

@Controller('configuracion')
export class ConfiguracionController {
  constructor(private readonly configuracionService: ConfiguracionService) {}

  @Get('obtener')
  async obtenerConfiguracionCompleta(@Query('idEntidad') idEntidad: string) {
    if (!idEntidad) {
      throw new BadRequestException('El QueryParam idEntidad es requerido');
    }

    const resultado = await this.configuracionService.getConfiguracion(idEntidad);
    return new ResponseDto(resultado);
  }
}
