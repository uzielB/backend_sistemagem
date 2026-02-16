/**
 * DTOs para el Dashboard del SuperAdmin
 * Contiene todas las métricas e indicadores del sistema
 */

// ==================== MÉTRICAS GENERALES ====================

export class UsuariosMetricsDto {
  totalUsuarios: number;
  usuariosPorRol: {
    superAdmin: number;
    admin: number;
    docente: number;
    alumno: number;
  };
  usuariosActivos: number;
  usuariosInactivos: number;
  nuevosEsteMes: number;
}

export class DocentesMetricsDto {
  totalDocentes: number;
  docentesActivos: number;
  docentesInactivos: number;
  docentesConFormularioCompleto: number;
  docentesConDocumentosCompletos: number;
  docentesConDatosBancarios: number;
}

export class EstudiantesMetricsDto {
  totalEstudiantes: number;
  estudiantesPorEstatus: {
    activos: number;
    bajaTemporal: number;
    egresados: number;
  };
  estudiantesPorPrograma: Array<{
    programaNombre: string;
    cantidad: number;
  }>;
  nuevosEsteMes: number;
}

// ==================== MÉTRICAS ACADÉMICAS ====================

export class AcademicoMetricsDto {
  totalProgramas: number;
  programasActivos: number;
  totalMaterias: number;
  materiasActivas: number;
  totalGrupos: number;
  gruposActivos: number;
  periodoActual: {
    id: number;
    nombre: string;
    codigo: string;
    fechaInicio: Date;
    fechaFin: Date;
  } | null;
}

export class AsignacionesMetricsDto {
  totalAsignaciones: number;
  asignacionesActivas: number;
  asignacionesSinModuloHorario: number;
  asignacionesPorSistema: {
    escolarizado: number;
    sabatino: number;
  };
  docentesConAsignaciones: number;
  gruposCubiertos: number;
}

// ==================== ALERTAS ====================

export class AlertasDto {
  documentosDocentesPendientes: number;
  planeacionesPendientesRevision: number;
  disponibilidadPendienteRevision: number;
  asignacionesSinModulo: number;
  docentesSinFormulario: number;
  docentesSinDocumentos: number;
  estudiantesSinDocumentos: number;
}

// ==================== ACTIVIDAD RECIENTE ====================

export class ActividadRecienteDto {
  tipo: string; // 'usuario_creado', 'planeacion_subida', 'documento_aprobado', etc.
  descripcion: string;
  fecha: Date;
  usuario?: {
    id: number;
    nombre: string;
  };
}

// ==================== RESPUESTA COMPLETA DEL DASHBOARD ====================

export class DashboardResponseDto {
  // Métricas generales
  usuarios: UsuariosMetricsDto;
  docentes: DocentesMetricsDto;
  estudiantes: EstudiantesMetricsDto;
  
  // Métricas académicas
  academico: AcademicoMetricsDto;
  asignaciones: AsignacionesMetricsDto;
  
  // Alertas
  alertas: AlertasDto;
  
  // Actividad reciente (opcional)
  actividadReciente?: ActividadRecienteDto[];
  
  // Timestamp de generación
  generadoEn: Date;
}

// ==================== FILTROS ====================

export class DashboardFiltersDto {
  periodoEscolarId?: number;
  programaId?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
}