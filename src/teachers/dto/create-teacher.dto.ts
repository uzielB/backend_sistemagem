import { IsInt, IsString, IsOptional, IsBoolean, IsDate, IsNotEmpty, Length, Matches, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { GradoAcademico } from '../entities/teacher.entity';

/**
 * DTO para crear un nuevo docente
 * Versión 3 con campos del formulario de disponibilidad
 */
export class CreateTeacherDto {
  /**
   * ID del usuario asociado
   * Debe ser un usuario con rol DOCENTE que aún no tenga perfil de docente
   */
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  usuarioId: number;

  /**
   * Número de empleado del docente
   * Formato sugerido: EMP001, EMP002, etc.
   * Debe ser único en el sistema
   */
  @IsString({ message: 'El número de empleado debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de empleado es obligatorio' })
  @Length(3, 50, {
    message: 'El número de empleado debe tener entre 3 y 50 caracteres',
  })
  @Matches(/^[A-Z0-9]+$/, {
    message: 'El número de empleado solo debe contener letras mayúsculas y números',
  })
  numeroEmpleado: string;

  /**
   * Departamento al que pertenece el docente
   * Opcional
   */
  @IsOptional()
  @IsString({ message: 'El departamento debe ser una cadena de texto' })
  @Length(1, 100, {
    message: 'El departamento debe tener entre 1 y 100 caracteres',
  })
  departamento?: string;

  /**
   * Especialidad o área de conocimiento del docente
   * Opcional
   */
  @IsOptional()
  @IsString({ message: 'La especialidad debe ser una cadena de texto' })
  @Length(1, 255, {
    message: 'La especialidad debe tener entre 1 y 255 caracteres',
  })
  especialidad?: string;

  
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha de contratación debe ser una fecha válida' })
  fechaContratacion?: Date;

  @IsOptional()
  @IsArray({ message: 'Los grados académicos deben ser un array' })
  @IsEnum(GradoAcademico, {
    each: true,
    message: 'Los grados académicos deben ser: LICENCIATURA, MAESTRIA o DOCTORADO',
  })
  gradosAcademicos?: GradoAcademico[];

  /**
   * Área o campo del grado académico
   * Descripción del área de especialización
   * Opcional
   */
  @IsOptional()
  @IsString({ message: 'El área de grado académico debe ser una cadena de texto' })
  areaGradoAcademico?: string;

  
  @IsOptional()
  @IsBoolean({
    message: 'El campo haCompletadoFormulario debe ser un valor booleano (true/false)',
  })
  haCompletadoFormulario?: boolean;

  /**
   * Indica si el docente ha subido documentos
   * Por defecto: false
   */
  @IsOptional()
  @IsBoolean({
    message: 'El campo haSubidoDocumentos debe ser un valor booleano (true/false)',
  })
  haSubidoDocumentos?: boolean;

  /**
   * Indica si el docente ha proporcionado datos bancarios
   * Por defecto: false
   */
  @IsOptional()
  @IsBoolean({
    message: 'El campo haProporcionadoDatosBancarios debe ser un valor booleano (true/false)',
  })
  haProporcionadoDatosBancarios?: boolean;

  /**
   * Indica si el docente está activo
   * Por defecto: true
   */
  @IsOptional()
  @IsBoolean({
    message: 'El campo estaActivo debe ser un valor booleano (true/false)',
  })
  estaActivo?: boolean;
}
