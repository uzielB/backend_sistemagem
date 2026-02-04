import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';


export interface JwtPayload {
  sub: number;
  curp: string;
  rol: string;
}

/**
 * Estrategia JWT
 * Valida los tokens JWT en las peticiones protegidas
 * 
 * Se ejecuta automáticamente cuando un endpoint usa @UseGuards(JwtAuthGuard)
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      // Extraer el token del header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // No ignorar tokens expirados
      ignoreExpiration: false,

      // Secret para validar la firma del token
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'GEM_SECRET_KEY_DEFAULT_CAMBIAR_EN_PRODUCCION',
      ),
    });
  }

  /**
   * Método que se ejecuta después de validar el token JWT
   * Aquí podemos agregar lógica adicional de validación
   * 
   * @param payload - Payload decodificado del JWT
   * @returns Información del usuario que se adjuntará a request.user
   */
  async validate(payload: JwtPayload) {
    // Verificar que el usuario aún existe y está activo
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException(
        'El token es válido pero el usuario ya no existe',
      );
    }

    if (!user.estaActivo) {
      throw new UnauthorizedException(
        'El usuario ha sido desactivado y no puede acceder',
      );
    }

     return {
      id: payload.sub,
      curp: payload.curp,
      rol: payload.rol,
      nombre: user.nombre,
      apellidoPaterno: user.apellidoPaterno,
      apellidoMaterno: user.apellidoMaterno,
    };
  }
}
