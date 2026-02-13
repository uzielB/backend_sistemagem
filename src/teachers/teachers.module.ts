import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { Teacher } from './entities/teacher.entity';
import { TeacherAssignment } from './entities/teacher-assignment.entity';
import { Grade } from './entities/grade.entity';
import { Attendance } from './entities/attendance.entity';
import { Student } from './entities/student.entity';
import { Subject } from './entities/subject.entity';
import { Group } from './entities/group.entity';
import { Program } from '../programs/entities/program.entity';
import { SchoolPeriod } from '../school-periods/entities/school-period.entity';
import { ScheduleModule as ScheduleModuleEntity } from '../schedule-modules/entities/schedule-module.entity';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    // Registrar TODAS las entidades necesarias
    TypeOrmModule.forFeature([
      // Entidades propias del módulo Teachers
      Teacher,
      TeacherAssignment,
      Grade,
      Attendance,
      Student,
      Subject,
      Group,
      
      // Entidades de otros módulos (importadas)
      Program,
      SchoolPeriod,
      ScheduleModuleEntity,
    ]),

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