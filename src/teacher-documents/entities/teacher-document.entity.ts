import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Enumeración de Estatus de Documentos
 */
export enum EstatusDocumentos {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

/**
 * Entidad TeacherDocuments (Documentos del Docente)
 * Almacena las rutas de los documentos PDF subidos por el docente
 * 
 * @table documentos_docentes
 */
@Entity('documentos_docentes')
@Index('idx_documentos_docente', ['docenteId'])
@Index('idx_documentos_estatus', ['estatus'])
@Index('idx_documentos_completos', ['documentosCompletos'])
export class TeacherDocument {
  /**
   * ID único del registro de documentos
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * ID del docente
   * Relación 1:1 con la tabla docentes
   */
  @Column({ type: 'integer', unique: true, nullable: false, name: 'docente_id' })
  docenteId: number;

  // ========================
  // RUTAS DE ARCHIVOS PDF
  // ========================

  /**
   * Ruta del archivo CURP en PDF
   * @example "/uploads/documents/teachers/1/curp.pdf"
   */
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'curp_pdf' })
  curpPdf: string;

  /**
   * Ruta del acta de nacimiento en PDF
   */
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'acta_nacimiento_pdf' })
  actaNacimientoPdf: string;

  /**
   * Ruta del INE en PDF
   */
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'ine_pdf' })
  inePdf: string;

  /**
   * Ruta del título profesional en PDF
   */
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'titulo_pdf' })
  tituloPdf: string;

  /**
   * Ruta de la cédula profesional en PDF
   */
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'cedula_profesional_pdf' })
  cedulaProfesionalPdf: string;

  /**
   * Ruta del CV en PDF
   */
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'cv_pdf' })
  cvPdf: string;

  // ========================
  // METADATOS
  // ========================

  /**
   * Indica si todos los documentos están completos
   */
  @Column({ type: 'boolean', default: false, name: 'documentos_completos' })
  documentosCompletos: boolean;

  /**
   * Porcentaje de documentos completados (0-100)
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'porcentaje_completado' })
  porcentajeCompletado: number;

  // ========================
  // REVISIÓN
  // ========================

  /**
   * ID del usuario que revisó los documentos
   */
  @Column({ type: 'integer', nullable: true, name: 'revisado_por' })
  revisadoPor: number;

  /**
   * Fecha de revisión
   */
  @Column({ type: 'timestamp', nullable: true, name: 'fecha_revision' })
  fechaRevision: Date;

  /**
   * Estatus de los documentos
   * PENDIENTE: En revisión o faltan documentos
   * APROBADO: Todos los documentos aprobados
   * RECHAZADO: Algún documento fue rechazado
   */
  @Column({
    type: 'varchar',
    length: 20,
    default: EstatusDocumentos.PENDIENTE,
  })
  estatus: EstatusDocumentos;

  /**
   * Comentarios del revisor
   */
  @Column({ type: 'text', nullable: true })
  comentarios: string;

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
   * Relación 1:1 con Teacher
   * Un registro de documentos pertenece a un único docente
   */
  @OneToOne(() => Teacher, { eager: true })
  @JoinColumn({ name: 'docente_id' })
  docente: Teacher;

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
   * Calcula el porcentaje de documentos completados
   */
  calcularPorcentaje(): number {
    const totalDocumentos = 6;
    let completados = 0;

    if (this.curpPdf) completados++;
    if (this.actaNacimientoPdf) completados++;
    if (this.inePdf) completados++;
    if (this.tituloPdf) completados++;
    if (this.cedulaProfesionalPdf) completados++;
    if (this.cvPdf) completados++;

    return Math.round((completados / totalDocumentos) * 100);
  }

  /**
   * Verifica si todos los documentos están subidos
   */
  todosLosDocumentosSubidos(): boolean {
    return !!(
      this.curpPdf &&
      this.actaNacimientoPdf &&
      this.inePdf &&
      this.tituloPdf &&
      this.cedulaProfesionalPdf &&
      this.cvPdf
    );
  }

  /**
   * Obtiene lista de documentos faltantes
   */
  getDocumentosFaltantes(): string[] {
    const faltantes: string[] = [];

    if (!this.curpPdf) faltantes.push('CURP');
    if (!this.actaNacimientoPdf) faltantes.push('Acta de Nacimiento');
    if (!this.inePdf) faltantes.push('INE');
    if (!this.tituloPdf) faltantes.push('Título Profesional');
    if (!this.cedulaProfesionalPdf) faltantes.push('Cédula Profesional');
    if (!this.cvPdf) faltantes.push('Currículum Vitae');

    return faltantes;
  }

  /**
   * Actualiza el porcentaje y el estado de documentos completos
   */
  actualizarEstado(): void {
    this.porcentajeCompletado = this.calcularPorcentaje();
    this.documentosCompletos = this.todosLosDocumentosSubidos();
  }
}