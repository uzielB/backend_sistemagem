import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LessonPlan } from './lesson-plan.entity';
import { Subject } from '../../teachers/entities/subject.entity';

@Entity('temarios')
export class Syllabus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'materia_id' })
  materiaId: number;

  @Column({ name: 'periodo_escolar_id' })
  periodoEscolarId: number;

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

  @Column({ name: 'subido_por' })
  subidoPor: number;

  @Column({ 
    name: 'fecha_subida', 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP' 
  })
  fechaSubida: Date;

  @Column({ name: 'esta_activo', default: true })
  estaActivo: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  // ============================================
  // RELACIONES
  // ============================================

  /**
   * Relación con User (quien subió el temario)
   * Un temario es subido por un usuario (SuperAdmin/Admin)
   */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'subido_por' })
  uploadedBy: User;
  
  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'materia_id' })
  subject: Subject;
  /**
   * Relación con LessonPlan (planeaciones basadas en este temario)
   * Un temario puede tener muchas planeaciones
   */
  @OneToMany(() => LessonPlan, lessonPlan => lessonPlan.syllabus)
  lessonPlans: LessonPlan[];

  // ============================================
  // NOTA: Relaciones con Subject y SchoolPeriod
  // ============================================
  // Si tienes estas entidades creadas, descomenta y ajusta:
  
  /*
  
  @ManyToOne(() => SchoolPeriod)
  @JoinColumn({ name: 'periodo_escolar_id' })
  schoolPeriod: SchoolPeriod;
  */
}