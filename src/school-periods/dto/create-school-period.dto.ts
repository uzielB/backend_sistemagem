import { IsString, IsBoolean, IsOptional, IsNotEmpty, IsDate, Length, Matches } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para crear un nuevo periodo escolar
 */
export class CreateSchoolPeriodDto {
  /**
   * Nombre del periodo
   */
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Length(5, 100, {
    message: 'El nombre debe tener entre 5 y 100 caracteres',
  })
  nombre: string;

  /**
   * Código del periodo
   * Formato sugerido: YYYY-N (año-número)
   * @example "2025-1"
   */
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El código es obligatorio' })
  @Length(4, 20, {
    message: 'El código debe tener entre 4 y 20 caracteres',
  })
  @Matches(/^[0-9]{4}-[0-9]$/, {
    message: 'El código debe tener formato YYYY-N (ej: 2025-1)',
  })
  codigo: string;

  /**
   * Fecha de inicio del periodo
   * Formato: YYYY-MM-DD
   */
  @Type(() => Date)
  @IsDate({ message: 'La fecha de inicio debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  fechaInicio: Date;

  /**
   * Fecha de fin del periodo
   * Formato: YYYY-MM-DD
   */
  @Type(() => Date)
  @IsDate({ message: 'La fecha de fin debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de fin es obligatoria' })
  fechaFin: Date;

  /**
   * Indica si es el periodo actual
   * Por defecto: false
   */
  @IsOptional()
  @IsBoolean({ message: 'El campo esActual debe ser booleano' })
  esActual?: boolean;

  /**
   * Indica si está activo
   * Por defecto: true
   */
  @IsOptional()
  @IsBoolean({ message: 'El campo estaActivo debe ser booleano' })
  estaActivo?: boolean;
}