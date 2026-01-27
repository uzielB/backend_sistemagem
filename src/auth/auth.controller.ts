import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
// import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

/**
 * Controlador de Autenticación
 * Maneja los endpoints relacionados con autenticación y autorización
 * 
 * Rutas base: /api/auth
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/login
   * Inicio de sesión
   * 
   * @param loginDto - Credenciales (CURP y contraseña)
   * @returns Token JWT y datos del usuario
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);

    return {
      message: 'Inicio de sesión exitoso',
      data: result,
    };
  }

  /**
   * GET /api/auth/profile
   * Obtiene el perfil del usuario autenticado
   * 
   * Requiere autenticación (token JWT válido)
   * 
   * @param req - Request con el usuario autenticado
   * @returns Datos del usuario
   */
  @Get('profile')
  // @UseGuards(JwtAuthGuard) // Activar cuando tengamos el guard
  async getProfile(@Request() req) {
    // El usuario viene de JwtStrategy después de validar el token
    const user = await this.authService.getProfile(req.user.id);

    return {
      message: 'Perfil obtenido exitosamente',
      data: user,
    };
  }

  /**
   * PATCH /api/auth/change-password
   * Cambia la contraseña del usuario autenticado
   * 
   * Requiere autenticación (token JWT válido)
   * 
   * @param req - Request con el usuario autenticado
   * @param changePasswordDto - Contraseñas actual y nueva
   * @returns Confirmación del cambio
   */
  @Patch('change-password')
  // @UseGuards(JwtAuthGuard) // Activar cuando tengamos el guard
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(req.user.id, changePasswordDto);

    return {
      message: 'Contraseña cambiada exitosamente',
    };
  }

  /**
   * POST /api/auth/verify-token
   * Verifica si un token JWT es válido
   * 
   * Útil para el frontend para verificar si el usuario sigue autenticado
   * 
   * @param body - Objeto con el token a verificar
   * @returns Información del token si es válido
   */
  @Post('verify-token')
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Body() body: { token: string }) {
    const payload = this.authService.verifyToken(body.token);

    return {
      message: 'Token válido',
      data: payload,
    };
  }

  /**
   * POST /api/auth/logout
   * Cierre de sesión
   * 
   * Nota: En JWT stateless, el logout se maneja en el cliente eliminando el token.
   * Este endpoint puede usarse para logging o invalidación futura.
   * 
   * @returns Confirmación de logout
   */
  @Post('logout')
  // @UseGuards(JwtAuthGuard) // Activar cuando tengamos el guard
  @HttpCode(HttpStatus.OK)
  async logout() {

    return {
      message: 'Sesión cerrada exitosamente',
    };
  }
}