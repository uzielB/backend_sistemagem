import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * Guard de Autenticación JWT
 * 
 * Protege rutas requiriendo un token JWT válido
 * Se usa con @UseGuards(JwtAuthGuard)
 * 
 * Ejemplo:
 * ```typescript
 * @UseGuards(JwtAuthGuard)
 * @Get('protected')
 * async protectedRoute(@Request() req) {
 *   // req.user contiene la información del usuario autenticado
 *   return req.user;
 * }
 * ```
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Agregar lógica personalizada aquí si es necesario
    // Por ejemplo, verificar si el usuario está activo, etc.
    return super.canActivate(context);
  }
}