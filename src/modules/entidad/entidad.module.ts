import { Module } from '@nestjs/common';
import { ModuloModule } from '../modulo/modulo.module';
import { EntidadController } from './controllers/entidad/entidad.controller';
import { EntidadService } from './services/entidad/entidad.service';

@Module({
  imports: [ModuloModule],
  controllers: [EntidadController],
  providers: [EntidadService],
  exports: [EntidadService],
})
export class EntidadModule {}
