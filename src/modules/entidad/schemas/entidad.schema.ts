import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TipoOperacion } from '../../../common/enums/tipo-operacion.enum';

export type EntidadDocument = Entidad & Document;

@Schema({
  timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' },
  collection: 'entidades',
})
export class Entidad {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Modulo', required: true })
  moduloId: string;

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
}

export const EntidadSchema = SchemaFactory.createForClass(Entidad);
