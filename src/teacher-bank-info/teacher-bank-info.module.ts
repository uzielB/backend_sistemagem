import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherBankInfoService } from './teacher-bank-info.service';
import { TeacherBankInfoController } from './teacher-bank-info.controller';
import { TeacherBankInfo } from './entities/teacher-bank-info.entity';
import { TeachersModule } from '../teachers/teachers.module';

/**
 * Módulo de TeacherBankInfo (Datos Bancarios de Docentes)
 */
@Module({
  imports: [TypeOrmModule.forFeature([TeacherBankInfo]), TeachersModule],
  controllers: [TeacherBankInfoController],
  providers: [TeacherBankInfoService],
  exports: [TeacherBankInfoService, TypeOrmModule],
})
export class TeacherBankInfoModule {}
