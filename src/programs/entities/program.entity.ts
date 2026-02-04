import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * Enumeración de Modalidades
 */
export enum Modalidad {
  ESCOLARIZADO = 'ESCOLARIZADO',
  SABATINO = 'SABATINO',
}

/**
 * Entidad Program (Programas Académicos)
 * Carreras/Licenciaturas del sistema
 * 
 * @table programas
 */
@Entity('programas')
@Index('idx_programas_codigo', ['codigo'])
export class Program {
  /**
   * ID único del programa
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Nombre completo del programa
   * @example "Licenciatura en Fisioterapia"
   */
  @Column({ type: 'varchar', length: 255, nullable: false })
  nombre: string;

  /**
   * Código corto del programa
   * @example "LFT"
   */
  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  codigo: string;

  /**
   * Modalidad del programa
   * ESCOLARIZADO o SABATINO
   */
  @Column({ type: 'varchar', length: 20, nullable: false })
  modalidad: Modalidad;

  /**
   * Duración del programa en semestres
   * @example 8 (4 años)
   * @example 9 (4.5 años)
   */
  @Column({ type: 'integer', nullable: false, name: 'duracion_semestres' })
  duracionSemestres: number;

  /**
   * Indica si el programa está activo
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

  // @OneToMany(() => Student, (student) => student.program)
  // estudiantes: Student[];

  // @OneToMany(() => Subject, (subject) => subject.program)
  // materias: Subject[];

  // ========================
  // MÉTODOS
  // ========================

  /**
   * Obtiene la duración en años
   */
  getDuracionAnios(): number {
    return Math.ceil(this.duracionSemestres / 2);
  }

  /**
   * Obtiene el nombre con código
   * @returns "LFT - Licenciatura en Fisioterapia"
   */
  getNombreCompleto(): string {
    return `${this.codigo} - ${this.nombre}`;
  }
}