import { PartialType } from '@nestjs/mapped-types';
import { CreateAtributosTablaDto } from './create-atributos-tabla.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAtributosTablaDto extends PartialType(CreateAtributosTablaDto) {
  @IsString()
  @IsOptional()
  usuarioActualizacion?: string;
}
