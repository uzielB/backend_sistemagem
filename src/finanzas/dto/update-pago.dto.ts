// src/finanzas/dto/update-pago.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePagoDto } from './create-pago.dto';
import { IsOptional, IsDate, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { EstatusPago, MetodoPago } from '../entities/pago.entity';

export class UpdatePagoDto extends PartialType(CreatePagoDto) {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fecha_pago?: Date;

  @IsOptional()
  @IsEnum(MetodoPago)
  metodo_pago?: MetodoPago;

  @IsOptional()
  @IsString()
  referencia_pago?: string;
}