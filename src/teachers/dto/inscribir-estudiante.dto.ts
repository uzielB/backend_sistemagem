import { 
  IsString, 
  IsEmail, 
  IsNotEmpty, 
  Length, 
  Matches, 
  IsInt,
  IsOptional,
  IsDate,
  IsBoolean,
  ValidateNested,
  IsEnum,
  Min,
  Max,
  IsNumber
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConfiguracionFinancieraDto } from '../../finanzas/dto/configuracion-financiera.dto';

/**
 * DTO para inscribir un nuevo estudiante
 * Incluye: datos personales, académicos y configuración financiera
 */
export class InscribirEstudianteDto {
  
  // ==========================================
  // DATOS PERSONALES
  // ==========================================
  
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres' })
  nombre: string;

  @IsString({ message: 'El apellido paterno debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido paterno es obligatorio' })
  @Length(1, 100, { message: 'El apellido paterno debe tener entre 1 y 100 caracteres' })
  apellidoPaterno: string;

  @IsOptional()
  @IsString({ message: 'El apellido materno debe ser una cadena de texto' })
  @Length(1, 100, { message: 'El apellido materno debe tener entre 1 y 100 caracteres' })
  apellidoMaterno?: string;

  @IsString({ message: 'El CURP debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El CURP es obligatorio' })
  @Length(18, 18, { message: 'El CURP debe tener exactamente 18 caracteres' })
  @Matches(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/, {
    message: 'El CURP no tiene un formato válido',
  })
  curp: string;

  @IsString({ message: 'La fecha de nacimiento debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe estar en formato YYYY-MM-DD' })
  fechaNacimiento: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  correo?: string;

  @IsOptional()
  @IsString()
  @Length(10, 20)
  telefonoCelular?: string;

  // ==========================================
  // DATOS ACADÉMICOS
  // ==========================================
  
  @IsInt({ message: 'El programa ID debe ser un entero' })
  @IsNotEmpty({ message: 'El programa es obligatorio' })
  programaId: number;

  @IsString({ message: 'La modalidad debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La modalidad es obligatoria' })
  @IsEnum(['ESCOLARIZADO', 'SABATINO'], { 
    message: 'La modalidad debe ser ESCOLARIZADO o SABATINO' 
  })
  modalidad: string;

  @IsInt({ message: 'El semestre actual debe ser un entero' })
  @IsNotEmpty({ message: 'El semestre actual es obligatorio' })
  @Min(1, { message: 'El semestre mínimo es 1' })
  @Max(10, { message: 'El semestre máximo es 10' })
  semestreActual: number;

  @IsInt({ message: 'El periodo escolar debe ser un entero' })
  @IsNotEmpty({ message: 'El periodo escolar es obligatorio' })
  periodoEscolarId: number;

  @IsOptional()
  @IsInt()
  grupoId?: number;

  // ==========================================
  // CONFIGURACIÓN FINANCIERA (ANIDADA)
  // ==========================================
  
  @ValidateNested({ message: 'La configuración financiera no es válida' })
  @Type(() => ConfiguracionFinancieraDto)
  @IsNotEmpty({ message: 'La configuración financiera es obligatoria' })
  configuracionFinanciera: ConfiguracionFinancieraDto;

  // ==========================================
  // DATOS OPCIONALES
  // ==========================================

  @IsOptional()
  @IsString()
  escuelaProcedencia?: string;

  @IsOptional()
  @IsNumber()
  @Min(6)
  @Max(10)
  promedioBachillerato?: number;

  @IsOptional()
  @IsString()
  nombreTutor?: string;

  @IsOptional()
  @IsString()
  telefonoTutor?: string;
}