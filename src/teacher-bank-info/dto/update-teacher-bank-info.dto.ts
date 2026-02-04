import { PartialType } from '@nestjs/mapped-types';
import { CreateTeacherBankInfoDto } from './create-teacher-bank-info.dto';

/**
 * DTO para actualizar datos bancarios de un docente
 * Todos los campos son opcionales
 */
export class UpdateTeacherBankInfoDto extends PartialType(CreateTeacherBankInfoDto) {}