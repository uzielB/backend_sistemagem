import { IsString, IsNotEmpty, MinLength, Length } from 'class-validator';

/**
 * DTO para inicio de sesión
 * El login se realiza con CURP y contraseña
 */
export class LoginDto {
  /**
   * CURP del usuario
   * Se usa como nombre de usuario
   * Formato: 18 caracteres alfanuméricos en mayúsculas
   * Ejemplo: SUPE800101HDFXXX01
   */
  @IsString({ message: 'El CURP debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El CURP es obligatorio' })
  @Length(18, 18, { message: 'El CURP debe tener exactamente 18 caracteres Validos' })
  curp: string;

  /**
   * Contraseña del usuario en texto plano
   * Será validada contra el hash almacenado
   */
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contrasena: string;
}
