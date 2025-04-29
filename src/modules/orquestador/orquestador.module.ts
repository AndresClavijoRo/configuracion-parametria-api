import { Module } from '@nestjs/common';
import { OrquestadorController } from './controllers/orquestador/orquestador.controller';
import { OrquestadorService } from './services/orquestador/orquestador.service';

@Module({
  controllers: [OrquestadorController],
  providers: [OrquestadorService],
})
export class OrquestadorModule {}
