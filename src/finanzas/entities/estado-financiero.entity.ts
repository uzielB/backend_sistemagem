/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Student } from '../../teachers/entities/student.entity';
import { SchoolPeriod } from '../../school-periods/entities/school-period.entity';

/**
 * Entidad EstadoFinanciero
 * Representa el estado financiero de un estudiante en un periodo escolar
 */
@Entity('estados_financieros')
@Index('idx_estados_financieros_estudiante_id', ['estudianteId'])
@Index('idx_estados_financieros_periodo_id', ['periodoEscolarId'])
export class EstadoFinanciero {
  @PrimaryGeneratedColumn()
  id: number;

  // RELACIONES
  @Column({ type: 'integer', name: 'estudiante_id' })
  estudianteId: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Student;

  @Column({ type: 'integer', name: 'periodo_escolar_id' })
  periodoEscolarId: number;

  @ManyToOne(() => SchoolPeriod)
  @JoinColumn({ name: 'periodo_escolar_id' })
  periodoEscolar: SchoolPeriod;

  // CONFIGURACIÓN FINANCIERA
  @Column({ name: 'total_semestre', type: 'decimal', precision: 10, scale: 2 })
  totalSemestre: number;

  @Column({ 
    name: 'porcentaje_beca_aplicado', 
    type: 'decimal', 
    precision: 5, 
    scale: 2, 
    default: 0 
  })
  porcentajeBecaAplicado: number;

  @Column({ name: 'numero_pagos', type: 'int' })
  numeroPagos: number;

  @Column({ name: 'monto_por_pago', type: 'decimal', precision: 10, scale: 2 })
  montoPorPago: number;

  @Column({ name: 'total_descuento', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalDescuento: number;

  // SEGUIMIENTO DE PAGOS
  @Column({ name: 'total_pagado', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPagado: number;

  @Column({ name: 'saldo', type: 'decimal', precision: 10, scale: 2 })
  saldo: number;

  @Column({ name: 'fecha_ultimo_pago', type: 'date', nullable: true })
  fechaUltimoPago: Date;

  // METADATOS
  @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  // COMPUTED PROPERTIES
  get totalConDescuento(): number {
    return Number(this.totalSemestre) - Number(this.totalDescuento);
  }

  get porcentajeAvance(): number {
    const total = this.totalConDescuento;
    if (total === 0) return 0;
    return (Number(this.totalPagado) / total) * 100;
  }

  get tieneBeca(): boolean {
    return Number(this.porcentajeBecaAplicado) > 0;
  }
}