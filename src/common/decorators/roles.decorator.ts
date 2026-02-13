import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Decorator de Roles
 * 
 * Define qué roles pueden acceder a una ruta específica
 * Debe usarse en conjunto con RolesGuard
 * 
 * Ejemplos:
 * ```typescript
 * // Permitir solo DOCENTE
 * @Roles(UserRole.DOCENTE)
 * @Get('horarios')
 * async getSchedule() { ... }
 * 
 * // Permitir SUPER_ADMIN o ADMIN
 * @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
 * @Get('admin/users')
 * async getUsers() { ... }
 * 
 * // Permitir todos los roles administrativos
 * @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
 * @Post('admin/create')
 * async create() { ... }
 * ```
 * 
 * @param roles - Roles permitidos para acceder a la ruta
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);