import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TipoDato } from '../../../common/enums/tipo-dato.enum';

export class AtributosTablaBaseDto {
  @IsString()
  @IsOptional()
  _id?: string; // Añade esta línea

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  nombreColumna: string;

  @IsEnum(TipoDato)
  @IsNotEmpty()
  tipoDato: TipoDato;

  @IsArray()
  @IsOptional()
  opciones?: string[];

  @IsBoolean()
  @IsOptional()
  esPrimario?: boolean = false;

  @IsBoolean()
  @IsOptional()
  esRequerido?: boolean = false;

  @IsBoolean()
  @IsOptional()
  esBuscable?: boolean = false;

  @IsBoolean()
  @IsOptional()
  esVisible?: boolean = true;

  @IsBoolean()
  @IsOptional()
  esEditable?: boolean = true;

  @IsString()
  @IsOptional()
  secuencia?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean = true;
}
