import { IsEnum, IsInt, IsString, IsOptional, IsBoolean, IsNotEmpty, Matches, Min, Max } from 'class-validator';
import { Sistema } from '../entities/schedule-module.entity';

/**
 * DTO para crear un nuevo módulo horario
 */
export class CreateScheduleModuleDto {
  /**
   * Sistema al que pertenece el módulo
   * ESCOLARIZADO o SABATINO
   */
  @IsEnum(Sistema, {
    message: 'El sistema debe ser ESCOLARIZADO o SABATINO',
  })
  @IsNotEmpty({ message: 'El sistema es obligatorio' })
  sistema: Sistema;

  /**
   * Número del módulo
   * ESCOLARIZADO: 1-4
   * SABATINO: 1-3
   */
  @IsInt({ message: 'El número de módulo debe ser un entero' })
  @Min(1, { message: 'El número de módulo debe ser al menos 1' })
  @Max(4, { message: 'El número de módulo no puede ser mayor a 4' })
  @IsNotEmpty({ message: 'El número de módulo es obligatorio' })
  numeroModulo: number;

  /**
   * Hora de inicio
   * Formato: HH:MM (24 horas)
   */
  @IsString({ message: 'La hora de inicio debe ser una cadena de texto' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora de inicio debe tener formato HH:MM (00:00 - 23:59)',
  })
  @IsNotEmpty({ message: 'La hora de inicio es obligatoria' })
  horaInicio: string;

  /**
   * Hora de fin
   * Formato: HH:MM (24 horas)
   */
  @IsString({ message: 'La hora de fin debe ser una cadena de texto' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora de fin debe tener formato HH:MM (00:00 - 23:59)',
  })
  @IsNotEmpty({ message: 'La hora de fin es obligatoria' })
  horaFin: string;

  /**
   * Días de la semana
   * Opcional
   */
  @IsOptional()
  @IsString({ message: 'Los días de la semana deben ser una cadena de texto' })
  diasSemana?: string;

  /**
   * Descripción del módulo
   * Opcional
   */
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;

  /**
   * Indica si está activo
   * Por defecto: true
   */
  @IsOptional()
  @IsBoolean({ message: 'El campo estaActivo debe ser booleano' })
  estaActivo?: boolean;
}