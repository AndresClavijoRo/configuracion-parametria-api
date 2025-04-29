import { Module } from '@nestjs/common';
import { ConfiguracionController } from './controllers/configuracion/configuracion.controller';
import { ConfiguracionService } from './services/configuracion/configuracion.service';

@Module({
  controllers: [ConfiguracionController],
  providers: [ConfiguracionService],
})
export class ConfiguracionModule {}
