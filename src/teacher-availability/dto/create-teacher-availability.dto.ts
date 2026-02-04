import { IsInt, IsArray, IsBoolean, IsOptional, IsNotEmpty, ArrayMinSize, ArrayMaxSize, Min, Max, IsEnum, IsString } from 'class-validator';
import { EstatusDisponibilidad } from '../entities/teacher-availability.entity';

/**
 * DTO para crear una nueva disponibilidad horaria
 */
export class CreateTeacherAvailabilityDto {
  /**
   * ID del docente
   */
  @IsInt({ message: 'El ID del docente debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del docente es obligatorio' })
  docenteId: number;

  /**
   * ID del periodo escolar
   */
  @IsInt({ message: 'El ID del periodo escolar debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del periodo escolar es obligatorio' })
  periodoEscolarId: number;

  /**
   * IDs de programas donde puede impartir
   * Array de números enteros (IDs de la tabla programas)
   */
  @IsArray({ message: 'Los programas deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos un programa' })
  @IsInt({ each: true, message: 'Cada programa debe ser un ID válido' })
  @IsNotEmpty({ message: 'Los programas son obligatorios' })
  programasImparte: number[];

  /**
   * Sistemas disponibles
   * Array de strings: "ESCOLARIZADO" y/o "SABATINO"
   */
  @IsArray({ message: 'Los sistemas disponibles deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos un sistema' })
  @IsString({ each: true, message: 'Cada sistema debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'Los sistemas disponibles son obligatorios' })
  sistemasDisponibles: string[];

  /**
   * Módulos disponibles en ESCOLARIZADO
   * Array de números (1, 2, 3, 4)
   */
  @IsOptional()
  @IsArray({ message: 'Los módulos escolarizados deben ser un array' })
  @IsInt({ each: true, message: 'Cada módulo debe ser un número' })
  modulosEscolarizado?: number[];

  /**
   * Módulos disponibles en SABATINO
   * Array de números (1, 2, 3)
   */
  @IsOptional()
  @IsArray({ message: 'Los módulos sabatinos deben ser un array' })
  @IsInt({ each: true, message: 'Cada módulo debe ser un número' })
  modulosSabatino?: number[];

  /**
   * Módulos máximos por semana
   */
  @IsInt({ message: 'Los módulos máximos deben ser un número entero' })
  @Min(1, { message: 'Debe impartir al menos 1 módulo por semana' })
  @Max(4, { message: 'No puede impartir más de 4 módulos por semana' })
  @IsNotEmpty({ message: 'Los módulos máximos por semana son obligatorios' })
  modulosMaximosSemana: number;

  /**
   * Disponibilidad para próximo periodo
   */
  @IsBoolean({
    message: 'La disponibilidad para próximo periodo debe ser booleana',
  })
  @IsNotEmpty({
    message: 'La disponibilidad para próximo periodo es obligatoria',
  })
  disponibilidadProximoPeriodo: boolean;

  /**
   * Estatus (opcional, por defecto PENDIENTE)
   */
  @IsOptional()
  @IsEnum(EstatusDisponibilidad, {
    message: 'El estatus debe ser PENDIENTE, REVISADO o APROBADO',
  })
  estatus?: EstatusDisponibilidad;

  /**
   * Comentarios del admin (opcional)
   */
  @IsOptional()
  @IsString({ message: 'Los comentarios deben ser una cadena de texto' })
  comentariosAdmin?: string;
}