import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyllabusesService } from './syllabuses.service';
import { AdminSyllabusesController } from './controllers/admin-syllabuses.controller';
import { TeachersSyllabusesController } from './controllers/teachers-syllabuses.controller';
import { Syllabus } from './entities/sallybus.entity';
import { LessonPlan } from './entities/lesson-plan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Syllabus,
      LessonPlan
    ])
  ],
  controllers: [
    AdminSyllabusesController,
    TeachersSyllabusesController
  ],
  providers: [SyllabusesService],
  exports: [SyllabusesService]
})
export class SyllabusesModule {}