import { Module } from '@nestjs/common';
import { AtributosTablaController } from './controllers/atributos-tabla/atributos-tabla.controller';
import { AtributosTablaService } from './services/atributos-tabla/atributos-tabla.service';
import { ModuloModule } from '../modulo/modulo.module';

@Module({
  imports: [ModuloModule],
  controllers: [AtributosTablaController],
  providers: [AtributosTablaService],
  exports: [AtributosTablaService],
})
export class AtributosTablaModule {}
