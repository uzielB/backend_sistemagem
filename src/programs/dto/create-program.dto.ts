import { IsString, IsEnum, IsInt, IsOptional, IsBoolean, IsNotEmpty, Length, Matches, Min, Max } from 'class-validator';
import { Modalidad } from '../entities/program.entity';

/**
 * DTO para crear un nuevo programa académico
 */
export class CreateProgramDto {
  /**
   * Nombre completo del programa
   */
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Length(5, 255, {
    message: 'El nombre debe tener entre 5 y 255 caracteres',
  })
  nombre: string;

  /**
   * Código corto del programa
   * Solo letras mayúsculas
   * @example "LFT"
   */
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El código es obligatorio' })
  @Length(2, 20, {
    message: 'El código debe tener entre 2 y 20 caracteres',
  })
  @Matches(/^[A-Z]+$/, {
    message: 'El código solo debe contener letras mayúsculas sin espacios',
  })
  codigo: string;

  /**
   * Modalidad del programa
   */
  @IsEnum(Modalidad, {
    message: 'La modalidad debe ser ESCOLARIZADO o SABATINO',
  })
  @IsNotEmpty({ message: 'La modalidad es obligatoria' })
  modalidad: Modalidad;

  /**
   * Duración en semestres
   */
  @IsInt({ message: 'La duración debe ser un número entero' })
  @Min(6, { message: 'La duración mínima es de 6 semestres' })
  @Max(12, { message: 'La duración máxima es de 12 semestres' })
  @IsNotEmpty({ message: 'La duración en semestres es obligatoria' })
  duracionSemestres: number;

  /**
   * Indica si está activo
   * Por defecto: true
   */
  @IsOptional()
  @IsBoolean({ message: 'El campo estaActivo debe ser booleano' })
  estaActivo?: boolean;
}