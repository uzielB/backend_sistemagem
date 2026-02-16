import { IsNumber, IsString, IsOptional, IsDate, IsBoolean, IsArray, IsEnum, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// ==================== ENUMS ====================

export enum GradeType {
  PARCIAL_1 = 'PARCIAL_1',
  PARCIAL_2 = 'PARCIAL_2',
  PARCIAL_3 = 'PARCIAL_3',
  FINAL = 'FINAL',
}

export enum AttendanceStatus {
  ASISTIO = 'ASISTIO',
  FALTO = 'FALTO',
  RETARDO = 'RETARDO',
}

// ==================== HORARIOS Y LISTAS ====================

export class TeacherScheduleResponseDto {
  id: number;
  dia: string;
  modulo: number;
  horaInicio: string;
  horaFin: string;
  materia: string;
  grupo: string;
  aula: string;
  sistema: string;
  materiaId: number;
  grupoId: number;
  asignacionId: number;
}

export class TeacherAssignmentResponseDto {
  id: number;
  sistema: string;
  grupo: string;
  materia: string;
  aula: string;
  
  // ✅ CAMPOS PLANOS DEL MÓDULO HORARIO (para el frontend de Schedule)
  moduloNumero?: number;
  moduloHoraInicio?: string;
  moduloHoraFin?: string;
  moduloSistema?: string;
  moduloDiasSemana?: string;
  
  // Objeto anidado (mantener para compatibilidad)
  moduloHorario?: {
    numeroModulo: number;
    horaInicio: string;
    horaFin: string;
    diasSemana: string;
  };
  
  programa?: {
    id: number;
    nombre: string;
    codigo: string;
  };
  
  periodoEscolar?: {
    id: number;
    nombre: string;
    codigo: string;
  };
}

export class StudentListResponseDto {
  id: number;
  matricula: string;
  nombreCompleto: string;
  programa: string;
  grupo: string;
  correo: string;
  telefono: string;
  estatus: string;
  programaId: number;
  grupoId: number;
}

export class GetTeacherStudentsDto {
  @IsOptional()
  @IsNumber()
  grupoId?: number;

  @IsOptional()
  @IsNumber()
  materiaId?: number;

  @IsOptional()
  @IsNumber()
  asignacionId?: number;

  @IsOptional()
  @IsString()
  sistema?: string;
}

export class MyAssignmentsResponseDto {
  asignaciones: TeacherAssignmentResponseDto[];
  totalAsignaciones: number;
  totalGrupos: number;
  totalAlumnos: number;
  totalHorasSemanales: number;
}

// ==================== CALIFICACIONES ====================

export class SaveGradeDto {
  @IsNumber()
  estudianteId: number;

  @IsNumber()
  asignacionId: number;

  @IsEnum(GradeType)
  tipoCalificacion: GradeType;

  @IsNumber()
  @Min(0)
  @Max(100)
  valorCalificacion: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentaje?: number;

  @IsOptional()
  @IsString()
  comentarios?: string;
}

export class SaveBulkGradesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveGradeDto)
  calificaciones: SaveGradeDto[];
}

export class GradeResponseDto {
  id: number;
  estudianteId: number;
  asignacionId: number;
  tipoCalificacion: string;
  valorCalificacion: number;
  porcentaje: number;
  comentarios: string;
  fechaCalificacion: Date;
  estudiante?: {
    id: number;
    matricula: string;
    nombreCompleto: string;
  };
}

export class GetGradesDto {
  @IsNumber()
  asignacionId: number;

  @IsOptional()
  @IsEnum(GradeType)
  tipoCalificacion?: GradeType;
}

// ==================== ASISTENCIAS ====================

export class SaveAttendanceDto {
  @IsNumber()
  estudianteId: number;

  @IsNumber()
  asignacionId: number;

  @Type(() => Date)
  @IsDate()
  fecha: Date;

  @IsEnum(AttendanceStatus)
  estatus: AttendanceStatus;

  @IsOptional()
  @IsBoolean()
  llegoTarde?: boolean;

  @IsOptional()
  @IsString()
  comentarios?: string;
}

export class AttendanceStudentDto {
  @IsNumber()
  estudianteId: number;

  @IsEnum(AttendanceStatus)
  estatus: AttendanceStatus;

  @IsOptional()
  @IsString()
  comentarios?: string;
}

export class SaveBulkAttendancesDto {
  @Type(() => Date)
  @IsDate()
  fecha: Date;

  @IsNumber()
  asignacionId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceStudentDto)
  asistencias: AttendanceStudentDto[];
}

export class AttendanceResponseDto {
  id: number;
  estudianteId: number;
  asignacionId: number;
  fecha: Date;
  estatus: AttendanceStatus;
  llegoTarde: boolean;
  comentarios: string;
  estudiante?: {
    id: number;
    matricula: string;
    nombreCompleto: string;
    porcentajeAsistencia: number;
  };
}

export class GetAttendancesDto {
  @IsNumber()
  asignacionId: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fecha?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fechaInicio?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fechaFin?: Date;
}

export class AttendancePercentageDto {
  porcentaje: number;
  asistencias: number;
  faltas: number;
  retardos: number;
  total: number;
}