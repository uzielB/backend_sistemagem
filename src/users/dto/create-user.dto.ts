import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, Length, Matches, IsNotEmpty, MinLength, } from 'class-validator';
import { UserRole } from '../../common/enums/role.enum';

/**
 * DTO para crear un nuevo usuario
 * Contiene todas las validaciones necesarias para garantizar datos consistentes
 */
export class CreateUserDto {
  /**
   * CURP del usuario (Clave Única de Registro de Población)
   * Formato: 18 caracteres alfanuméricos en mayúsculas
   * Ejemplo: SUPE800101HDFXXX01
   */
  @IsString({ message: 'El CURP debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El CURP es obligatorio' })
  @Length(18, 18, { message: 'El CURP debe tener exactamente 18 caracteres' })
  @Matches(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/, {
    message: 'El CURP no tiene un formato válido',
  })
  curp: string;

  /**
   * Contraseña del usuario
   * Mínimo 6 caracteres
   * Se hasheará automáticamente antes de guardar
   */
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contrasena: string;

  /**
   * Correo electrónico del usuario
   * Opcional - se usa para recuperación de contraseña y notificaciones
   */
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  correo?: string;

  /**
   * Rol del usuario en el sistema
   * Valores permitidos: SUPER_ADMIN, ADMIN, DOCENTE, ALUMNO
   */
  @IsEnum(UserRole, {
    message: 'El rol debe ser uno de: SUPER_ADMIN, ADMIN, DOCENTE, ALUMNO',
  })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  rol: UserRole;

  /**
   * Nombre(s) del usuario
   * Longitud máxima: 100 caracteres
   */
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres' })
  nombre: string;

  /**
   * Apellido paterno del usuario
   * Longitud máxima: 100 caracteres
   */
  @IsString({ message: 'El apellido paterno debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido paterno es obligatorio' })
  @Length(1, 100, {
    message: 'El apellido paterno debe tener entre 1 y 100 caracteres',
  })
  apellidoPaterno: string;

  /**
   * Apellido materno del usuario
   * Opcional
   * Longitud máxima: 100 caracteres
   */
  @IsOptional()
  @IsString({ message: 'El apellido materno debe ser una cadena de texto' })
  @Length(1, 100, {
    message: 'El apellido materno debe tener entre 1 y 100 caracteres',
  })
  apellidoMaterno?: string;

  /**
   * Teléfono de contacto del usuario
   * Opcional
   * Formato: 10 dígitos o formato con guiones/espacios
   */
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @Length(10, 20, { message: 'El teléfono debe tener entre 10 y 20 caracteres' })
  @Matches(/^[\d\s\-\+\(\)]+$/, {
    message: 'El teléfono solo debe contener números, espacios, guiones, paréntesis o signo +',
  })
  telefono?: string;

  /**
   * Indica si el usuario está activo
   * Por defecto: true
   */
  @IsOptional()
  @IsBoolean({ message: 'estaActivo debe ser un valor booleano (true/false)' })
  estaActivo?: boolean;

  /**
   * Indica si el usuario debe cambiar su contraseña en el próximo login
   * Por defecto: true (fuerza cambio de contraseña inicial)
   */
  @IsOptional()
  @IsBoolean({
    message: 'debeCambiarContrasena debe ser un valor booleano (true/false)',
  })
  debeCambiarContrasena?: boolean;
}