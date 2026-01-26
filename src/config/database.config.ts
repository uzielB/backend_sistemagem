import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Configuración de TypeORM para PostgreSQL
 * Sistema Académico GEM
 * 
 * Usa variables de entorno del archivo .env
 * 
 * IMPORTANTE:
 * - synchronize: true SOLO en desarrollo
 * - En producción usar migraciones (synchronize: false)
 */
export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'postgres'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE', 'sistema_academico'),

  // Carga automática de entidades
  // Busca todos los archivos *.entity.ts automáticamente
  autoLoadEntities: true,

  // Sincronización automática del esquema
  // ⚠️ SOLO para desarrollo - deshabilitar en producción
  // Crea/actualiza tablas automáticamente según las entidades
  synchronize: configService.get<string>('NODE_ENV') === 'development',

  // Logging de queries SQL (útil para debugging)
  // Muestra las queries en la consola
  logging: configService.get<string>('NODE_ENV') === 'development',

  // Configuración del pool de conexiones
  extra: {
    max: 20, // Máximo de conexiones simultáneas
    connectionTimeoutMillis: 30000, // Timeout de conexión: 30 segundos
  },

  // Opciones de migraciones (para producción)
  migrations: ['dist/database/migrations/*.js'],
  migrationsTableName: 'migrations_history',
});
