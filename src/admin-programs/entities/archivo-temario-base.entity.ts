import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Subject } from '../../teachers/entities/subject.entity';
import { SchoolPeriod } from '../../school-periods/entities/school-period.entity';
import { User } from '../../users/entities/user.entity';

@Entity('archivos_temario_base')
export class ArchivoTemarioBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'materia_id' })
  materiaId: number;

  @Column({ name: 'periodo_escolar_id' })
  periodoEscolarId: number;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'archivo_pdf', type: 'varchar', length: 500 })
  archivoPdf: string;

  @Column({ name: 'nombre_original', type: 'varchar', length: 255 })
  nombreOriginal: string;

  @Column({ name: 'tamano_mb', type: 'decimal', precision: 5, scale: 2, nullable: true })
  tamanoMb: number;

  @Column({ type: 'int', default: 1 })
  orden: number;

  @Column({ type: 'varchar', length: 50, default: 'GENERAL' })
  tipo: string;

  @Column({ name: 'subido_por' })
  subidoPor: number;

  @Column({ name: 'fecha_subida', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaSubida: Date;

  @Column({ name: 'esta_activo', type: 'boolean', default: true })
  estaActivo: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  // Relaciones
  @ManyToOne(() => Subject, { eager: false })
  @JoinColumn({ name: 'materia_id' })
  materia: Subject;

  @ManyToOne(() => SchoolPeriod, { eager: false })
  @JoinColumn({ name: 'periodo_escolar_id' })
  periodo: SchoolPeriod;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'subido_por' })
  subidoPorUsuario: User;
}