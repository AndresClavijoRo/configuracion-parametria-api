import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsObject,
  IsArray,
  IsUrl,
  IsBoolean,
  Matches,
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
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  isSearchable?: boolean;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  isEditable?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidationRuleDto)
  validationRules?: ValidationRuleDto[];

  @IsOptional()
  @IsBoolean()
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
  @IsNotEmpty()
  fields: FieldDefinitionDto[];
}

export class PaginationOptionsDto {
  @IsOptional()
  pagina?: number = 1;

  @IsOptional()
  size?: number = 10;
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
  @IsNotEmpty()
  type: TipoOperacion;

  @ValidateNested()
  @Type(() => EntityDefinitionDto)
  @IsNotEmpty()
  entityDefinition: EntityDefinitionDto;

  @IsString()
  @IsNotEmpty()
  @Matches(/^https?:\/\/.+/, {
    message: 'El endpoint debe ser una URL válida que comience con http:// o https://',
  })
  endpoint: string;

  @IsOptional()
  @IsObject()
  filtros?: any;

  @IsOptional()
  @IsObject()
  data?: any;

  @IsOptional()
  id?: any;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationOptionsDto)
  paginacion?: PaginationOptionsDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortingOptionsDto)
  sorting?: SortingOptionsDto[];
}
