import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * Entidad SchoolPeriod (Periodos Escolares)
 * Periodos académicos del sistema
 * 
 * @table periodos_escolares
 */
@Entity('periodos_escolares')
@Index('idx_periodos_codigo', ['codigo'])
@Index('idx_periodos_actual', ['esActual'])
export class SchoolPeriod {
  /**
   * ID único del periodo escolar
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Nombre del periodo
   * @example "Enero-Junio 2025"
   */
  @Column({ type: 'varchar', length: 100, nullable: false })
  nombre: string;

  /**
   * Código corto del periodo
   * @example "2025-1"
   */
  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  codigo: string;

  /**
   * Fecha de inicio del periodo
   */
  @Column({ type: 'date', nullable: false, name: 'fecha_inicio' })
  fechaInicio: Date;

  /**
   * Fecha de fin del periodo
   */
  @Column({ type: 'date', nullable: false, name: 'fecha_fin' })
  fechaFin: Date;

  /**
   * Indica si es el periodo actual
   * Solo un periodo puede ser actual a la vez
   */
  @Column({ type: 'boolean', default: false, name: 'es_actual' })
  esActual: boolean;

  /**
   * Indica si el periodo está activo
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
  // RELACIONES (comentadas - activar al crear módulos relacionados)
  // ========================

  // @OneToMany(() => TeacherAvailability, (availability) => availability.periodoEscolar)
  // disponibilidades: TeacherAvailability[];

  // @OneToMany(() => Group, (group) => group.periodoEscolar)
  // grupos: Group[];

  // ========================
  // MÉTODOS
  // ========================

  /**
   * Obtiene la duración del periodo en días
   */
  getDuracionDias(): number {
    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFin);
    const diff = fin.getTime() - inicio.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtiene la duración en meses aproximados
   */
  getDuracionMeses(): number {
    return Math.round(this.getDuracionDias() / 30);
  }

  /**
   * Verifica si el periodo está en curso actualmente
   */
  estaEnCurso(): boolean {
    const hoy = new Date();
    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFin);
    return hoy >= inicio && hoy <= fin;
  }

  /**
   * Obtiene el nombre completo con código
   * @returns "2025-1 - Enero-Junio 2025"
   */
  getNombreCompleto(): string {
    return `${this.codigo} - ${this.nombre}`;
  }
}