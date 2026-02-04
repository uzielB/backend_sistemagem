import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramsService } from './programs.service';
import { ProgramsController } from './programs.controller';
import { Program } from './entities/program.entity';

/**
 * Módulo de Programs (Programas Académicos)
 * Catálogo de carreras/licenciaturas
 */
@Module({
  imports: [TypeOrmModule.forFeature([Program])],
  controllers: [ProgramsController],
  providers: [ProgramsService],
  exports: [ProgramsService, TypeOrmModule],
})
export class ProgramsModule {}
