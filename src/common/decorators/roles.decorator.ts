import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/role.enum';
import { ROLES_KEY } from '../guards/roles.guard';

/**
 * Decorador @Roles()
 * 
 * Define qué roles tienen permiso para acceder a un endpoint
 * Debe usarse junto con RolesGuard
 * 
 * @param roles - Lista de roles permitidos
 * 
 * Ejemplos de uso:
 * 
 * ```typescript
 * // Solo SUPER_ADMIN puede acceder
 * @Roles(UserRole.SUPER_ADMIN)
 * @Delete(':id')
 * async delete(@Param('id') id: number) { }
 * 
 * // SUPER_ADMIN o ADMIN pueden acceder
 * @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
 * @Get()
 * async list() { }
 * 
 * // Cualquier usuario autenticado (no especificar roles)
 * @Get('profile')
 * async profile() { }
 * 
 * // A nivel de clase (aplica a todos los métodos)
 * @Controller('admin')
 * @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
 * export class AdminController { }
 * ```
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);