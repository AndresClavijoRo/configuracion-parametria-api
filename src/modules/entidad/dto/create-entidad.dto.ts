import { IsNotEmpty, IsString } from 'class-validator';
import { EntidadBaseDto } from './entidad-base.dto';

export class CreateEntidadDto extends EntidadBaseDto {
  @IsString()
  @IsNotEmpty()
  usuarioCreacion: string;
}
