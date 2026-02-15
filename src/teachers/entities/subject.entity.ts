import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Program } from '../../programs/entities/program.entity';

/**
 * Entidad Subject (Materia/Asignatura)
 * Almacena las materias de cada programa académico
 * 
 * @table materias
 */
@Entity('materias')
@Index('idx_materias_programa_id', ['programaId'])
@Index('idx_materias_codigo', ['codigo'])
@Index('idx_materias_semestre', ['semestre'])
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false, name: 'programa_id' })
  programaId: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nombre: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  codigo: string;

  @Column({ type: 'integer', nullable: false })
  semestre: number;

  @Column({ type: 'integer', default: 5 })
  creditos: number;

  @Column({ type: 'boolean', default: true, name: 'esta_activo' })
  estaActivo: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  // Relaciones
  @ManyToOne(() => Program)
  @JoinColumn({ name: 'programa_id' })
  programa: Program;
}