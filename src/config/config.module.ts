import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validationSchema } from './validation.schema';
import appConfig from './configurations/app.config';
import databaseConfig from './configurations/database.config';
import * as path from 'path';
import { ConfigService } from './config.service';
const env = process.env.ENV || 'local';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      ...(env === 'local' && {
        envFilePath: path.resolve(__dirname, '../../.local.env'),
      }),
      load: [appConfig, databaseConfig],
      validationSchema,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class AppConfigModule {}
