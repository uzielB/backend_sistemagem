import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminProgramsController } from './admin-programs.controller';
import { AdminProgramsService } from './admin-programs.service';
import { AdminTemariosController } from './admin-temarios.controller';
import { AdminTemariosService } from './admin-temarios.service';
import { AdminTemariosBaseController } from './admin-temarios-base.controller';
import { AdminTemariosBaseService } from './admin-temarios-base.service';
import { AdminMateriasMasivasController } from './admin-materias-masivas.controller';
import { AdminMateriasMasivasService } from './admin-materias-masivas.service';

// Entidades necesarias
import { Program } from '../programs/entities/program.entity';
import { Subject } from '../teachers/entities/subject.entity';
import { Syllabus } from '../syllabuses/entities/sallybus.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { User } from '../users/entities/user.entity';
import { TeacherAssignment } from '../teachers/entities/teacher-assignment.entity';
import { SchoolPeriod } from '../school-periods/entities/school-period.entity';
import { ArchivoTemarioBase } from './entities/archivo-temario-base.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Program,
      Subject,
      Syllabus,
      Teacher,
      User,
      TeacherAssignment,
      SchoolPeriod,
      ArchivoTemarioBase,
    ]),
  ],
  controllers: [
    AdminProgramsController,
    AdminTemariosController,
    AdminTemariosBaseController,
    AdminMateriasMasivasController, // ✅ NUEVO
  ],
  providers: [
    AdminProgramsService,
    AdminTemariosService,
    AdminTemariosBaseService,
    AdminMateriasMasivasService, // ✅ NUEVO
  ],
  exports: [
    AdminProgramsService,
    AdminTemariosService,
    AdminTemariosBaseService,
    AdminMateriasMasivasService, // ✅ NUEVO
  ],
})
export class AdminProgramsModule {}