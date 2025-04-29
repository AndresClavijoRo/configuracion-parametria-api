import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TipoConexion } from '../../../common/enums/tipo-conexion.enum';

export class CreateModuloDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsEnum(TipoConexion)
  @IsNotEmpty()
  tipoConexion: TipoConexion;

  @IsString()
  @IsNotEmpty()
  database: string;

  @IsString()
  @IsNotEmpty()
  apiEndpoint: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean = true;

  @IsString()
  @IsNotEmpty()
  usuarioCreacion: string;
}
