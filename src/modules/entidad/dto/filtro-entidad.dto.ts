import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class FiltroEntidadDto {
  @IsMongoId()
  @IsOptional()
  moduloId?: string;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  nombreTabla?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  activo?: string;
}
