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
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './core/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (mongodbConfig: MongodbConfig) => ({
        uri: mongodbConfig.uri,
      }),
      inject: [MongodbConfig],
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
      inject: [ConfigService],
    }),
    EnumsModule,
    ModuloModule,
    EntidadModule,
    AtributosTablaModule,
    ConfiguracionModule,
    OrquestadorModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
