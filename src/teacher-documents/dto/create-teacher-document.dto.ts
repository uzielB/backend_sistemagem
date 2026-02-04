import { IsInt, IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { EstatusDocumentos } from '../entities/teacher-document.entity';

/**
 * DTO para crear un registro de documentos de docente
 */
export class CreateTeacherDocumentDto {
  /**
   * ID del docente
   */
  @IsInt({ message: 'El ID del docente debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del docente es obligatorio' })
  docenteId: number;

  /**
   * Ruta del archivo CURP
   */
  @IsOptional()
  @IsString({ message: 'La ruta del CURP debe ser una cadena de texto' })
  curpPdf?: string;

  /**
   * Ruta del acta de nacimiento
   */
  @IsOptional()
  @IsString({ message: 'La ruta del acta debe ser una cadena de texto' })
  actaNacimientoPdf?: string;

  /**
   * Ruta del INE
   */
  @IsOptional()
  @IsString({ message: 'La ruta del INE debe ser una cadena de texto' })
  inePdf?: string;

  /**
   * Ruta del título
   */
  @IsOptional()
  @IsString({ message: 'La ruta del título debe ser una cadena de texto' })
  tituloPdf?: string;

  /**
   * Ruta de la cédula
   */
  @IsOptional()
  @IsString({ message: 'La ruta de la cédula debe ser una cadena de texto' })
  cedulaProfesionalPdf?: string;

  /**
   * Ruta del CV
   */
  @IsOptional()
  @IsString({ message: 'La ruta del CV debe ser una cadena de texto' })
  cvPdf?: string;

  /**
   * Estatus de los documentos
   */
  @IsOptional()
  @IsEnum(EstatusDocumentos, {
    message: 'El estatus debe ser PENDIENTE, APROBADO o RECHAZADO',
  })
  estatus?: EstatusDocumentos;

  /**
   * Comentarios del revisor
   */
  @IsOptional()
  @IsString({ message: 'Los comentarios deben ser una cadena de texto' })
  comentarios?: string;
}