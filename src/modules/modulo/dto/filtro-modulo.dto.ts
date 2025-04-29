import { IsOptional, IsString } from 'class-validator';

export class FiltroModuloDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  tipoConexion?: string;

  @IsString()
  @IsOptional()
  database?: string;

  @IsString()
  @IsOptional()
  apiEndpoint?: string;

  @IsString()
  @IsOptional()
  activo?: string;
}
