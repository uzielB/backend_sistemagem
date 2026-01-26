import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsBoolean } from 'class-validator';

/**
 * DTO para actualizar un usuario existente
 * 
 * Hereda de CreateUserDto pero todos los campos son opcionales
 * Se omite el campo 'curp' porque no se puede modificar una vez creado
 * Se omite 'contrasena' porque se actualiza por endpoint separado
 * 
 * IMPORTANTE: La contraseña NO se actualiza mediante este DTO
 * Para cambiar contraseña usar el endpoint específico de cambio de contraseña
 */
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['curp', 'contrasena'] as const),
) {

  @IsOptional()
  @IsBoolean({
    message: 'El campo estaActivo debe ser un valor booleano (true/false)',
  })
  estaActivo?: boolean;

  /**
   * Permite forzar al usuario a cambiar su contraseña
   * true = Usuario debe cambiar contraseña en próximo login
   * false = Contraseña actual es válida
   */
  @IsOptional()
  @IsBoolean({
    message:
      'El campo debeCambiarContrasena debe ser un valor booleano (true/false)',
  })
  debeCambiarContrasena?: boolean;
}