import { Body, Controller, Post } from '@nestjs/common';
import { FiltrosSortingDto } from 'src/common/dto/filtros-sorting.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { ConfiguracionService } from '../../services/configuracion/configuracion.service';

@Controller('configuracion')
export class ConfiguracionController {
  constructor(private readonly configuracionService: ConfiguracionService) {}

  @Post('completa')
  obtenerConfiguracionCompleta(@Body() filtrosSorting: FiltrosSortingDto<{ entidadId: string }>) {
    // Implementación del servicio para obtener la configuración completa de una entidad
    return new ResponseDto({
      modulo: {},
      entidad: {},
      atributos: [],
    });
  }
}
