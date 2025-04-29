import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TipoConexion } from '../../../common/enums/tipo-conexion.enum';

export type ModuloDocument = Modulo & Document;

@Schema({
  timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' },
  collection: 'modulos',
})
export class Modulo {
  @Prop({ required: true })
  nombre: string;

  @Prop()
  descripcion: string;

  @Prop({ type: String, enum: Object.values(TipoConexion), required: true })
  tipoConexion: TipoConexion;

  @Prop({ required: true })
  database: string;

  @Prop({ required: true })
  apiEndpoint: string;

  @Prop({ default: true })
  activo: boolean;

  @Prop()
  fechaCreacion: Date;

  @Prop()
  usuarioCreacion: string;

  @Prop()
  fechaActualizacion: Date;

  @Prop()
  usuarioActualizacion: string;
}

export const ModuloSchema = SchemaFactory.createForClass(Modulo);
