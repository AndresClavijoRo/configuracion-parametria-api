import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Modulo, ModuloDocument } from 'src/modules/modulo/schemas/modulo.schema';

@Injectable()
export class ConfiguracionService {
  constructor(@InjectModel(Modulo.name) private moduloModel: Model<ModuloDocument>) {}

  async getConfiguracion(idEntidad: string) {
    const modulo = await this.moduloModel.findOne({
      'entidades._id': new Types.ObjectId(idEntidad),
      activo: true,
    });

    if (!modulo) {
      return { response: null, mensaje: 'Modulo no encontrado' };
    }

    modulo.entidades = modulo.entidades.filter(
      (entidad) => entidad._id && entidad._id.toString() === idEntidad.toString(),
    );

    return modulo.toObject();
  }

  getConfiguracionPorModulo(idModulo: string) {
    return this.moduloModel
      .findOne({ _id: new Types.ObjectId(idModulo), activo: true })
      .populate('entidades.atributos');
  }
}
