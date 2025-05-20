import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { TipoOperacion } from 'src/common/enums/tipo-operacion.enum';

export class FiltroEntidadDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  nombreTabla?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsOptional()
  @IsEnum(TipoOperacion, { each: true })
  operaciones?: TipoOperacion[];

  @IsOptional()
  @IsMongoId()
  _id?: string;
}
