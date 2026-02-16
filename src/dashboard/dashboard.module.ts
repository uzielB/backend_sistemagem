import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

// Entidades necesarias
import { User } from '../users/entities/user.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Student } from '../teachers/entities/student.entity';
import { Program } from '../programs/entities/program.entity';
import { Subject } from '../teachers/entities/subject.entity';
import { Group } from '../teachers/entities/group.entity';
import { SchoolPeriod } from '../school-periods/entities/school-period.entity';
import { TeacherAssignment } from '../teachers/entities/teacher-assignment.entity';
import { TeacherDocument } from '../teacher-documents/entities/teacher-document.entity';
import { TeacherAvailability } from '../teacher-availability/entities/teacher-availability.entity';
import { LessonPlan  } from '../syllabuses/entities/lesson-plan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Teacher,
      Student,
      Program,
      Subject,
      Group,
      SchoolPeriod,
      TeacherAssignment,
      TeacherDocument,
      TeacherAvailability,
      LessonPlan,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}