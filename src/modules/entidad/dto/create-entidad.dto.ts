import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TipoOperacion } from '../../../common/enums/tipo-operacion.enum';

export class CreateEntidadDto {
  @IsMongoId()
  @IsNotEmpty()
  moduloId: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  nombreTabla: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean = true;

  @IsArray()
  @IsEnum(TipoOperacion, { each: true })
  @IsNotEmpty()
  operaciones: TipoOperacion[];

  @IsString()
  @IsOptional()
  usuarioCreacion?: string;
}
