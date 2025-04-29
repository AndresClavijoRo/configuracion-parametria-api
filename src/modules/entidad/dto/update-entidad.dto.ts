import { PartialType } from '@nestjs/mapped-types';
import { CreateEntidadDto } from './create-entidad.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateEntidadDto extends PartialType(CreateEntidadDto) {
  @IsString()
  @IsOptional()
  usuarioActualizacion?: string;
}
