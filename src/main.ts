import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { GlobalExceptionFilter } from './core/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Express, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'service/pendig/transversales/conf-parametria/api/v',
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('API Configuración parametría')
    .setDescription('API para la configuración de la parametría')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const server = app.getHttpAdapter().getInstance() as Express;

  server.get(
    '/service/pendig/transversales/conf-parametria/api/v1/swagger.json',
    (req: Request, res: Response) => {
      res.json(document);
    },
  );

  server.get('/docs', (req: Request, res: Response) => {
    res.redirect('/service/pendig/transversales/conf-parametria/api/v1/swagger.json');
  });

  SwaggerModule.setup(
    'service/pendig/transversales/conf-parametria/api/v1/swagger-ui/index.html',
    app,
    document,
  );

  app.enableCors();

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3100;
  await app.listen(port);
  console.log(
    `Aplicación iniciada en: http://localhost:${port}/service/pendig/transversales/conf-parametria/api/v1/`,
  );

  console.log(
    `Documentación Swagger disponible en: http://localhost:${port}/service/pendig/transversales/conf-parametria/api/v1/swagger-ui/index.html`,
  );
  console.log(`VERSION: 1.0.0`);
}
bootstrap().catch((err) => console.error('Failed to start application:', err));
