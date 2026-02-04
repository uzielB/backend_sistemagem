import { PartialType } from '@nestjs/mapped-types';
import { CreateTeacherDto } from './create-teacher.dto';
import { IsOptional, IsBoolean, IsArray, IsEnum, IsString } from 'class-validator';
import { GradoAcademico } from '../entities/teacher.entity';


export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {
  /**
   * Grados académicos del docente (actualización)
   */
  @IsOptional()
  @IsArray({ message: 'Los grados académicos deben ser un array' })
  @IsEnum(GradoAcademico, {
    each: true,
    message: 'Los grados académicos deben ser: LICENCIATURA, MAESTRIA o DOCTORADO',
  })
  gradosAcademicos?: GradoAcademico[];

  /**
   * Área de grado académico (actualización)
   */
  @IsOptional()
  @IsString({ message: 'El área de grado académico debe ser una cadena de texto' })
  areaGradoAcademico?: string;

  /**
   * Actualizar estado de formulario completado
   */
  @IsOptional()
  @IsBoolean({
    message: 'El campo haCompletadoFormulario debe ser un valor booleano (true/false)',
  })
  haCompletadoFormulario?: boolean;

  /**
   * Actualizar estado de documentos subidos
   */
  @IsOptional()
  @IsBoolean({
    message: 'El campo haSubidoDocumentos debe ser un valor booleano (true/false)',
  })
  haSubidoDocumentos?: boolean;

  /**
   * Actualizar estado de datos bancarios proporcionados
   */
  @IsOptional()
  @IsBoolean({
    message: 'El campo haProporcionadoDatosBancarios debe ser un valor booleano (true/false)',
  })
  haProporcionadoDatosBancarios?: boolean;

  /**
   * Actualizar estado activo/inactivo
   */
  @IsOptional()
  @IsBoolean({
    message: 'El campo estaActivo debe ser un valor booleano (true/false)',
  })
  estaActivo?: boolean;
}