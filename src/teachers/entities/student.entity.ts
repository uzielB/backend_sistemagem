import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Program } from '../../programs/entities/program.entity';
import { Group } from './group.entity';

/**
 * Entidad Student (Estudiante)
 * Almacena la información académica y personal de los estudiantes
 * 
 * @table estudiantes
 */
@Entity('estudiantes')
@Index('idx_estudiantes_usuario_id', ['usuarioId'])
@Index('idx_estudiantes_matricula', ['matricula'])
@Index('idx_estudiantes_curp', ['curp'])
@Index('idx_estudiantes_programa_id', ['programaId'])
@Index('idx_estudiantes_grupo_id', ['grupoId'])
@Index('idx_estudiantes_estatus', ['estatus'])
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', unique: true, nullable: false, name: 'usuario_id' })
  usuarioId: number;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  matricula: string;

  @Column({ type: 'integer', nullable: true, name: 'programa_id' })
  programaId: number;

  @Column({ type: 'integer', nullable: true, name: 'grupo_id' })
  grupoId: number;

  @Column({ type: 'varchar', length: 18, unique: true, nullable: false })
  curp: string;

  @Column({ type: 'date', nullable: false, name: 'fecha_nacimiento' })
  fechaNacimiento: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'lugar_nacimiento' })
  lugarNacimiento: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  genero: string;

  @Column({ type: 'varchar', length: 5, nullable: true, name: 'tipo_sangre' })
  tipoSangre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  calle: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'numero_exterior' })
  numeroExterior: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'numero_interior' })
  numeroInterior: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  colonia: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  municipio: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  estado: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'telefono_casa' })
  telefonoCasa: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'telefono_trabajo' })
  telefonoTrabajo: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'telefono_celular' })
  telefonoCelular: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  correo: string;

  @Column({ type: 'boolean', default: false })
  trabaja: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'nombre_empresa' })
  nombreEmpresa: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'direccion_empresa' })
  direccionEmpresa: string;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'escuela_procedencia' })
  escuelaProcedencia: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'ciudad_procedencia' })
  ciudadProcedencia: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'estado_procedencia' })
  estadoProcedencia: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true, name: 'promedio_bachillerato' })
  promedioBachillerato: number;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'nombre_tutor' })
  nombreTutor: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'telefono_tutor' })
  telefonoTutor: string;

  @Column({ type: 'text', nullable: true })
  aficiones: string;

  @Column({ type: 'text', nullable: true })
  deportes: string;

  @Column({ type: 'boolean', default: false, name: 'tiene_enfermedad' })
  tieneEnfermedad: boolean;

  @Column({ type: 'text', nullable: true, name: 'descripcion_enfermedad' })
  descripcionEnfermedad: string;

  @Column({ type: 'boolean', default: false, name: 'tiene_problema_fisico' })
  tieneProblemaFisico: boolean;

  @Column({ type: 'text', nullable: true, name: 'descripcion_problema_fisico' })
  descripcionProblemaFisico: string;

  @Column({ type: 'boolean', default: false, name: 'esta_en_tratamiento' })
  estaEnTratamiento: boolean;

  @Column({ type: 'text', nullable: true, name: 'descripcion_tratamiento' })
  descripcionTratamiento: string;

  @Column({ type: 'integer', nullable: true, name: 'semestre_actual' })
  semestreActual: number;

  @Column({ type: 'varchar', length: 20, nullable: false })
  modalidad: string; // ESCOLARIZADO, SABATINO

  @Column({ type: 'date', nullable: true, name: 'fecha_inscripcion' })
  fechaInscripcion: Date;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVO' })
  estatus: string; // ACTIVO, BAJA_TEMPORAL, EGRESADO

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'porcentaje_beca' })
  porcentajeBeca: number;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'url_foto' })
  urlFoto: string;

  @Column({ type: 'boolean', default: true, name: 'esta_activo' })
  estaActivo: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  // Relaciones
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @ManyToOne(() => Program)
  @JoinColumn({ name: 'programa_id' })
  programa: Program;

  @ManyToOne(() => Group)
  @JoinColumn({ name: 'grupo_id' })
  grupo: Group;
}