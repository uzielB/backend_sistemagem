// src/finanzas/dto/create-pago.dto.ts
import { IsNotEmpty, IsNumber, IsDate, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EstatusPago } from '../entities/pago.entity';

export class CreatePagoDto {
  @IsNotEmpty()
  @IsNumber()
  estudiante_id: number;

  @IsNotEmpty()
  @IsNumber()
  concepto_id: number;

  @IsOptional()
  @IsNumber()
  periodo_escolar_id?: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  monto_original: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monto_descuento?: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  monto_final: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  fecha_vencimiento: Date;

  @IsOptional()
  @IsEnum(EstatusPago)
  estatus?: EstatusPago;

  @IsOptional()
  @IsString()
  comentarios?: string;
}