// src/finanzas/finanzas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanzasController } from './finanzas.controller';
import { FinanzasService } from './finanzas.service';
import { Pago } from './entities/pago.entity';
import { ConceptoPago } from './entities/concepto-pago.entity';
import { Beca } from './entities/beca.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pago, ConceptoPago, Beca])
  ],
  controllers: [FinanzasController],
  providers: [FinanzasService],
  exports: [FinanzasService]
})
export class FinanzasModule {}