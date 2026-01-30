import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModulesService } from './schedule-modules.service';
import { ScheduleModulesController } from './schedule-modules.controller';
import { ScheduleModule } from './entities/schedule-module.entity';

/**
 * Módulo de ScheduleModules (Módulos Horarios)
 * Catálogo de módulos horarios del sistema
 */
@Module({
  imports: [TypeOrmModule.forFeature([ScheduleModule])],
  controllers: [ScheduleModulesController],
  providers: [ScheduleModulesService],
  exports: [ScheduleModulesService, TypeOrmModule],
})
export class ScheduleModulesModule {}