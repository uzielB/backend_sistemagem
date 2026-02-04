import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolPeriodsService } from './school-periods.service';
import { SchoolPeriodsController } from './school-periods.controller';
import { SchoolPeriod } from './entities/school-period.entity';

/**
 * Módulo de SchoolPeriods (Periodos Escolares)
 */
@Module({
  imports: [TypeOrmModule.forFeature([SchoolPeriod])],
  controllers: [SchoolPeriodsController],
  providers: [SchoolPeriodsService],
  exports: [SchoolPeriodsService, TypeOrmModule],
})
export class SchoolPeriodsModule {}
