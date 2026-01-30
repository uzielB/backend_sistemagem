import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherAvailabilityService } from './teacher-availability.service';
import { TeacherAvailabilityController } from './teacher-availability.controller';
import { TeacherAvailability } from './entities/teacher-availability.entity';
import { TeachersModule } from '../teachers/teachers.module';
import { SchoolPeriodsModule } from '../school-periods/school-periods.module';
import { ProgramsModule } from '../programs/programs.module';

/**
 * Módulo de TeacherAvailability (Disponibilidad Horaria de Docentes)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([TeacherAvailability]),
    TeachersModule,
    SchoolPeriodsModule,
    ProgramsModule,
  ],
  controllers: [TeacherAvailabilityController],
  providers: [TeacherAvailabilityService],
  exports: [TeacherAvailabilityService, TypeOrmModule],
})
export class TeacherAvailabilityModule {}