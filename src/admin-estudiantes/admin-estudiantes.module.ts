import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEstudiantesController } from './admin-estudiantes.controller';
import { AdminEstudiantesService } from './admin-estudiantes.service';
import { Student } from '../teachers/entities/student.entity';
import { FinanzasModule } from '../finanzas/finanzas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    FinanzasModule
  ],
  controllers: [AdminEstudiantesController],
  providers: [AdminEstudiantesService],
  exports: [AdminEstudiantesService]
})
export class AdminEstudiantesModule {}