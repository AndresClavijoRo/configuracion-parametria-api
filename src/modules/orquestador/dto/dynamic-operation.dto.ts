import { IsEnum, IsNotEmpty, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoOperacion } from '../../../common/enums/tipo-operacion.enum';

class EntityFieldDto {
  name: string;
  columnName: string;
  type: string;
  isVisible: boolean;
  isPrimary?: boolean;
}

class EntityDefinitionDto {
  name: string;
  tableName: string;
  description: string;
  connectionId: string;

  @ValidateNested({ each: true })
  @Type(() => EntityFieldDto)
  fields: EntityFieldDto[];
}

class PaginationDto {
  page: number;
  limit: number;
}

class SortingItemDto {
  field: string;
  direction: 'ASC' | 'DESC';
}

export class DynamicOperationDto {
  @IsEnum(TipoOperacion)
  @IsNotEmpty()
  type: TipoOperacion;

  @ValidateNested()
  @Type(() => EntityDefinitionDto)
  @IsNotEmpty()
  entityDefinition: EntityDefinitionDto;

  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @ValidateNested()
  @Type(() => PaginationDto)
  @IsOptional()
  pagination?: PaginationDto;

  @ValidateNested({ each: true })
  @Type(() => SortingItemDto)
  @IsOptional()
  sorting?: SortingItemDto[];
}
