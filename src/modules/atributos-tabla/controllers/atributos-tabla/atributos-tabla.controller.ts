import { BadRequestException, Body, Controller, HttpCode, Post, Query } from '@nestjs/common';
import { FiltrosSortingDto } from 'src/common/dto/filtros-sorting.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { CreateAtributosTablaDto } from '../../dto/create-atributos-tabla.dto';
import { FiltroAtributosTablaDto } from '../../dto/filtro-atributos-tabla.dto';
import { UpdateAtributosTablaDto } from '../../dto/update-atributos-tabla.dto';
import { AtributosTablaService } from '../../services/atributos-tabla/atributos-tabla.service';

@Controller('atributo-tabla')
export class AtributosTablaController {
  constructor(private readonly atributosTablaService: AtributosTablaService) {}

  @Post('listar')
  @HttpCode(200)
  async findAll(
    @Query('idEntidad') idEntidad: string,
    @Body() filtrosSorting: FiltrosSortingDto<FiltroAtributosTablaDto>,
  ) {
    const { filtros, paginacion, sorting } = filtrosSorting;
    const resultado = await this.atributosTablaService.findAll(
      idEntidad,
      filtros,
      paginacion?.pagina,
      paginacion?.size,
      sorting,
    );
    return new ResponseDto(resultado);
  }

  @Post('crear')
  async create(
    @Query('idEntidad') idEntidad: string,
    @Body() filtrosSorting: FiltrosSortingDto<CreateAtributosTablaDto>,
  ) {
    const { data } = filtrosSorting;

    if (!data) {
      throw new BadRequestException('Data es requerido');
    }

    if (!idEntidad) {
      throw new BadRequestException('idEntidad es requerido');
    }
    const resultado = await this.atributosTablaService.create(idEntidad, data);

    return new ResponseDto(resultado);
  }

  @Post('actualizar')
  @HttpCode(200)
  async update(
    @Query('idEntidad') idEntidad: string,
    @Body() filtrosSorting: FiltrosSortingDto<UpdateAtributosTablaDto & { _id: string }>,
  ) {
    if (!idEntidad) {
      throw new BadRequestException('idEntidad es requerido');
    }

    const { data } = filtrosSorting;
    if (!data) {
      throw new BadRequestException('Data is required');
    }

    const { _id, ...updateData } = data;

    if (!_id) {
      throw new BadRequestException('id atributo tabla es requerido');
    }

    const resultado = await this.atributosTablaService.update(idEntidad, _id, updateData);
    return new ResponseDto(resultado);
  }

  @Post('eliminar')
  @HttpCode(200)
  remove(
    @Query('idEntidad') idEntidad: string,
    @Body() filtrosSorting: FiltrosSortingDto<{ _id: string }>,
  ) {
    if (!idEntidad) {
      throw new BadRequestException('idEntidad es requerido');
    }

    const { data } = filtrosSorting;
    if (!data) {
      throw new BadRequestException('Data es requerido');
    }

    const { _id } = data;

    if (!_id) {
      throw new BadRequestException('id atributo tabla es requerido');
    }

    return this.atributosTablaService.remove(idEntidad, _id);
  }
}
