import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { Teacher } from './entities/teacher.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    // Registra la entidad Teacher con TypeORM
    TypeOrmModule.forFeature([Teacher]),

    UsersModule,
  ],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [
    TeachersService,
    TypeOrmModule,
  ],
})
export class TeachersModule {}
