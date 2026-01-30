import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { SchoolPeriod } from '../../school-periods/entities/school-period.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Enumeración de Estatus de Disponibilidad
 */
export enum EstatusDisponibilidad {
  PENDIENTE = 'PENDIENTE',
  REVISADO = 'REVISADO',
  APROBADO = 'APROBADO',
}

/**
 * Entidad TeacherAvailability (Disponibilidad Horaria del Docente)
 * Formulario que llena el docente indicando su disponibilidad
 * 
 * @table disponibilidad_horaria_docentes
 */
@Entity('disponibilidad_horaria_docentes')
@Unique(['docenteId', 'periodoEscolarId'])
@Index('idx_disponibilidad_docente', ['docenteId'])
@Index('idx_disponibilidad_periodo', ['periodoEscolarId'])
@Index('idx_disponibilidad_estatus', ['estatus'])
export class TeacherAvailability {
  /**
   * ID único de la disponibilidad
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * ID del docente
   * Relación con la tabla docentes
   */
  @Column({ type: 'integer', nullable: false, name: 'docente_id' })
  docenteId: number;

  /**
   * ID del periodo escolar
   * Relación con la tabla periodos_escolares
   */
  @Column({ type: 'integer', nullable: false, name: 'periodo_escolar_id' })
  periodoEscolarId: number;

  // ========================
  // PROGRAMAS Y SISTEMAS
  // ========================

  /**
   * IDs de los programas donde puede impartir clases
   * Array de IDs de la tabla programas
   * Se almacena como JSONB
   * 
   * @example [1, 3, 5] (LFT, LDO, LCE)
   */
  @Column({ type: 'jsonb', nullable: false, name: 'programas_imparte' })
  programasImparte: number[];

  /**
   * Sistemas en los que está disponible
   * Array de strings: ESCOLARIZADO y/o SABATINO
   * Se almacena como JSONB
   * 
   * @example ["ESCOLARIZADO"]
   * @example ["ESCOLARIZADO", "SABATINO"]
   */
  @Column({ type: 'jsonb', nullable: false, name: 'sistemas_disponibles' })
  sistemasDisponibles: string[];

  /**
   * Módulos disponibles en sistema ESCOLARIZADO
   * Array de números de módulo (1, 2, 3, 4)
   * Se almacena como JSONB
   * 
   * @example [1, 2, 4]
   */
  @Column({ type: 'jsonb', nullable: true, name: 'modulos_escolarizado' })
  modulosEscolarizado: number[];

  /**
   * Módulos disponibles en sistema SABATINO
   * Array de números de módulo (1, 2, 3)
   * Se almacena como JSONB
   * 
   * @example [1, 2]
   */
  @Column({ type: 'jsonb', nullable: true, name: 'modulos_sabatino' })
  modulosSabatino: number[];

  // ========================
  // PREFERENCIAS
  // ========================

  /**
   * Módulos máximos por semana que puede impartir
   * @example 1, 2, 3, 4
   */
  @Column({ type: 'integer', nullable: false, name: 'modulos_maximos_semana' })
  modulosMaximosSemana: number;

  /**
   * Indica si está disponible para el próximo periodo
   */
  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
    name: 'disponibilidad_proximo_periodo',
  })
  disponibilidadProximoPeriodo: boolean;

  // ========================
  // ESTADO Y REVISIÓN
  // ========================

  /**
   * Estatus de la disponibilidad
   * PENDIENTE: Recién enviado por el docente
   * REVISADO: SuperAdmin lo revisó
   * APROBADO: SuperAdmin lo aprobó y lo usará para asignar
   */
  @Column({
    type: 'varchar',
    length: 20,
    default: EstatusDisponibilidad.PENDIENTE,
  })
  estatus: EstatusDisponibilidad;

  /**
   * Comentarios del administrador
   */
  @Column({ type: 'text', nullable: true, name: 'comentarios_admin' })
  comentariosAdmin: string;

  /**
   * ID del usuario que revisó
   */
  @Column({ type: 'integer', nullable: true, name: 'revisado_por' })
  revisadoPor: number;

  /**
   * Fecha de revisión
   */
  @Column({ type: 'timestamp', nullable: true, name: 'fecha_revision' })
  fechaRevision: Date;

  /**
   * Fecha de creación del registro
   */
  @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion' })
  fechaCreacion: Date;

  /**
   * Fecha de última actualización
   */
  @UpdateDateColumn({ type: 'timestamp', name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  // ========================
  // RELACIONES
  // ========================

  /**
   * Relación ManyToOne con Teacher
   * Una disponibilidad pertenece a un docente
   */
  @ManyToOne(() => Teacher, { eager: true })
  @JoinColumn({ name: 'docente_id' })
  docente: Teacher;

  /**
   * Relación ManyToOne con SchoolPeriod
   * Una disponibilidad pertenece a un periodo escolar
   */
  @ManyToOne(() => SchoolPeriod, { eager: true })
  @JoinColumn({ name: 'periodo_escolar_id' })
  periodoEscolar: SchoolPeriod;

  /**
   * Relación ManyToOne con User (quien revisó)
   */
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'revisado_por' })
  revisor: User;

  // ========================
  // MÉTODOS
  // ========================

  /**
   * Verifica si el formulario está completo
   */
  formularioCompleto(): boolean {
    if (!this.programasImparte || this.programasImparte.length === 0) {
      return false;
    }
    if (!this.sistemasDisponibles || this.sistemasDisponibles.length === 0) {
      return false;
    }

    // Verificar que tenga módulos según los sistemas seleccionados
    if (this.sistemasDisponibles.includes('ESCOLARIZADO')) {
      if (!this.modulosEscolarizado || this.modulosEscolarizado.length === 0) {
        return false;
      }
    }
    if (this.sistemasDisponibles.includes('SABATINO')) {
      if (!this.modulosSabatino || this.modulosSabatino.length === 0) {
        return false;
      }
    }

    return true;
  }

  /**
   * Verifica si está pendiente de revisión
   */
  estaPendiente(): boolean {
    return this.estatus === EstatusDisponibilidad.PENDIENTE;
  }

  /**
   * Verifica si fue aprobado
   */
  estaAprobado(): boolean {
    return this.estatus === EstatusDisponibilidad.APROBADO;
  }

  /**
   * Obtiene el total de módulos disponibles
   */
  getTotalModulosDisponibles(): number {
    let total = 0;
    if (this.modulosEscolarizado) {
      total += this.modulosEscolarizado.length;
    }
    if (this.modulosSabatino) {
      total += this.modulosSabatino.length;
    }
    return total;
  }
}