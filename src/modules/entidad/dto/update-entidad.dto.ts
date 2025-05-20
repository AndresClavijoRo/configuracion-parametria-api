import { IsNotEmpty, IsString } from 'class-validator';
import { EntidadBaseDto } from './entidad-base.dto';

export class UpdateEntidadDto extends EntidadBaseDto {
  @IsString()
  @IsNotEmpty()
  usuarioActualizacion: string;
}
