import { Module } from '@nestjs/common';
import { ModuloController } from './controllers/modulo/modulo.controller';
import { ModuloService } from './services/modulo/modulo.service';

@Module({
  controllers: [ModuloController],
  providers: [ModuloService],
})
export class ModuloModule {}
