import { Body, Controller, Post } from '@nestjs/common';
import { FiltrosSortingDto } from 'src/common/dto/filtros-sorting.dto';
import { CreateAtributosTablaDto } from '../../dto/create-atributos-tabla.dto';
import { FiltroAtributosTablaDto } from '../../dto/filtro-atributos-tabla.dto';
import { AtributosTablaService } from '../../services/atributos-tabla/atributos-tabla.service';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UpdateAtributosTablaDto } from '../../dto/update-atributos-tabla.dto';

@Controller('atributos-tabla')
export class AtributosTablaController {
  constructor(private readonly atributosTablaService: AtributosTablaService) {}

  @Post('listar')
  findAll(@Body() filtrosSorting: FiltrosSortingDto<FiltroAtributosTablaDto>) {
    // Implementación del servicio para obtener atributos con paginación y filtros
    return new ResponseDto({ items: [], total: 0 });
  }

  @Post('crear')
  create(@Body() filtrosSorting: FiltrosSortingDto<CreateAtributosTablaDto>) {
    // Implementación del servicio para crear un atributo
    return new ResponseDto({ id: 'nuevo-id-generado' });
  }

  @Post('actualizar')
  update(@Body() filtrosSorting: FiltrosSortingDto<UpdateAtributosTablaDto>) {
    // Implementación del servicio para actualizar un atributo
    return new ResponseDto({ success: true });
  }

  @Post('eliminar')
  remove(@Body() filtrosSorting: FiltrosSortingDto<{ id: string }>) {
    // Implementación del servicio para eliminar un atributo
    return new ResponseDto({ success: true });
  }
}
