import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

/**
 * Controlador de Autenticación
 * Maneja los endpoints relacionados con autenticación y autorización
 * 
 * Rutas base: /api/auth
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
  // ✅ BIEN: Devuelve directamente
  return await this.authService.login(loginDto);
}


  @Get('profile')
  @UseGuards(JwtAuthGuard) // ✅ ACTIVADO
  async getProfile(@Request() req) {
    // El usuario viene de JwtStrategy después de validar el token
    const user = await this.authService.getProfile(req.user.id);

    return {
      message: 'Perfil obtenido exitosamente',
      data: user,
    };
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard) 
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
   * Requiere autenticación (token JWT válido)
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    // En JWT stateless, el logout se maneja en el cliente
    // Aquí podríamos agregar lógica adicional como:
    // - Registrar en logs de auditoría
    // - Blacklist del token (requiere Redis/cache)
    // - Notificaciones

    return {
      message: 'Sesión cerrada exitosamente',
    };
  }
}