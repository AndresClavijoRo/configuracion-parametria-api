import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TipoOperacion } from 'src/common/enums/tipo-operacion.enum';

export class EntidadBaseDto {
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
}
