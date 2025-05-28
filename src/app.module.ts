import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigModule } from './config/config.module';
import { AtributosTablaModule } from './modules/atributos-tabla/atributos-tabla.module';
import { ConfiguracionModule } from './modules/configuracion/configuracion.module';
import { EntidadModule } from './modules/entidad/entidad.module';
import { EnumsModule } from './modules/enums/enums.module';
import { ModuloModule } from './modules/modulo/modulo.module';
import { OrquestadorModule } from './modules/orquestador/orquestador.module';
import { HttpModule } from '@nestjs/axios';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './core/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ConfigService } from './config/config.service';
import { EventHubInterceptor } from './common/interceptors/event-hub.interceptor';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.database.uri,
      }),
      inject: [ConfigService],
    }),
    HttpModule.registerAsync({
      imports: [AppConfigModule],
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
    {
      provide: 'APP_INTERCEPTOR',
      useFactory: () => {
        const connectionString = process.env.EVENT_HUB_CONNECTION_S!;
        const eventHubName = process.env.EVENT_HUB_QUEUE!;
        return new EventHubInterceptor(connectionString, eventHubName);
      },
    },
  ],
})
export class AppModule {}
