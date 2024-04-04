import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  INestApplication,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { initializeTracing } from './config/open-telemetry/tracer';
import { Parameters } from './helpers/parameters';

initializeTracing();

function enableSwagger(
  app: INestApplication<any>,
  globalPrefix: string,
  folderSwagger: string,
) {
  const config = new DocumentBuilder()
    .setTitle(globalPrefix)
    .setDescription(Parameters.appDescription)
    .setVersion(Parameters.appVersion)
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
  });
  SwaggerModule.setup(`${globalPrefix}/${folderSwagger}`, app, document);
}

async function bootstrap() {
  const globalPrefix = Parameters.appPrefix;
  const folderSwagger = Parameters.appSwagger;
  const port = Parameters.port;
  const logger = new Logger();

  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors();

  app.setGlobalPrefix(globalPrefix);

  enableSwagger(app, globalPrefix, folderSwagger);

  await app.listen(port);

  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  logger.log(
    `🚀 Swagger is running on: http://localhost:${port}/${globalPrefix}/${folderSwagger}`,
  );
}
bootstrap();
