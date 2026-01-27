import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

/**
 * Estrategia Local
 * Valida las credenciales (CURP y contraseña) durante el login
 * 
 * Se ejecuta automáticamente cuando se usa @UseGuards(LocalAuthGuard)
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      // Configurar para usar 'curp' en lugar de 'username'
      usernameField: 'curp',
      passwordField: 'contrasena',
    });
  }

  /**
   * Método que se ejecuta para validar las credenciales
   * 
   * @param curp - CURP del usuario
   * @param contrasena - Contraseña en texto plano
   * @returns Usuario si las credenciales son válidas
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  async validate(curp: string, contrasena: string): Promise<User> {
    // Buscar usuario por CURP (incluyendo la contraseña)
    let user: User;
    try {
      user = await this.usersService.findByCurp(curp, true);
    } catch (error) {
      // Usuario no encontrado
      throw new UnauthorizedException('CURP o contraseña incorrectos');
    }

    // Verificar que el usuario esté activo
    if (!user.estaActivo) {
      throw new UnauthorizedException(
        'Tu cuenta ha sido desactivada. Contacta al administrador.',
      );
    }

    // Validar la contraseña
    const contrasenaValida = await user.validatePassword(contrasena);

    if (!contrasenaValida) {
      throw new UnauthorizedException('CURP o contraseña incorrectos');
    }

    // Si llegamos aquí, las credenciales son válidas
    // Retornar el usuario (sin la contraseña)
    delete user.contrasena;
    return user;
  }
}