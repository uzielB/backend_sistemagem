import { PartialType } from '@nestjs/mapped-types';
import { CreateScheduleModuleDto } from './create-schedule-module.dto';

/**
 * DTO para actualizar un módulo horario
 * Todos los campos son opcionales
 */
export class UpdateScheduleModuleDto extends PartialType(CreateScheduleModuleDto) {}
