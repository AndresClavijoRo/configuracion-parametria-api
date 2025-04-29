import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { FiltrosSortingDto } from 'src/common/dto/filtros-sorting.dto';
import { FiltroModuloDto } from '../../dto/filtro-modulo.dto';
import { ModuloService } from '../../services/modulo/modulo.service';
import { CreateModuloDto } from '../../dto/create-modulo.dto';
import { UpdateModuloDto } from '../../dto/update-modulo.dto';
import { ResponseDto } from 'src/common/dto/response.dto';

@Controller('modulo')
export class ModuloController {
  constructor(private readonly moduloService: ModuloService) {}

  @Post('listar')
  async findAll(@Body() filtrosSorting: FiltrosSortingDto<FiltroModuloDto>) {
    const { filtros, paginacion, sorting } = filtrosSorting;
    const resultado = await this.moduloService.findAll(
      filtros,
      paginacion?.pagina,
      paginacion?.size,
      sorting,
    );

    return new ResponseDto(resultado);
  }

  @Post('crear')
  async create(@Body() filtrosSorting: FiltrosSortingDto<CreateModuloDto>) {
    const { data } = filtrosSorting;
    if (!data) {
      throw new BadRequestException('Data is required');
    }
    const resultado = await this.moduloService.create(data);

    return new ResponseDto(resultado);
  }

  @Post('actualizar')
  async update(@Body() filtrosSorting: FiltrosSortingDto<UpdateModuloDto & { id: string }>) {
    const { data } = filtrosSorting;
    if (!data) {
      throw new BadRequestException('Data is required');
    }
    const { id, ...updateData } = data;

    const resultado = await this.moduloService.update(id, updateData);

    return new ResponseDto(resultado);
  }

  @Post('eliminar')
  async remove(@Body() filtrosSorting: FiltrosSortingDto<{ id: string }>) {
    const { data } = filtrosSorting;
    if (!data) {
      throw new BadRequestException('Data is required');
    }
    const resultado = await this.moduloService.remove(data.id);

    return new ResponseDto(resultado);
  }

  @Post('obtener')
  async findOne(@Body() filtrosSorting: FiltrosSortingDto<{ id: string }>) {
    const { data } = filtrosSorting;
    if (!data) {
      throw new BadRequestException('Data is required');
    }
    const resultado = await this.moduloService.findOne(data.id);

    return new ResponseDto(resultado);
  }
}
