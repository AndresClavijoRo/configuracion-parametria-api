import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, ValidateNested } from 'class-validator';
import { Modulo } from '../../modulo/schemas/modulo.schema';
import { Entidad } from '../../entidad/schemas/entidad.schema';
import { AtributosTabla } from '../../atributos-tabla/schemas/atributos-tabla.schema';

export class ConfiguracionCompletaDto {
  @IsMongoId()
  @IsNotEmpty()
  entidadId: string;

  @ValidateNested()
  @Type(() => Modulo)
  modulo: Modulo;

  @ValidateNested()
  @Type(() => Entidad)
  entidad: Entidad;

  @ValidateNested({ each: true })
  @Type(() => AtributosTabla)
  atributos: AtributosTabla[];
}
