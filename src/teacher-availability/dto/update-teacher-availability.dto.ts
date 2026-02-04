import { PartialType } from '@nestjs/mapped-types';
import { CreateTeacherAvailabilityDto } from './create-teacher-availability.dto';
import { IsEnum, IsOptional, IsString, IsInt } from 'class-validator';
import { EstatusDisponibilidad } from '../entities/teacher-availability.entity';

/**
 * DTO para actualizar una disponibilidad horaria
 * Todos los campos son opcionales
 */
export class UpdateTeacherAvailabilityDto extends PartialType(
  CreateTeacherAvailabilityDto,
) {
  /**
   * Actualizar estatus
   */
  @IsOptional()
  @IsEnum(EstatusDisponibilidad, {
    message: 'El estatus debe ser PENDIENTE, REVISADO o APROBADO',
  })
  estatus?: EstatusDisponibilidad;

  /**
   * Comentarios del administrador
   */
  @IsOptional()
  @IsString({ message: 'Los comentarios deben ser una cadena de texto' })
  comentariosAdmin?: string;

  /**
   * ID del usuario que revisó
   */
  @IsOptional()
  @IsInt({ message: 'El ID del revisor debe ser un número entero' })
  revisadoPor?: number;
}