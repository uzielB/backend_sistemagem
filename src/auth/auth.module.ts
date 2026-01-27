import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { getJwtConfig } from '../config/jwt.config';


@Module({
  imports: [
    // Importar módulo de usuarios
    UsersModule,

    // Configurar Passport
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    // Configurar JWT de forma asíncrona usando ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getJwtConfig(configService),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy, // Estrategia para validar tokens JWT
    LocalStrategy, // Estrategia para validar credenciales en login
  ],
  exports: [AuthService, JwtModule], // Exportar para usar en otros módulos
})
export class AuthModule {}
