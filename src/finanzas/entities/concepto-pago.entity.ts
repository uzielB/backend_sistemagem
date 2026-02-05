// src/finanzas/entities/concepto-pago.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Pago } from './pago.entity';

@Entity('conceptos_pago')
export class ConceptoPago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  codigo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto_default: number;

  @Column({ type: 'boolean', default: false })
  es_recurrente: boolean;

  @Column({ type: 'int', nullable: true })
  aplica_semestre: number;

  @Column({ type: 'boolean', default: true })
  esta_activo: boolean;

  @CreateDateColumn()
  fecha_creacion: Date;

  @UpdateDateColumn()
  fecha_actualizacion: Date;

  // Relaciones
  @OneToMany(() => Pago, pago => pago.concepto)
  pagos: Pago[];
}