import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherDocumentsService } from './teacher-documents.service';
import { TeacherDocumentsController } from './teacher-documents.controller';
import { TeacherDocument } from './entities/teacher-document.entity';
import { TeachersModule } from '../teachers/teachers.module';

/**
 * Módulo de TeacherDocuments (Documentos de Docentes)
 */
@Module({
  imports: [TypeOrmModule.forFeature([TeacherDocument]), TeachersModule],
  controllers: [TeacherDocumentsController],
  providers: [TeacherDocumentsService],
  exports: [TeacherDocumentsService, TypeOrmModule],
})
export class TeacherDocumentsModule {}