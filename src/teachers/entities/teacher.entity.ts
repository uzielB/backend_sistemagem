import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Enumeración de Grados Académicos
 */
export enum GradoAcademico {
  LICENCIATURA = 'LICENCIATURA',
  MAESTRIA = 'MAESTRIA',
  DOCTORADO = 'DOCTORADO',
}

/**
 * Entidad Teacher (Docente)
 * Tabla actualizada V3 con formulario de disponibilidad y documentos
 * 
 * Relación 1:1 con User (un usuario con rol DOCENTE puede tener un perfil de docente)
 * 
 * @table docentes
 */
@Entity('docentes')
@Index('idx_docentes_usuario_id', ['usuarioId'])
@Index('idx_docentes_numero_empleado', ['numeroEmpleado'])
@Index('idx_docentes_formulario_completo', ['haCompletadoFormulario'])
export class Teacher {
  /**
   * ID único del docente
   * Generado automáticamente por PostgreSQL
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * ID del usuario asociado
   * Relación 1:1 con la tabla usuarios
   * Un docente pertenece a un único usuario con rol DOCENTE
   */
  @Column({ type: 'integer', unique: true, nullable: false, name: 'usuario_id' })
  usuarioId: number;

  /**
   * Número de empleado del docente
   * Identificador único interno
   * Formato sugerido: EMP001, EMP002, etc.
   * 
   * @unique
   * @example "EMP001"
   */
  @Column({ type: 'varchar', length: 50, unique: true, nullable: false, name: 'numero_empleado' })
  numeroEmpleado: string;

  /**
   * Departamento al que pertenece el docente
   * Opcional
   * 
   * @example "Departamento de Ciencias de la Salud"
   * @example "Departamento de Ciencias Sociales"
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  departamento: string;

  /**
   * Especialidad o área de conocimiento del docente
   * Opcional
   * 
   * @example "Fisioterapia Deportiva"
   * @example "Derecho Civil"
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  especialidad: string;

  /**
   * Fecha de contratación del docente
   * Opcional
   */
  @Column({ type: 'date', nullable: true, name: 'fecha_contratacion' })
  fechaContratacion: Date;

  // ========================
  // INFORMACIÓN DEL FORMULARIO (NUEVO EN V3)
  // ========================

  /**
   * Grados académicos del docente
   * Array de grados: LICENCIATURA, MAESTRIA, DOCTORADO
   * Se almacena como JSONB en PostgreSQL
   * 
   * @example ["LICENCIATURA", "MAESTRIA"]
   */
  @Column({ type: 'jsonb', nullable: true, name: 'grados_academicos' })
  gradosAcademicos: GradoAcademico[];

  /**
   * Área o campo del grado académico
   * Descripción del área de especialización
   * 
   * @example "Licenciatura en Fisioterapia, Maestría en Rehabilitación"
   */
  @Column({ type: 'text', nullable: true, name: 'area_grado_academico' })
  areaGradoAcademico: string;


  @Column({ type: 'boolean', default: false, name: 'ha_completado_formulario' })
  haCompletadoFormulario: boolean;

  /**
   * Indica si el docente ha subido todos sus documentos requeridos
   * true = Documentos completos
   * false = Faltan documentos
   */
  @Column({ type: 'boolean', default: false, name: 'ha_subido_documentos' })
  haSubidoDocumentos: boolean;


  @Column({ type: 'boolean', default: false, name: 'ha_proporcionado_datos_bancarios' })
  haProporcionadoDatosBancarios: boolean;

  /**
   * Indica si el docente está activo en el sistema
   * 
   * true = Docente activo (puede impartir clases)
   * false = Docente inactivo (no imparte clases)
   */
  @Column({ type: 'boolean', default: true, name: 'esta_activo' })
  estaActivo: boolean;

  /**
   * Fecha de creación del registro
   * Se establece automáticamente al crear el docente
   */
  @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion' })
  fechaCreacion: Date;


  @UpdateDateColumn({ type: 'timestamp', name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

 
  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  getNombreCompleto(): string {
    if (this.usuario) {
      return this.usuario.getFullName();
    }
    return '';
  }

  /**
   * Verifica si el docente puede impartir clases
   * Un docente puede impartir si está activo y su usuario está activo
   */
  puedeImpartirClases(): boolean {
    return this.estaActivo && this.usuario && this.usuario.estaActivo;
  }

  perfilCompleto(): boolean {
    return (
      this.haCompletadoFormulario &&
      this.haSubidoDocumentos &&
      this.haProporcionadoDatosBancarios
    );
  }

  /**
   * Calcula el porcentaje de completitud del perfil
   * @returns Porcentaje de 0 a 100
   */
  calcularPorcentajeCompletitud(): number {
    let completado = 0;
    const total = 3; // 3 requisitos: formulario, documentos, datos bancarios

    if (this.haCompletadoFormulario) completado++;
    if (this.haSubidoDocumentos) completado++;
    if (this.haProporcionadoDatosBancarios) completado++;

    return Math.round((completado / total) * 100);
  }

  /**
   * Obtiene el grado académico más alto del docente
   */
  getGradoMasAlto(): GradoAcademico | null {
    if (!this.gradosAcademicos || this.gradosAcademicos.length === 0) {
      return null;
    }

    // Orden de prioridad: DOCTORADO > MAESTRIA > LICENCIATURA
    if (this.gradosAcademicos.includes(GradoAcademico.DOCTORADO)) {
      return GradoAcademico.DOCTORADO;
    }
    if (this.gradosAcademicos.includes(GradoAcademico.MAESTRIA)) {
      return GradoAcademico.MAESTRIA;
    }
    if (this.gradosAcademicos.includes(GradoAcademico.LICENCIATURA)) {
      return GradoAcademico.LICENCIATURA;
    }

    return null;
  }
}