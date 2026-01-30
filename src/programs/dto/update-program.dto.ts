import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramDto } from './create-program.dto';

/**
 * DTO para actualizar un programa académico
 * Todos los campos son opcionales
 */
export class UpdateProgramDto extends PartialType(CreateProgramDto) {}
