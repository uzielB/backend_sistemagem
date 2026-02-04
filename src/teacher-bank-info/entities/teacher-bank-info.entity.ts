import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Entidad TeacherBankInfo (Datos Bancarios del Docente)
 * Información bancaria para pagos de nómina
 * 
 * @table datos_bancarios_docentes
 */
@Entity('datos_bancarios_docentes')
@Index('idx_datos_bancarios_docente', ['docenteId'])
@Index('idx_datos_bancarios_validado', ['validado'])
export class TeacherBankInfo {
  /**
   * ID único del registro
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
  // INFORMACIÓN BANCARIA
  // ========================

  /**
   * Nombre del beneficiario
   * Debe coincidir con el nombre en la cuenta bancaria
   */
  @Column({ type: 'varchar', length: 255, nullable: false })
  beneficiario: string;

  /**
   * Nombre del banco
   * @example "BBVA", "Banamex", "Santander"
   */
  @Column({ type: 'varchar', length: 100, nullable: false })
  banco: string;

  /**
   * Número de cuenta bancaria
   * @example "1234567890"
   */
  @Column({ type: 'varchar', length: 20, nullable: false, name: 'numero_cuenta' })
  numeroCuenta: string;

  /**
   * Número de tarjeta (opcional)
   * @example "4152 3136 1234 5678"
   */
  @Column({ type: 'varchar', length: 20, nullable: true, name: 'numero_tarjeta' })
  numeroTarjeta: string;

  /**
   * CLABE interbancaria (18 dígitos)
   * Requerido para transferencias bancarias
   * @example "012180001234567890"
   */
  @Column({ type: 'varchar', length: 18, nullable: false, name: 'clabe_interbancaria' })
  clabeInterbancaria: string;

  // ========================
  // VALIDACIÓN
  // ========================

  /**
   * Indica si los datos bancarios fueron validados
   */
  @Column({ type: 'boolean', default: false })
  validado: boolean;

  /**
   * ID del usuario que validó los datos
   */
  @Column({ type: 'integer', nullable: true, name: 'validado_por' })
  validadoPor: number;

  /**
   * Fecha de validación
   */
  @Column({ type: 'timestamp', nullable: true, name: 'fecha_validacion' })
  fechaValidacion: Date;

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
   * Un registro de datos bancarios pertenece a un único docente
   */
  @OneToOne(() => Teacher, { eager: true })
  @JoinColumn({ name: 'docente_id' })
  docente: Teacher;

  /**
   * Relación ManyToOne con User (quien validó)
   */
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'validado_por' })
  validador: User;

  // ========================
  // MÉTODOS
  // ========================

  /**
   * Verifica si los datos están completos
   */
  datosCompletos(): boolean {
    return !!(
      this.beneficiario &&
      this.banco &&
      this.numeroCuenta &&
      this.clabeInterbancaria
    );
  }

  /**
   * Obtiene el número de cuenta enmascarado
   * @returns "****5678"
   */
  getCuentaEnmascarada(): string {
    if (!this.numeroCuenta) return '';
    const ultimos4 = this.numeroCuenta.slice(-4);
    return `****${ultimos4}`;
  }

  /**
   * Obtiene la CLABE enmascarada
   * @returns "012180*****67890"
   */
  getClabeEnmascarada(): string {
    if (!this.clabeInterbancaria || this.clabeInterbancaria.length !== 18) {
      return '';
    }
    const primeros6 = this.clabeInterbancaria.slice(0, 6);
    const ultimos5 = this.clabeInterbancaria.slice(-5);
    return `${primeros6}*****${ultimos5}`;
  }

  /**
   * Obtiene la tarjeta enmascarada
   * @returns "4152 **** **** 5678"
   */
  getTarjetaEnmascarada(): string {
    if (!this.numeroTarjeta) return '';
    const ultimos4 = this.numeroTarjeta.slice(-4);
    const primeros4 = this.numeroTarjeta.slice(0, 4);
    return `${primeros4} **** **** ${ultimos4}`;
  }
}