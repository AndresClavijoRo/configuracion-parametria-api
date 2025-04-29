import { Type } from 'class-transformer';
import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { PaginacionDto } from './paginacion.dto';

export class FiltrosSortingDto<T> {
  @IsObject()
  @IsOptional()
  data?: T;

  @ValidateNested()
  @Type(() => PaginacionDto)
  @IsOptional()
  paginacion?: PaginacionDto;

  @IsObject()
  @IsOptional()
  filtros?: Record<string, any>;

  @IsObject()
  @IsOptional()
  sorting?: Record<string, 'ASC' | 'DESC'>;
}
