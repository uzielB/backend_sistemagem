import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener los roles requeridos del decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [
        context.getHandler(), // Nivel de método
        context.getClass(), // Nivel de clase
      ],
    );

    // Si no hay roles especificados, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Obtener el usuario de la request (viene de JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // Verificar que el usuario existe
    if (!user) {
      return false;
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    return requiredRoles.some((role) => user.rol === role);
  }
}