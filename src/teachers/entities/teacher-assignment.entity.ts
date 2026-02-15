import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { Teacher } from './teacher.entity';
import { Subject } from './subject.entity';
import { Group } from './group.entity';
import { SchoolPeriod } from '../../school-periods/entities/school-period.entity';
import { ScheduleModule } from '../../schedule-modules/entities/schedule-module.entity';
import { Grade } from './grade.entity';
import { Attendance } from './attendance.entity';

/**
 * Entidad TeacherAssignment (Asignación de Docente)
 * Representa la asignación FINAL de un docente a una materia/grupo
 * Esta asignación la hace el SuperAdmin después de revisar la disponibilidad
 * 
 * @table asignaciones_docentes
 */
@Entity('asignaciones_docentes')
@Index('idx_asignaciones_docente', ['docenteId'])
@Index('idx_asignaciones_materia', ['materiaId'])
@Index('idx_asignaciones_grupo', ['grupoId'])
@Index('idx_asignaciones_periodo', ['periodoEscolarId'])
@Index('idx_asignaciones_modulo', ['moduloHorarioId'])
export class TeacherAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * ID del docente asignado
   */
  @Column({ type: 'integer', nullable: false, name: 'docente_id' })
  docenteId: number;

  /**
   * ID de la materia asignada
   */
  @Column({ type: 'integer', nullable: false, name: 'materia_id' })
  materiaId: number;

  /**
   * ID del grupo asignado
   */
  @Column({ type: 'integer', nullable: false, name: 'grupo_id' })
  grupoId: number;

  /**
   * ID del periodo escolar
   */
  @Column({ type: 'integer', nullable: false, name: 'periodo_escolar_id' })
  periodoEscolarId: number;

  /**
   * ID del módulo horario asignado
   * Opcional - puede ser null si aún no se asigna horario
   */
  @Column({ type: 'integer', nullable: true, name: 'modulo_horario_id' })
  moduloHorarioId: number;

  /**
   * Aula asignada
   * @example "Aula 101", "Lab. Fisioterapia"
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  aula: string;

  /**
   * Horario personalizado (JSONB)
   * Puede contener información adicional del horario
   */
  @Column({ type: 'jsonb', nullable: true })
  horario: any;

  /**
   * Indica si la asignación está activa
   */
  @Column({ type: 'boolean', default: true, name: 'esta_activo' })
  estaActivo: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  // ==================== RELACIONES ====================

  @ManyToOne(() => Teacher, { eager: true })
  @JoinColumn({ name: 'docente_id' })
  docente: Teacher;

  @ManyToOne(() => Subject, { eager: true })
  @JoinColumn({ name: 'materia_id' })
  materia: Subject;

  @ManyToOne(() => Group, { eager: true })
  @JoinColumn({ name: 'grupo_id' })
  grupo: Group;

  @ManyToOne(() => SchoolPeriod)
  @JoinColumn({ name: 'periodo_escolar_id' })
  periodoEscolar: SchoolPeriod;

  @ManyToOne(() => ScheduleModule, { nullable: true })
  @JoinColumn({ name: 'modulo_horario_id' })
  moduloHorario: ScheduleModule;

  @OneToMany(() => Grade, (grade) => grade.asignacion)
  calificaciones: Grade[];

  @OneToMany(() => Attendance, (attendance) => attendance.asignacion)
  asistencias: Attendance[];

  // ==================== MÉTODOS HELPER ====================

  /**
   * Verifica si la asignación es para sistema escolarizado
   */
  esEscolarizado(): boolean {
    return this.moduloHorario?.sistema === 'ESCOLARIZADO';
  }

  /**
   * Verifica si la asignación es para sistema sabatino
   */
  esSabatino(): boolean {
    return this.moduloHorario?.sistema === 'SABATINO';
  }

  /**
   * Obtiene el nombre completo de la asignación
   * @example "Anatomía I - Grupo A - LFT"
   */
  getNombreCompleto(): string {
    return `${this.materia?.nombre || 'Sin materia'} - ${this.grupo?.nombre || 'Sin grupo'}`;
  }
}