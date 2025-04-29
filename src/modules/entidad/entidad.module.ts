import { Module } from '@nestjs/common';
import { EntidadController } from './controllers/entidad/entidad.controller';
import { EntidadService } from './services/entidad/entidad.service';

@Module({
  controllers: [EntidadController],
  providers: [EntidadService],
})
export class EntidadModule {}
