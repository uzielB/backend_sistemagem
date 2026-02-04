import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';


export enum Sistema {
  ESCOLARIZADO = 'ESCOLARIZADO',
  SABATINO = 'SABATINO',
}

/**
 * Entidad ScheduleModule (Módulos Horarios)
 * Catálogo de módulos horarios que carga el SuperAdmin
 * 
 * ESCOLARIZADO: Lunes a Jueves, 4 módulos
 * SABATINO: Sábados, 3 módulos
 * 
 * @table modulos_horarios
 */
@Entity('modulos_horarios')
@Unique(['sistema', 'numeroModulo'])
@Index('idx_modulos_sistema', ['sistema'])
@Index('idx_modulos_activo', ['estaActivo'])
export class ScheduleModule {
  /**
   * ID único del módulo horario
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Sistema al que pertenece el módulo
   * ESCOLARIZADO: Lunes a Jueves
   * SABATINO: Sábados
   */
  @Column({ type: 'varchar', length: 20, nullable: false })
  sistema: Sistema;

  /**
   * Número del módulo
   * ESCOLARIZADO: 1, 2, 3, 4
   * SABATINO: 1, 2, 3
   */
  @Column({ type: 'integer', nullable: false, name: 'numero_modulo' })
  numeroModulo: number;

  /**
   * Hora de inicio del módulo
   * Formato: HH:MM
   * @example "08:00"
   */
  @Column({ type: 'time', nullable: false, name: 'hora_inicio' })
  horaInicio: string;

  /**
   * Hora de fin del módulo
   * Formato: HH:MM
   * @example "09:30"
   */
  @Column({ type: 'time', nullable: false, name: 'hora_fin' })
  horaFin: string;

  /**
   * Días de la semana que aplica
   * @example "Lunes a Jueves"
   * @example "Sábados"
   */
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'dias_semana' })
  diasSemana: string;

  /**
   * Descripción del módulo
   * @example "Módulo 1: 8:00 a 9:30"
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string;

  /**
   * Indica si el módulo está activo
   */
  @Column({ type: 'boolean', default: true, name: 'esta_activo' })
  estaActivo: boolean;

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
  // MÉTODOS
  // ========================

  /**
   * Obtiene el rango horario en formato legible
   * @returns "08:00 - 09:30"
   */
  getRangoHorario(): string {
    return `${this.horaInicio} - ${this.horaFin}`;
  }

  /**
   * Obtiene la descripción completa del módulo
   */
  getDescripcionCompleta(): string {
    return `${this.sistema} - Módulo ${this.numeroModulo}: ${this.getRangoHorario()}`;
  }
}