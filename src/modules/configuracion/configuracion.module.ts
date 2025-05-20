import { Module } from '@nestjs/common';
import { ConfiguracionController } from './controllers/configuracion/configuracion.controller';
import { ConfiguracionService } from './services/configuracion/configuracion.service';
import { ModuloModule } from '../modulo/modulo.module';

@Module({
  imports: [ModuloModule],
  controllers: [ConfiguracionController],
  providers: [ConfiguracionService],
})
export class ConfiguracionModule {}
