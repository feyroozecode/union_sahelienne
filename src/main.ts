import 'dotenv/config';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import validationOptions from './utils/validation-options';
import { AllConfigType } from './config/config.type';
import { ResolvePromisesInterceptor } from './utils/serializer.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService<AllConfigType>);

  // Explicit CORS allowlist (admin panel + mobile origin + local dev).
  // Wildcard is intentionally not used so the API rejects unknown origins
  // once we move past the dev / swagger testing phase.
  const nodeEnv = configService.get('app.nodeEnv', { infer: true });
  const allowedOrigins = [
    configService.get('app.frontendDomain', { infer: true }),
    configService.get('app.adminDomain', { infer: true }),
    'http://localhost:3020',
    'http://localhost:3021',
    'http://localhost:3022',
    'http://localhost:3030', // public web app (dev)
    'http://localhost:3031',
    'http://localhost:3000',
  ]
    // FRONTEND_DOMAIN / ADMIN_DOMAIN may hold a comma-separated list so several
    // public domains (apex + www, web app + admin) can be allowed at once.
    .filter((origin): origin is string => Boolean(origin))
    .flatMap((value) => value.split(',').map((part) => part.trim()))
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow same-origin / curl / mobile native (no Origin header) in dev.
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (nodeEnv === 'development') {
        return callback(null, true);
      }
      // Reject cleanly. Throwing here surfaces as a 500 on the CORS preflight
      // (OPTIONS) instead of a normal CORS block, which browsers report as an
      // opaque "500 Internal Server Error" on every login/signup request.
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Sensitive-Data',
      configService.get('app.headerLanguage', { infer: true }) ??
        'x-custom-lang',
    ],
  });

  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalInterceptors(
    // ResolvePromisesInterceptor is used to resolve promises in responses because class-transformer can't do it
    // https://github.com/typestack/class-transformer/issues/549
    new ResolvePromisesInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .addGlobalParameters({
      in: 'header',
      required: false,
      name: process.env.APP_HEADER_LANGUAGE || 'x-custom-lang',
      schema: {
        example: 'en',
      },
    })
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  await app.listen(configService.getOrThrow('app.port', { infer: true }));
}
void bootstrap();
