import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Student } from './student.entity';
import { TeacherAssignment } from './teacher-assignment.entity';
import { Teacher } from './teacher.entity';

/**
 * Tipos de calificación
 */
export enum GradeType {
  PARCIAL_1 = 'PARCIAL_1',
  PARCIAL_2 = 'PARCIAL_2',
  PARCIAL_3 = 'PARCIAL_3',
  FINAL = 'FINAL',
}

/**
 * Entidad Grade (Calificación)
 * Almacena las calificaciones de los estudiantes por asignación
 * 
 * @table calificaciones
 */
@Entity('calificaciones')
@Index('idx_calificaciones_estudiante', ['estudianteId'])
@Index('idx_calificaciones_asignacion', ['asignacionId'])
@Index('idx_calificaciones_tipo', ['tipoCalificacion'])
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * ID del estudiante calificado
   */
  @Column({ type: 'integer', nullable: false, name: 'estudiante_id' })
  estudianteId: number;

  /**
   * ID de la asignación (materia-grupo-docente)
   */
  @Column({ type: 'integer', nullable: false, name: 'asignacion_id' })
  asignacionId: number;

  /**
   * Tipo de calificación
   * PARCIAL_1, PARCIAL_2, PARCIAL_3, FINAL
   */
  @Column({ type: 'varchar', length: 50, nullable: false, name: 'tipo_calificacion' })
  tipoCalificacion: GradeType;

  /**
   * Valor de la calificación (0-100)
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: false, name: 'valor_calificacion' })
  valorCalificacion: number;

  /**
   * Porcentaje que representa esta calificación
   * @example 30 (30% del total)
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  porcentaje: number;

  /**
   * Comentarios del docente sobre la calificación
   */
  @Column({ type: 'text', nullable: true })
  comentarios: string;

  /**
   * ID del docente que asignó la calificación
   */
  @Column({ type: 'integer', nullable: true, name: 'calificado_por' })
  calificadoPor: number;

  /**
   * Fecha en que se asignó la calificación
   */
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'fecha_calificacion' })
  fechaCalificacion: Date;

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
  @JoinColumn({ name: 'calificado_por' })
  docenteCalificador: Teacher;

  // ==================== MÉTODOS HELPER ====================

  /**
   * Verifica si la calificación es aprobatoria
   * @param minimoAprobatorio - Calificación mínima para aprobar (default: 60)
   */
  esAprobatoria(minimoAprobatorio: number = 60): boolean {
    return Number(this.valorCalificacion) >= minimoAprobatorio;
  }

  /**
   * Obtiene la letra equivalente a la calificación
   */
  getLetraCalificacion(): string {
    const valor = Number(this.valorCalificacion);
    if (valor >= 90) return 'A';
    if (valor >= 80) return 'B';
    if (valor >= 70) return 'C';
    if (valor >= 60) return 'D';
    return 'F';
  }

  /**
   * Calcula el valor ponderado de la calificación
   */
  getValorPonderado(): number {
    if (!this.porcentaje) return Number(this.valorCalificacion);
    return (Number(this.valorCalificacion) * Number(this.porcentaje)) / 100;
  }
}