import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TipoOperacion } from '../../../common/enums/tipo-operacion.enum';
import {
  AtributoTabla,
  AtributoTablaSchema,
} from 'src/modules/atributos-tabla/schemas/atributos-tabla.schema';

export type EntidadDocument = Entidad & Document;

@Schema({ _id: true, id: true })
export class Entidad {
  // Agregar la propiedad _id
  _id?: Types.ObjectId;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  nombreTabla: string;

  @Prop()
  descripcion: string;

  @Prop({ default: true })
  activo: boolean;

  @Prop({ type: [String], enum: Object.values(TipoOperacion) })
  operaciones: TipoOperacion[];

  @Prop()
  fechaCreacion: Date;

  @Prop()
  usuarioCreacion: string;

  @Prop()
  fechaActualizacion: Date;

  @Prop()
  usuarioActualizacion: string;

  // Array de atributos tabla embebidos
  @Prop({ type: [AtributoTablaSchema], default: [] })
  atributosTabla: AtributoTabla[] = [];
}

export const EntidadSchema = SchemaFactory.createForClass(Entidad);
