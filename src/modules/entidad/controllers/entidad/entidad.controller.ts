import { BadRequestException, Body, Controller, HttpCode, Post, Query } from '@nestjs/common';
import { FiltrosSortingDto } from 'src/common/dto/filtros-sorting.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { CreateEntidadDto } from '../../dto/create-entidad.dto';
import { FiltroEntidadDto } from '../../dto/filtro-entidad.dto';
import { UpdateEntidadDto } from '../../dto/update-entidad.dto';
import { EntidadService } from '../../services/entidad/entidad.service';

@Controller('entidad')
export class EntidadController {
  constructor(private readonly entidadService: EntidadService) {}

  @Post('listar')
  @HttpCode(200)
  async findAll(
    @Query('idModulo') idModulo: string,
    @Body() filtrosSorting: FiltrosSortingDto<FiltroEntidadDto>,
  ) {
    const { filtros, paginacion, sorting } = filtrosSorting;
    const resultado = await this.entidadService.findAll(
      idModulo,
      filtros,
      paginacion?.pagina,
      paginacion?.size,
      sorting,
    );

    return new ResponseDto(resultado);
  }

  @Post('crear')
  async create(
    @Query('idModulo') idModulo: string,
    @Body() filtrosSorting: FiltrosSortingDto<CreateEntidadDto>,
  ) {
    const { data } = filtrosSorting;
    if (!data) {
      throw new BadRequestException('Data is required');
    }
    const resultado = await this.entidadService.create(idModulo, data);

    return new ResponseDto(resultado);
  }

  @Post('actualizar')
  @HttpCode(200)
  async update(
    @Query('idModulo') idModulo: string,
    @Body() filtrosSorting: FiltrosSortingDto<UpdateEntidadDto & { _id: string }>,
  ) {
    if (!idModulo) {
      throw new BadRequestException('idModulo is required');
    }
    const { data } = filtrosSorting;
    if (!data) {
      throw new BadRequestException('Data is required');
    }

    const { _id, ...updateData } = data;

    const resultado = await this.entidadService.update(idModulo, _id, updateData);
    return new ResponseDto(resultado);
  }

  @Post('eliminar')
  @HttpCode(200)
  async remove(@Body() filtrosSorting: FiltrosSortingDto<{ _id: string }>) {
    const { data } = filtrosSorting;
    if (!data) {
      throw new BadRequestException('Data is required');
    }
    const resultado = await this.entidadService.remove(data._id);

    return new ResponseDto(resultado);
  }

  @Post('obtener')
  @HttpCode(200)
  async findOne(@Body() filtrosSorting: FiltrosSortingDto<{ _id: string }>) {
    const { data } = filtrosSorting;
    if (!data) {
      throw new BadRequestException('Data is required');
    }
    const resultado = await this.entidadService.findOne(data._id);

    return new ResponseDto(resultado);
  }
}
