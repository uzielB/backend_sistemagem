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
  password: configService.get<string>('DB_PASSWORD', 'Postgres2025!'),
  database: configService.get<string>('DB_DATABASE', 'sistema_academico'),

  // ✅ CAMBIO: Usar entities en lugar de autoLoadEntities
  // autoLoadEntities no funciona con forRootAsync
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],

  // Sincronización automática del esquema
  // ✅ SIMPLIFICADO: Para desarrollo siempre true
  synchronize: true,

  // Logging de queries SQL
  logging: true,

  // Configuración del pool de conexiones
  extra: {
    max: 20,
    connectionTimeoutMillis: 30000,
  },

  // Opciones de migraciones (para producción)
  migrations: ['dist/database/migrations/*.js'],
  migrationsTableName: 'migrations_history',
});