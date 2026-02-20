/**
 * DTOs para gestión de Programas (Carreras) y Temarios
 * Usado por Admin para subir y gestionar temarios
 */

// ==================== PROGRAMAS ====================

export class ProgramResponseDto {
  id: number;
  nombre: string;
  codigo: string;
  modalidad: string;
  duracionSemestres: number;
  estaActivo: boolean;
  totalMaterias?: number; // Cantidad de materias del programa
}

export class ProgramDetailDto extends ProgramResponseDto {
  materias: MateriaResponseDto[];
}

// ==================== MATERIAS ====================

export class MateriaResponseDto {
  id: number;
  programaId: number;
  nombre: string;
  codigo: string;
  semestre: number;
  creditos: number;
  estaActivo: boolean;
  tieneTemario?: boolean; // Si ya tiene temario subido
  temario?: TemarioResponseDto; // Temario asociado
}

// ==================== TEMARIOS ====================

export class TemarioResponseDto {
  id: number;
  materiaId: number;
  periodoEscolarId: number;
  nombreArchivo: string;
  nombreOriginal: string;
  rutaArchivo: string;
  tamanoMb: number;
  titulo: string;
  descripcion: string;
  subidoPor: number;
  fechaSubida: Date;
  estaActivo: boolean;
  
  // Relaciones
  materia?: {
    id: number;
    nombre: string;
    codigo: string;
  };
  
  periodo?: {
    id: number;
    nombre: string;
    codigo: string;
  };
  
  subidoPorUsuario?: {
    id: number;
    nombre: string;
  };
}

export class CreateTemarioDto {
  materiaId: number;
  periodoEscolarId: number;
  titulo?: string;
  descripcion?: string;
}

export class UpdateTemarioDto {
  titulo?: string;
  descripcion?: string;
  estaActivo?: boolean;
}

// ==================== DOCENTES ====================

export class DocenteListDto {
  id: number;
  usuarioId: number;
  numeroEmpleado: string;
  nombreCompleto: string;
  correo: string;
  telefono: string;
  departamento: string;
  especialidad: string;
  estaActivo: boolean;
  
  // Estadísticas
  totalAsignaciones?: number;
  programasQueImparte?: string[]; // Nombres de programas
}

export class DocenteDetailDto extends DocenteListDto {
  asignaciones: AsignacionDocenteDto[];
}

export class AsignacionDocenteDto {
  id: number;
  materiaId: number;
  materiaNombre: string;
  programaId: number;
  programaNombre: string;
  grupoNombre: string;
  periodoNombre: string;
  tieneTemario: boolean;
}

// ==================== FILTROS ====================

export class ProgramFiltersDto {
  modalidad?: string; // ESCOLARIZADO, SABATINO
  estaActivo?: boolean;
}

export class MateriaFiltersDto {
  programaId?: number;
  semestre?: number;
  tieneTemario?: boolean;
}

export class DocenteFiltersDto {
  departamento?: string;
  estaActivo?: boolean;
  programaId?: number; // Docentes que imparten en este programa
}