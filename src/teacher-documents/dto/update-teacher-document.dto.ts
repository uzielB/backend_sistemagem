import { PartialType } from '@nestjs/mapped-types';
import { CreateTeacherDocumentDto } from './create-teacher-document.dto';

/**
 * DTO para actualizar documentos de docente
 * Todos los campos son opcionales
 */
export class UpdateTeacherDocumentDto extends PartialType(CreateTeacherDocumentDto) {}