import { Body, Controller, Post } from '@nestjs/common';
import { FiltrosSortingDto } from 'src/common/dto/filtros-sorting.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { FiltroEntidadDto } from '../../dto/filtro-entidad.dto';
import { EntidadService } from '../../services/entidad/entidad.service';
import { CreateEntidadDto } from '../../dto/create-entidad.dto';
import { UpdateEntidadDto } from '../../dto/update-entidad.dto';

@Controller('entidad')
export class EntidadController {
  constructor(private readonly entidadService: EntidadService) {}

  @Post('listar')
  findAll(@Body() filtrosSorting: FiltrosSortingDto<FiltroEntidadDto>) {
    // Implementación del servicio para obtener entidades con paginación y filtros
    return new ResponseDto({ items: [], total: 0 });
  }

  @Post('crear')
  create(@Body() filtrosSorting: FiltrosSortingDto<CreateEntidadDto>) {
    // Implementación del servicio para crear una entidad
    return new ResponseDto({ id: 'nuevo-id-generado' });
  }

  @Post('actualizar')
  update(@Body() filtrosSorting: FiltrosSortingDto<UpdateEntidadDto>) {
    // Implementación del servicio para actualizar una entidad
    return new ResponseDto({ success: true });
  }

  @Post('eliminar')
  remove(@Body() filtrosSorting: FiltrosSortingDto<{ id: string }>) {
    // Implementación del servicio para eliminar una entidad
    return new ResponseDto({ success: true });
  }
}
