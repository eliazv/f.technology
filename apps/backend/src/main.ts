/**
 * Application entry point
 * Bootstraps the NestJS application with all configurations
 */

import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: configService.get<string>("FRONTEND_URL", "http://localhost:4200"),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Global prefix for API routes
  app.setGlobalPrefix("api");

  const port = configService.get<number>("PORT", 3000);
  await app.listen(port);

  console.log(`🚀 Backend is running on: http://localhost:${port}/api`);
  console.log(
    `📚 Environment: ${configService.get("NODE_ENV", "development")}`,
  );
}

bootstrap();
