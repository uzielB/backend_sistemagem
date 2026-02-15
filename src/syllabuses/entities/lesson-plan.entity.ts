import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,  JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Syllabus } from './sallybus.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { User } from '../../users/entities/user.entity';

export enum LessonPlanStatus {
  PENDING_REVIEW = 'PENDIENTE_REVISION',
  IN_REVIEW = 'EN_REVISION',
  APPROVED = 'APROBADA',
  REJECTED = 'RECHAZADA',
  WITH_OBSERVATIONS = 'CON_OBSERVACIONES'
}

@Entity('planeaciones_docentes')
export class LessonPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'temario_id' })
  temarioId: number;

  @Column({ name: 'docente_id' })
  docenteId: number;

  @Column({ name: 'asignacion_id' })
  asignacionId: number;

  @Column({ name: 'nombre_archivo', length: 255 })
  nombreArchivo: string;

  @Column({ name: 'nombre_original', length: 255 })
  nombreOriginal: string;

  @Column({ name: 'ruta_archivo', length: 500 })
  rutaArchivo: string;

  @Column({ 
    name: 'tamano_mb', 
    type: 'decimal', 
    precision: 5, 
    scale: 2, 
    nullable: true 
  })
  tamanoMb: number;

  @Column({ length: 255, nullable: true })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ 
    name: 'fecha_subida', 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP' 
  })
  fechaSubida: Date;

  @Column({ 
    type: 'varchar', 
    length: 30, 
    default: LessonPlanStatus.PENDING_REVIEW 
  })
  estatus: LessonPlanStatus;

  @Column({ name: 'revisado_por', nullable: true })
  revisadoPor: number;

  @Column({ name: 'fecha_revision', type: 'timestamp', nullable: true })
  fechaRevision: Date;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ default: 1 })
  version: number;

  @Column({ name: 'planeacion_anterior_id', nullable: true })
  planeacionAnteriorId: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  // ============================================
  // RELACIONES
  // ============================================

  /**
   * Relación con Syllabus (temario base)
   * Una planeación está basada en un temario
   */
  @ManyToOne(() => Syllabus, syllabus => syllabus.lessonPlans)
  @JoinColumn({ name: 'temario_id' })
  syllabus: Syllabus;

  /**
   * Relación con Teacher (docente que subió la planeación)
   * Una planeación es creada por un docente
   */
  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'docente_id' })
  teacher: Teacher;

  /**
   * Relación con User (revisor)
   * Una planeación puede ser revisada por un usuario (SuperAdmin/Admin)
   */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'revisado_por' })
  reviewer: User;

  /**
   * Relación con LessonPlan anterior (para versionado)
   * Una planeación puede tener una versión anterior
   */
  @ManyToOne(() => LessonPlan)
  @JoinColumn({ name: 'planeacion_anterior_id' })
  previousVersion: LessonPlan;

  // ============================================
  // NOTA: Relación con TeacherAssignment
  // ============================================
  // Si tienes esta entidad creada, descomenta y ajusta:
  
  /*
  @ManyToOne(() => TeacherAssignment)
  @JoinColumn({ name: 'asignacion_id' })
  assignment: TeacherAssignment;
  */
}