/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Student } from '../../teachers/entities/student.entity';
import { SchoolPeriod } from '../../school-periods/entities/school-period.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Entidad Pago
 * Representa un pago parcial o único de un estudiante
 */
@Entity('pagos')
@Index('idx_pagos_estudiante_id', ['estudianteId'])
@Index('idx_pagos_periodo_id', ['periodoEscolarId'])
@Index('idx_pagos_estatus', ['estatus'])
@Index('idx_pagos_fecha_vencimiento', ['fechaVencimiento'])
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  // RELACIONES
  @Column({ type: 'integer', name: 'estudiante_id' })
  estudianteId: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Student;

  @Column({ type: 'integer', name: 'concepto_id', nullable: true })
  conceptoId: number;

  @Column({ type: 'integer', name: 'periodo_escolar_id' })
  periodoEscolarId: number;

  @ManyToOne(() => SchoolPeriod)
  @JoinColumn({ name: 'periodo_escolar_id' })
  periodoEscolar: SchoolPeriod;

  @Column({ type: 'integer', name: 'creado_por' })
  creadoPor: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creado_por' })
  creadoPorUsuario: User;

  // INFORMACIÓN DEL PAGO
  @Column({ name: 'numero_parcialidad', type: 'int' })
  numeroParcialidad: number;

  @Column({ name: 'monto_original', type: 'decimal', precision: 10, scale: 2 })
  montoOriginal: number;

  @Column({ name: 'monto_descuento', type: 'decimal', precision: 10, scale: 2, default: 0 })
  montoDescuento: number;

  @Column({ name: 'monto_final', type: 'decimal', precision: 10, scale: 2 })
  montoFinal: number;

  // FECHAS
  @Column({ name: 'fecha_vencimiento', type: 'date' })
  fechaVencimiento: Date;

  @Column({ name: 'fecha_pago', type: 'date', nullable: true })
  fechaPago: Date;

  // ESTATUS Y MÉTODO
  @Column({ type: 'varchar', length: 20, default: 'PENDIENTE' })
  estatus: string;

  @Column({ name: 'metodo_pago', type: 'varchar', length: 50, nullable: true })
  metodoPago: string;

  // METADATOS
  @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion' })
  fechaCreacion: Date;

  // COMPUTED PROPERTIES
  get estaVencido(): boolean {
    if (this.estatus === 'PAGADO') return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const vencimiento = new Date(this.fechaVencimiento);
    vencimiento.setHours(0, 0, 0, 0);
    return vencimiento < hoy;
  }

  get diasParaVencer(): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const vencimiento = new Date(this.fechaVencimiento);
    vencimiento.setHours(0, 0, 0, 0);
    const diff = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  get proximoAVencer(): boolean {
    return this.diasParaVencer > 0 && this.diasParaVencer <= 7;
  }
}