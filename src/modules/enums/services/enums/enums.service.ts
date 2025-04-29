import { Injectable } from '@nestjs/common';
import { TipoConexion } from 'src/common/enums/tipo-conexion.enum';
import { TipoDato } from 'src/common/enums/tipo-dato.enum';
import { TipoOperacion } from 'src/common/enums/tipo-operacion.enum';

@Injectable()
export class EnumsService {
  getEnums() {
    return {
      tipoConexion: Object.values(TipoConexion),
      tipoDato: Object.values(TipoDato),
      tipoOperacion: Object.values(TipoOperacion),
    };
  }

  getEnum(nombreEnum: string) {
    switch (nombreEnum) {
      case 'tipoConexion':
        return Object.values(TipoConexion);
      case 'tipoDato':
        return Object.values(TipoDato);
      case 'tipoOperacion':
        return Object.values(TipoOperacion);
      default:
        throw new Error(
          `Enum ${nombreEnum} no encontrado los disponibles son: tipoConexion, tipoDato, tipoOperacion`,
        );
    }
  }
}
