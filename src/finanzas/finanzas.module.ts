/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanzasService } from './finanzas.service';
import { FinanzasController } from './finanzas.controller';
import { EstadoFinanciero } from './entities/estado-financiero.entity';
import { Pago } from './entities/pago.entity';

/**
 * Módulo de Finanzas
 * Gestiona todo lo relacionado con pagos y becas de estudiantes
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      EstadoFinanciero,
      Pago
    ])
  ],
  controllers: [FinanzasController],
  providers: [FinanzasService],
  exports: [FinanzasService] // Exportar para usar en otros módulos
})
export class FinanzasModule {}