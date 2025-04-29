import { Module } from '@nestjs/common';
import { AtributosTablaController } from './controllers/atributos-tabla/atributos-tabla.controller';
import { AtributosTablaService } from './services/atributos-tabla/atributos-tabla.service';

@Module({
  controllers: [AtributosTablaController],
  providers: [AtributosTablaService],
})
export class AtributosTablaModule {}
