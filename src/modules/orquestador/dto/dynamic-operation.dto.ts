import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsObject,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoOperacion } from 'src/common/enums/tipo-operacion.enum';
import { TipoDato } from 'src/common/enums/tipo-dato.enum';

export class ValidationRuleDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  value: any;

  @IsString()
  @IsOptional()
  message?: string;
}

export class FieldDefinitionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  columnName: string;

  @IsEnum(TipoDato)
  type: TipoDato;

  @IsOptional()
  isPrimary?: boolean;

  @IsOptional()
  isRequired?: boolean;

  @IsOptional()
  isSearchable?: boolean;

  @IsOptional()
  isVisible?: boolean;

  @IsOptional()
  isEditable?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidationRuleDto)
  validationRules?: ValidationRuleDto[];

  @IsOptional()
  isAutoIncremental?: boolean;

  @IsOptional()
  @IsString()
  sequency?: string;
}

export class EntityDefinitionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  tableName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  connectionId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldDefinitionDto)
  fields: FieldDefinitionDto[];
}

export class PaginationOptionsDto {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;
}

export class SortingOptionsDto {
  @IsString()
  @IsNotEmpty()
  field: string;

  @IsString()
  @IsEnum(['ASC', 'DESC'])
  direction: 'ASC' | 'DESC' = 'ASC';
}

export class DynamicOperationDto {
  @IsEnum(TipoOperacion)
  type: TipoOperacion;

  @ValidateNested()
  @Type(() => EntityDefinitionDto)
  entityDefinition: EntityDefinitionDto;

  @IsOptional()
  @IsObject()
  filters?: any;

  @IsOptional()
  @IsObject()
  data?: any;

  @IsOptional()
  id?: any;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationOptionsDto)
  pagination?: PaginationOptionsDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortingOptionsDto)
  sorting?: SortingOptionsDto[];
}
