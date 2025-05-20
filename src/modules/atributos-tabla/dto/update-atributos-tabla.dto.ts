import { IsOptional, IsString } from 'class-validator';
import { AtributosTablaBaseDto } from './atributo-tabla-base.dto';

export class UpdateAtributosTablaDto extends AtributosTablaBaseDto {
  @IsString()
  @IsOptional()
  usuarioActualizacion?: string;
}
