import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ConceptoPago } from './concepto-pago.entity';

export enum EstatusPago {
  PENDIENTE = 'PENDIENTE',
  PAGADO = 'PAGADO',
  VENCIDO = 'VENCIDO',
  CANCELADO = 'CANCELADO'
}

export enum MetodoPago {
  EFECTIVO = 'EFECTIVO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  TARJETA = 'TARJETA',
  REFERENCIA = 'REFERENCIA'
}

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  estudiante_id: number;

  @Column({ type: 'int' })
  concepto_id: number;

  @Column({ type: 'int', nullable: true })
  periodo_escolar_id: number;

  // Montos
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto_original: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monto_descuento: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto_final: number;

  // Fechas
  @Column({ type: 'date' })
  fecha_vencimiento: Date;

  @Column({ type: 'date', nullable: true })
  fecha_pago: Date;

  // Estado y método
  @Column({ type: 'varchar', length: 20, default: EstatusPago.PENDIENTE })
  estatus: EstatusPago;

  @Column({ type: 'varchar', length: 50, nullable: true })
  metodo_pago: MetodoPago;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referencia_pago: string;

  // Metadatos
  @Column({ type: 'text', nullable: true })
  comentarios: string;

  @Column({ type: 'int', nullable: true })
  creado_por: number;

  @CreateDateColumn()
  fecha_creacion: Date;

  @UpdateDateColumn()
  fecha_actualizacion: Date;

  // Relación con ConceptoPago (esta sí existe)
  @ManyToOne(() => ConceptoPago, concepto => concepto.pagos, { eager: true })
  @JoinColumn({ name: 'concepto_id' })
  concepto: ConceptoPago;

  // NOTA: Las relaciones con Estudiante y Usuario se agregarán después
  // cuando esas entidades estén disponibles
}