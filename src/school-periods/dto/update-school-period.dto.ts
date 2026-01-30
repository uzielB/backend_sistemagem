import { PartialType } from '@nestjs/mapped-types';
import { CreateSchoolPeriodDto } from './create-school-period.dto';

/**
 * DTO para actualizar un periodo escolar
 * Todos los campos son opcionales
 */
export class UpdateSchoolPeriodDto extends PartialType(CreateSchoolPeriodDto) {}