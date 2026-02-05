/**
 * Enumeración de Roles de Usuario
 * Sistema Académico GEM
 * 
 * Define los 4 roles principales del sistema:
 * - SUPER_ADMIN: Máximos privilegios, gestión completa
 * - ADMIN: Gestión administrativa y académica
 * - DOCENTE: Profesores con acceso a calificaciones y asistencias
 * - ALUMNO: Estudiantes con acceso de consulta
 */
export enum UserRole {
  
  GUEST = 'GUEST',
  /**
   * Super Administrador (Admin Master)
   * Privilegios: CRUD completo de todos los usuarios, validación de becas,
   * bajas de alumnos, acceso total al sistema
   */
  SUPER_ADMIN = 'SUPER_ADMIN',

  /**
   * Administrador (Sub Administrador)
   * Privilegios: CRUD de docentes, propuestas de becas, gestión de finanzas,
   * validación de procesos académicos
   */
  ADMIN = 'ADMIN',

  /**
   * Docente/Maestro
   * Privilegios: Captura de calificaciones, registro de asistencias,
   * consulta de grupos asignados
   */
  DOCENTE = 'DOCENTE',

  /**
   * Alumno/Estudiante
   * Privilegios: Consulta de información académica, pagos, descarga de documentos
   */
  ALUMNO = 'ALUMNO',
}

/**
 * Array de todos los roles disponibles
 * Útil para validaciones y opciones en formularios
 */
export const AVAILABLE_ROLES = Object.values(UserRole);

/**
 * Roles con privilegios administrativos
 */
export const ADMIN_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN];

/**
 * Roles con privilegios académicos
 */
export const ACADEMIC_ROLES = [UserRole.DOCENTE, UserRole.ALUMNO];

/**
 * Verifica si un rol tiene privilegios administrativos
 * @param role - Rol a verificar
 * @returns true si el rol es SUPER_ADMIN o ADMIN
 */
export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

/**
 * Verifica si un rol tiene privilegios de Super Admin
 * @param role - Rol a verificar
 * @returns true si el rol es SUPER_ADMIN
 */
export function isSuperAdmin(role: UserRole): boolean {
  return role === UserRole.SUPER_ADMIN;
}

/**
 * Verifica si un rol tiene privilegios académicos
 * @param role - Rol a verificar
 * @returns true si el rol es DOCENTE o ALUMNO
 */
export function isAcademicRole(role: UserRole): boolean {
  return ACADEMIC_ROLES.includes(role);
}

/**
 * Obtiene una descripción legible del rol
 * @param role - Rol del cual obtener la descripción
 * @returns Descripción en español del rol
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions = {
    [UserRole.SUPER_ADMIN]: 'Super Administrador',
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.DOCENTE]: 'Docente',
    [UserRole.ALUMNO]: 'Alumno',
  };

  return descriptions[role] || 'Rol desconocido';
}