import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

/**
 * Función de arranque de la aplicación
 * Sistema Académico GEM
 */
async function bootstrap() {
  // Crear la aplicación NestJS
  const app = await NestFactory.create(AppModule);

  // Obtener el servicio de configuración
  const configService = app.get(ConfigService);

  // Configurar prefijo global para todas las rutas
  // Todas las rutas serán: http://localhost:3000/api/...
  app.setGlobalPrefix('api');

  // Habilitar validación global usando class-validator
  // Esto valida automáticamente todos los DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      // Eliminar propiedades que no estén en el DTO
      whitelist: true,

      // Lanzar error si hay propiedades no permitidas
      forbidNonWhitelisted: true,

      // Transformar los datos al tipo esperado automáticamente
      transform: true,

      // Transformar tipos primitivos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configurar CORS para permitir peticiones desde el frontend Angular
  const corsOrigin = configService.get<string>(
    'CORS_ORIGIN',
    'http://localhost:4200',
  );

  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Obtener puerto de las variables de entorno
  const port = configService.get<number>('PORT', 3000);

  // Iniciar el servidor
  await app.listen(port);

  console.log('');
  console.log('================================================');
  console.log('🎓 SISTEMA ACADÉMICO GEM - BACKEND INICIADO 🎓');
  console.log('================================================');
  console.log(`📡 Servidor corriendo en: http://localhost:${port}`);
  console.log(`🔗 API base: http://localhost:${port}/api`);
  console.log(`🌐 CORS habilitado para: ${corsOrigin}`);
  console.log('================================================');
  console.log('');
  console.log('📋 ENDPOINTS DISPONIBLES:');
  console.log('');
  console.log('🔐 AUTENTICACIÓN:');
  console.log(`   POST   http://localhost:${port}/api/auth/login`);
  console.log(`   GET    http://localhost:${port}/api/auth/profile`);
  console.log(`   PATCH  http://localhost:${port}/api/auth/change-password`);
  console.log(`   POST   http://localhost:${port}/api/auth/verify-token`);
  console.log(`   POST   http://localhost:${port}/api/auth/logout`);
  console.log('');
  console.log('👤 USUARIOS:');
  console.log(`   POST   http://localhost:${port}/api/users`);
  console.log(`   GET    http://localhost:${port}/api/users`);
  console.log(`   GET    http://localhost:${port}/api/users/statistics`);
  console.log(`   GET    http://localhost:${port}/api/users/:id`);
  console.log(`   PATCH  http://localhost:${port}/api/users/:id`);
  console.log(`   DELETE http://localhost:${port}/api/users/:id`);
  console.log('');
  console.log('================================================');
  console.log('');
}

bootstrap();