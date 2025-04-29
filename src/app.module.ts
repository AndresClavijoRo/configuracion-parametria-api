import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validate } from './config/env.validation';
import { AtributosTablaModule } from './modules/atributos-tabla/atributos-tabla.module';
import { ConfiguracionModule } from './modules/configuracion/configuracion.module';
import { EntidadModule } from './modules/entidad/entidad.module';
import { EnumsModule } from './modules/enums/enums.module';
import { ModuloModule } from './modules/modulo/modulo.module';
import { OrquestadorModule } from './modules/orquestador/orquestador.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
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
  controllers: [],
  providers: [],
})
export class AppModule {}
