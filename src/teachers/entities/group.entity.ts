import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Program } from '../../programs/entities/program.entity';
import { SchoolPeriod } from '../../school-periods/entities/school-period.entity';

/**
 * Entidad Group (Grupo)
 * Almacena los grupos de estudiantes por programa y periodo
 * 
 * @table grupos
 */
@Entity('grupos')
@Index('idx_grupos_programa_id', ['programaId'])
@Index('idx_grupos_periodo_id', ['periodoEscolarId'])
@Index('idx_grupos_semestre', ['semestre'])
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false, name: 'programa_id' })
  programaId: number;

  @Column({ type: 'integer', nullable: false, name: 'periodo_escolar_id' })
  periodoEscolarId: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  nombre: string;

  @Column({ type: 'integer', nullable: false })
  semestre: number;

  @Column({ type: 'integer', default: 30, name: 'capacidad_maxima' })
  capacidadMaxima: number;

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

  @ManyToOne(() => SchoolPeriod)
  @JoinColumn({ name: 'periodo_escolar_id' })
  periodoEscolar: SchoolPeriod;
}