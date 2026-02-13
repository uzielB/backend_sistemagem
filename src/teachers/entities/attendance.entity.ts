import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Student } from './student.entity';
import { TeacherAssignment } from './teacher-assignment.entity';
import { Teacher } from './teacher.entity';

/**
 * Estados de asistencia
 */
export enum AttendanceStatus {
  ASISTIO = 'ASISTIO',
  FALTO = 'FALTO',
  RETARDO = 'RETARDO',
}

/**
 * Entidad Attendance (Asistencia)
 * Registra la asistencia de estudiantes a clases
 * 
 * @table asistencias
 */
@Entity('asistencias')
@Index('idx_asistencias_estudiante', ['estudianteId'])
@Index('idx_asistencias_asignacion', ['asignacionId'])
@Index('idx_asistencias_fecha', ['fecha'])
@Index('idx_asistencias_estatus', ['estatus'])
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * ID del estudiante
   */
  @Column({ type: 'integer', nullable: false, name: 'estudiante_id' })
  estudianteId: number;

  /**
   * ID de la asignación (materia-grupo-docente)
   */
  @Column({ type: 'integer', nullable: false, name: 'asignacion_id' })
  asignacionId: number;

  /**
   * Fecha de la asistencia
   */
  @Column({ type: 'date', nullable: false })
  fecha: Date;

  /**
   * Estatus de la asistencia
   * ASISTIO, FALTO, RETARDO
   */
  @Column({ type: 'varchar', length: 20, nullable: false })
  estatus: AttendanceStatus;

  /**
   * Indica si el estudiante llegó tarde
   */
  @Column({ type: 'boolean', default: false, name: 'llego_tarde' })
  llegoTarde: boolean;

  /**
   * Comentarios sobre la asistencia
   */
  @Column({ type: 'text', nullable: true })
  comentarios: string;

  /**
   * ID del docente que registró la asistencia
   */
  @Column({ type: 'integer', nullable: true, name: 'registrado_por' })
  registradoPor: number;

  @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  // ==================== RELACIONES ====================

  @ManyToOne(() => Student, { eager: true })
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Student;

  @ManyToOne(() => TeacherAssignment)
  @JoinColumn({ name: 'asignacion_id' })
  asignacion: TeacherAssignment;

  @ManyToOne(() => Teacher, { nullable: true })
  @JoinColumn({ name: 'registrado_por' })
  docenteRegistrador: Teacher;

  // ==================== MÉTODOS HELPER ====================

  /**
   * Verifica si el estudiante asistió
   */
  asistio(): boolean {
    return this.estatus === AttendanceStatus.ASISTIO;
  }

  /**
   * Verifica si el estudiante faltó
   */
  falto(): boolean {
    return this.estatus === AttendanceStatus.FALTO;
  }

  /**
   * Verifica si el estudiante llegó tarde
   */
  tuvoRetardo(): boolean {
    return this.estatus === AttendanceStatus.RETARDO || this.llegoTarde;
  }

  /**
   * Calcula el valor de la asistencia para porcentaje
   * Asistió = 1.0, Retardo = 0.5, Faltó = 0.0
   */
  getValorAsistencia(): number {
    if (this.asistio()) return 1.0;
    if (this.tuvoRetardo()) return 0.5;
    return 0.0;
  }

  /**
   * Obtiene un resumen de la asistencia
   */
  getResumen(): string {
    const fecha = this.fecha.toISOString().split('T')[0];
    const nombre = this.estudiante?.usuario?.getFullName() || 'Estudiante';
    return `${nombre} - ${fecha}: ${this.estatus}`;
  }
}