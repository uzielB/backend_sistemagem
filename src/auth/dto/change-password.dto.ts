import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {

  @IsString({ message: 'La contraseña actual debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña actual es obligatoria' })
  contrasenaActual: string;

 
  @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @MinLength(6, {
    message: 'La nueva contraseña debe tener al menos 6 caracteres',
  })
  nuevaContrasena: string;

 
  @IsString({
    message: 'La confirmación de contraseña debe ser una cadena de texto',
  })
  @IsNotEmpty({ message: 'La confirmación de contraseña es obligatoria' })
  confirmarContrasena: string;
}