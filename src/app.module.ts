import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigModule } from './config/config.module';
import { MongodbConfig } from './config/mongodb.config';
import { AtributosTablaModule } from './modules/atributos-tabla/atributos-tabla.module';
import { ConfiguracionModule } from './modules/configuracion/configuracion.module';
import { EntidadModule } from './modules/entidad/entidad.module';
import { EnumsModule } from './modules/enums/enums.module';
import { ModuloModule } from './modules/modulo/modulo.module';
import { OrquestadorModule } from './modules/orquestador/orquestador.module';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (mongodbConfig: MongodbConfig) => ({
        uri: mongodbConfig.uri,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [MongodbConfig],
    }),
    EnumsModule,
    ModuloModule,
    EntidadModule,
    AtributosTablaModule,
    ConfiguracionModule,
    OrquestadorModule,
  ],
})
export class AppModule {}
