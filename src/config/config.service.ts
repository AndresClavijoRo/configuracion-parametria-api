/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { AppConfig } from './configurations/app.config';
import { DatabaseConfig } from './configurations/database.config';

@Injectable()
export class ConfigService {
  constructor(private readonly nestConfigService: NestConfigService) {}

  get app(): AppConfig {
    return this.nestConfigService.get<AppConfig>('app')!;
  }

  get database(): DatabaseConfig {
    return this.nestConfigService.get<DatabaseConfig>('database')!;
  }
}
