import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TipoDato } from '../../../common/enums/tipo-dato.enum';

export type AtributoTablaDocument = AtributoTabla & Document;

@Schema({ _id: true, id: true })
export class AtributoTabla {
  // Agregar la propiedad _id
  _id?: Types.ObjectId;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  nombreColumna: string;

  @Prop({ type: String, enum: Object.values(TipoDato), required: true })
  tipoDato: TipoDato;

  @Prop({ type: [String], default: null })
  opciones?: string[];

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
  secuencia?: string;

  @Prop()
  fechaCreacion: Date;

  @Prop()
  usuarioCreacion: string;

  @Prop()
  fechaActualizacion?: Date;

  @Prop()
  usuarioActualizacion?: string;

  @Prop({ default: true })
  activo: boolean;
}

export const AtributoTablaSchema = SchemaFactory.createForClass(AtributoTabla);
