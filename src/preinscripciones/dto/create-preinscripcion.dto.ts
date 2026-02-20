import { IsString, IsNotEmpty, IsNumber, IsDateString, IsBoolean, IsOptional, Matches, MinLength, Min, Max } from 'class-validator';

/**
 * DTO para crear una nueva preinscripción
 * Incluye todos los campos del formulario completo
 */
export class CreatePreinscripcionDto {
  // ==========================================
  // INTERÉS ACADÉMICO
  // ==========================================
  @IsString()
  @IsNotEmpty({ message: 'La carrera de interés es obligatoria' })
  carreraInteres: string;

  @IsString()
  @IsNotEmpty({ message: 'La modalidad es obligatoria' })
  modalidad: string;

  // ==========================================
  // DATOS PERSONALES
  // ==========================================
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido paterno es obligatorio' })
  @MinLength(2, { message: 'El apellido paterno debe tener al menos 2 caracteres' })
  apellidoPaterno: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido materno es obligatorio' })
  @MinLength(2, { message: 'El apellido materno debe tener al menos 2 caracteres' })
  apellidoMaterno: string;

  @IsString()
  @IsNotEmpty({ message: 'El CURP es obligatorio' })
  @Matches(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/, {
    message: 'CURP inválido (formato: 18 caracteres)'
  })
  curp: string;

  @IsDateString({}, { message: 'Fecha de nacimiento inválida' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  fechaNacimiento: string;

  @IsString()
  @IsNotEmpty({ message: 'El estado de nacimiento es obligatorio' })
  estadoNacimiento: string;

  @IsString()
  @IsNotEmpty({ message: 'El estado de residencia es obligatorio' })
  estado: string;

  @IsString()
  @IsNotEmpty({ message: 'El domicilio es obligatorio' })
  domicilio: string;

  // ==========================================
  // CONTACTO
  // ==========================================
  @IsString()
  @IsNotEmpty({ message: 'El teléfono celular es obligatorio' })
  @Matches(/^\d{10}$/, {
    message: 'El teléfono debe tener 10 dígitos'
  })
  telefonoCelular: string;

  // ==========================================
  // TUTOR
  // ==========================================
  @IsString()
  @IsNotEmpty({ message: 'El nombre del tutor es obligatorio' })
  nombreTutor: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono del tutor es obligatorio' })
  @Matches(/^\d{10}$/, {
    message: 'El teléfono del tutor debe tener 10 dígitos'
  })
  telefonoTutor: string;

  // ==========================================
  // PROCEDENCIA ACADÉMICA
  // ==========================================
  @IsString()
  @IsNotEmpty({ message: 'La escuela de procedencia es obligatoria' })
  escuelaProcedencia: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección de la escuela es obligatoria' })
  direccionEscuelaProcedencia: string;

  @IsString()
  @IsNotEmpty({ message: 'El estado de la escuela es obligatorio' })
  estadoEscuela: string;

  @IsNumber({}, { message: 'El promedio debe ser un número' })
  @IsNotEmpty({ message: 'El promedio es obligatorio' })
  @Min(6.0, { message: 'El promedio mínimo es 6.0' })
  @Max(10.0, { message: 'El promedio máximo es 10.0' })
  promedio: number;

  // ==========================================
  // INFORMACIÓN LABORAL (OPCIONAL)
  // ==========================================
  @IsBoolean()
  @IsOptional()
  trabajaActualmente?: boolean;

  @IsString()
  @IsOptional()
  nombreEmpresa?: string;

  @IsString()
  @IsOptional()
  domicilioEmpresa?: string;

  // ==========================================
  // OTROS CAMPOS OPCIONALES
  // ==========================================
  @IsString()
  @IsOptional()
  numeroInterior?: string;
}