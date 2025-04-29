import { PartialType } from '@nestjs/mapped-types';
import { CreateModuloDto } from './create-modulo.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateModuloDto extends PartialType(CreateModuloDto) {
  @IsString()
  @IsNotEmpty()
  usuarioActualizacion: string;
}
