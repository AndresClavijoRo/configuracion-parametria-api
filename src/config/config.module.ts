import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongodbConfig } from './mongodb.config';
import { validate } from './env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
  ],
  providers: [MongodbConfig],
  exports: [MongodbConfig],
})
export class AppConfigModule {}
