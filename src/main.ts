import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // * Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // * Global Middlewares
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    // TODO: Replace this is validation using Zod/Joi schema
    origin:
      process.env.NODE_ENV === 'production'
        ? [process.env.FRONT_END_URL]
        : ['http://localhost:3000'],
    credentials: true,
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const PORT = process.env.PORT || 8000;
  await app.listen(process.env.PORT ?? 8000);
  console.log(`🚀 TaskMaster API is running on: http://localhost:${PORT}`);
}
bootstrap();
