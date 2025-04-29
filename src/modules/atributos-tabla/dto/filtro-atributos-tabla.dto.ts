import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class FiltroAtributosTablaDto {
  @IsMongoId()
  @IsOptional()
  entidadId?: string;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  nombreColumna?: string;

  @IsString()
  @IsOptional()
  tipoDato?: string;

  @IsString()
  @IsOptional()
  esPrimario?: string;

  @IsString()
  @IsOptional()
  esRequerido?: string;

  @IsString()
  @IsOptional()
  esBuscable?: string;

  @IsString()
  @IsOptional()
  esVisible?: string;

  @IsString()
  @IsOptional()
  esEditable?: string;
}
