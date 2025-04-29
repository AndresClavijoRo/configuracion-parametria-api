import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TipoDato } from '../../../common/enums/tipo-dato.enum';

export type AtributosTablaDocument = AtributosTabla & Document;

@Schema({
  timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' },
  collection: 'atributosTabla',
})
export class AtributosTabla {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Entidad', required: true })
  entidadId: string;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  nombreColumna: string;

  @Prop({ type: String, enum: Object.values(TipoDato), required: true })
  tipoDato: TipoDato;

  @Prop({ type: [String], default: [] })
  opciones: string[];

  @Prop({ default: false })
  esPrimario: boolean;

  @Prop({ default: false })
  esRequerido: boolean;

  @Prop({ default: false })
  esBuscable: boolean;

  @Prop({ default: true })
  esVisible: boolean;

  @Prop({ default: true })
  esEditable: boolean;

  @Prop()
  secuencia: string;

  @Prop()
  fechaCreacion: Date;

  @Prop()
  usuarioCreacion: string;

  @Prop()
  fechaActualizacion: Date;

  @Prop()
  usuarioActualizacion: string;
}

export const AtributosTablaSchema = SchemaFactory.createForClass(AtributosTabla);
