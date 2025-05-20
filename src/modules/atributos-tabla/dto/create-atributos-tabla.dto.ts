import { IsNotEmpty, IsString } from 'class-validator';
import { AtributosTablaBaseDto } from './atributo-tabla-base.dto';

export class CreateAtributosTablaDto extends AtributosTablaBaseDto {
  @IsString()
  @IsNotEmpty()
  usuarioCreacion: string;
}
