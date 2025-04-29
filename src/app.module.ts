import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnumsModule } from './modules/enums/enums.module';
import { ModuloModule } from './modules/modulo/modulo.module';
import { EntidadModule } from './modules/entidad/entidad.module';
import { AtributosTablaModule } from './modules/atributos-tabla/atributos-tabla.module';
import { ConfiguracionModule } from './modules/configuracion/configuracion.module';
import { OrquestadorModule } from './modules/orquestador/orquestador.module';

@Module({
  imports: [
    EnumsModule,
    ModuloModule,
    EntidadModule,
    AtributosTablaModule,
    ConfiguracionModule,
    OrquestadorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
