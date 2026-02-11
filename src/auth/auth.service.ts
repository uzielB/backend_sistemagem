import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtPayload } from './strategies/jwt.strategy';

/**
 * Interfaz de respuesta del login
 */
export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    curp: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    rol: string;
    correo: string;
    debeCambiarContrasena: boolean;
  };
}

/**
 * Servicio de Autenticación
 * Maneja login, logout, cambio de contraseña y generación de tokens JWT
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Inicia sesión con CURP y contraseña
   * 
   * @param loginDto - Credenciales del usuario
   * @returns Token JWT y datos del usuario
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    console.log('');
    console.log('===========================================');
    console.log('🔐 AUTH SERVICE - Login iniciado');
    console.log('CURP recibido:', loginDto.curp);
    console.log('Contraseña recibida:', loginDto.contrasena ? 'SÍ' : 'NO');
    console.log('===========================================');

    // Buscar usuario por CURP (incluyendo contraseña)
    let user: User;
    try {
      console.log('📍 Buscando usuario en BD...');
      user = await this.usersService.findByCurp(loginDto.curp, true);
      console.log('✅ Usuario encontrado:', user ? 'SÍ' : 'NO');
      
      if (user) {
        console.log('👤 Usuario ID:', user.id);
        console.log('👤 Usuario nombre:', user.nombre);
        console.log('👤 Usuario rol:', user.rol);
        console.log('👤 Usuario activo:', user.estaActivo);
        console.log('🔒 Hash de contraseña existe:', user.contrasena ? 'SÍ' : 'NO');
        
        if (user.contrasena) {
          console.log('🔒 Hash (primeros 30 caracteres):', user.contrasena.substring(0, 30) + '...');
        }
      }
    } catch (error) {
      console.error('❌ Error al buscar usuario:', error.message);
      console.log('===========================================');
      console.log('');
      throw new UnauthorizedException('CURP o contraseña incorrectos');
    }

    // Verificar que el usuario esté activo
    if (!user.estaActivo) {
      console.log('❌ Usuario inactivo');
      console.log('===========================================');
      console.log('');
      throw new UnauthorizedException(
        'Tu cuenta ha sido desactivada. Contacta al administrador.',
      );
    }

    // Validar la contraseña
    console.log('🔐 Validando contraseña...');
    console.log('Contraseña ingresada:', loginDto.contrasena);
    console.log('Hash almacenado (primeros 30):', user.contrasena.substring(0, 30) + '...');
    
    const contrasenaValida = await user.validatePassword(loginDto.contrasena);
    console.log('✅ Contraseña válida:', contrasenaValida ? 'SÍ ✅' : 'NO ❌');

    if (!contrasenaValida) {
      console.log('❌ Contraseña incorrecta - Login rechazado');
      console.log('===========================================');
      console.log('');
      throw new UnauthorizedException('CURP o contraseña incorrectos');
    }

    console.log('✅ Autenticación exitosa');

    // Actualizar fecha de último acceso
    await this.usersService.updateLastAccess(user.id);
    console.log('📅 Fecha de último acceso actualizada');

    // Generar token JWT
    const payload: JwtPayload = {
      sub: user.id,
      curp: user.curp,
      rol: user.rol,
    };

    const access_token = this.jwtService.sign(payload);
    console.log('🎫 Token JWT generado');
    console.log('Token (primeros 50 caracteres):', access_token.substring(0, 50) + '...');

    // Preparar respuesta (sin contraseña)
    delete user.contrasena;

    console.log('📤 Enviando respuesta al frontend');
    console.log('===========================================');
    console.log('');

    return {
      access_token,
      user: {
        id: user.id,
        curp: user.curp,
        nombre: user.nombre,
        apellidoPaterno: user.apellidoPaterno,
        apellidoMaterno: user.apellidoMaterno,
        rol: user.rol,
        correo: user.correo,
        debeCambiarContrasena: user.debeCambiarContrasena,
      },
    };
  }

  /**
   * Valida las credenciales de un usuario
   * Usado por LocalStrategy
   * 
   * @param curp - CURP del usuario
   * @param contrasena - Contraseña en texto plano
   * @returns Usuario si las credenciales son válidas, null si no
   */
  async validateUser(curp: string, contrasena: string): Promise<User | null> {
    try {
      const user = await this.usersService.findByCurp(curp, true);

      if (user && (await user.validatePassword(contrasena))) {
        delete user.contrasena;
        return user;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Cambia la contraseña del usuario autenticado
   * 
   * @param userId - ID del usuario
   * @param changePasswordDto - Contraseñas actual y nueva
   * @returns true si el cambio fue exitoso
   * @throws UnauthorizedException si la contraseña actual es incorrecta
   * @throws BadRequestException si las contraseñas no coinciden
   */
  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<boolean> {
    // Verificar que las nuevas contraseñas coincidan
    if (
      changePasswordDto.nuevaContrasena !==
      changePasswordDto.confirmarContrasena
    ) {
      throw new BadRequestException(
        'La nueva contraseña y su confirmación no coinciden',
      );
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    if (
      changePasswordDto.contrasenaActual === changePasswordDto.nuevaContrasena
    ) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente a la actual',
      );
    }

    // Obtener usuario con contraseña
    const user = await this.usersService.findByCurp(
      (await this.usersService.findOne(userId)).curp,
      true,
    );

    // Validar contraseña actual
    const contrasenaActualValida = await user.validatePassword(
      changePasswordDto.contrasenaActual,
    );

    if (!contrasenaActualValida) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Cambiar contraseña
    // forceChange = false porque el usuario ya cambió su contraseña voluntariamente
    await this.usersService.changePassword(
      userId,
      changePasswordDto.nuevaContrasena,
      false,
    );

    return true;
  }

  /**
   * Genera un nuevo token JWT para un usuario
   * Útil para refrescar tokens
   * 
   * @param user - Usuario para el cual generar el token
   * @returns Token JWT
   */
  generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      curp: user.curp,
      rol: user.rol,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Verifica un token JWT
   * 
   * @param token - Token a verificar
   * @returns Payload del token si es válido
   * @throws UnauthorizedException si el token es inválido
   */
  verifyToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado
   * 
   * @param userId - ID del usuario
   * @returns Datos del usuario
   */
  async getProfile(userId: number): Promise<User> {
    return await this.usersService.findOne(userId);
  }
}