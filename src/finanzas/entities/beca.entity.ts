import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TipoBeca {
  ACADEMICA = 'ACADEMICA',
  DEPORTIVA = 'DEPORTIVA',
  CULTURAL = 'CULTURAL',
  SOCIOECONOMICA = 'SOCIOECONOMICA'
}

export enum EstatusBeca {
  PROPUESTA = 'PROPUESTA',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
  ACTIVA = 'ACTIVA',
  EXPIRADA = 'EXPIRADA'
}

@Entity('becas')
export class Beca {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  estudiante_id: number;

  @Column({ type: 'varchar', length: 50 })
  tipo_beca: TipoBeca;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  porcentaje: number;

  @Column({ type: 'date' })
  fecha_inicio: Date;

  @Column({ type: 'date' })
  fecha_fin: Date;

  @Column({ type: 'int', nullable: true })
  periodo_aplica: number;

  @Column({ type: 'varchar', length: 20, default: EstatusBeca.PROPUESTA })
  estatus: EstatusBeca;

  @Column({ type: 'text' })
  justificacion: string;

  @Column({ type: 'int', nullable: true })
  propuesta_por: number;

  @Column({ type: 'int', nullable: true })
  aprobada_por: number;

  @Column({ type: 'timestamp', nullable: true })
  fecha_aprobacion: Date;

  @Column({ type: 'text', nullable: true })
  motivo_rechazo: string;

  @CreateDateColumn()
  fecha_creacion: Date;

  @UpdateDateColumn()
  fecha_actualizacion: Date;

  // NOTA: Las relaciones con Estudiante y Usuario se agregarán después
  // cuando esas entidades estén disponibles
}