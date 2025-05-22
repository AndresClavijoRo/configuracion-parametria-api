import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrquestadorController } from './controllers/orquestador/orquestador.controller';
import { OrquestadorService } from './services/orquestador/orquestador.service';

@Module({
  imports: [HttpModule],
  controllers: [OrquestadorController],
  providers: [OrquestadorService],
})
export class OrquestadorModule {}
