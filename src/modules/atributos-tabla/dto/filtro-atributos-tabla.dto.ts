import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';

export class FiltroAtributosTablaDto {
  @IsMongoId()
  @IsOptional()
  _id?: string;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  nombreColumna?: string;

  @IsString()
  @IsOptional()
  tipoDato?: string;

  @IsBoolean()
  @IsOptional()
  esPrimario?: boolean;

  @IsBoolean()
  @IsOptional()
  esRequerido?: boolean;

  @IsBoolean()
  @IsOptional()
  esBuscable?: boolean;

  @IsBoolean()
  @IsOptional()
  esVisible?: boolean;

  @IsBoolean()
  @IsOptional()
  esEditable?: boolean;

  @IsString()
  @IsOptional()
  secuencia?: string;

  @IsOptional()
  @IsString({ each: true })
  opciones?: string[];
}
