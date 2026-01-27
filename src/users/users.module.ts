import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

/**
 * Módulo de Usuarios
 * Agrupa toda la funcionalidad relacionada con la gestión de usuarios
 * 
 * Exporta:
 * - UsersService: Para ser usado por otros módulos (especialmente Auth)
 * - TypeOrmModule: Para que otras entidades puedan referenciar User
 */
@Module({
  imports: [
    // Registra la entidad User con TypeORM
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [
    UsersService, // Exporta el servicio para ser usado en otros módulos
    TypeOrmModule, // Exporta para que otros módulos puedan usar el repositorio
  ],
})
export class UsersModule {}
