import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduleModule, Sistema } from './entities/schedule-module.entity';
import { CreateScheduleModuleDto } from './dto/create-schedule-module.dto';
import { UpdateScheduleModuleDto } from './dto/update-schedule-module.dto';

/**
 * Servicio de ScheduleModules (Módulos Horarios)
 * Catálogo de módulos horarios del sistema
 */
@Injectable()
export class ScheduleModulesService {
  constructor(
    @InjectRepository(ScheduleModule)
    private readonly scheduleModuleRepository: Repository<ScheduleModule>,
  ) {}

  /**
   * Crea un nuevo módulo horario
   */
  async create(createScheduleModuleDto: CreateScheduleModuleDto): Promise<ScheduleModule> {
    // Verificar que no exista el mismo sistema + número de módulo
    const existing = await this.scheduleModuleRepository.findOne({
      where: {
        sistema: createScheduleModuleDto.sistema,
        numeroModulo: createScheduleModuleDto.numeroModulo,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe el módulo ${createScheduleModuleDto.numeroModulo} para el sistema ${createScheduleModuleDto.sistema}`,
      );
    }

    const scheduleModule = this.scheduleModuleRepository.create(createScheduleModuleDto);
    return await this.scheduleModuleRepository.save(scheduleModule);
  }

  /**
   * Obtiene todos los módulos horarios
   */
  async findAll(sistema?: Sistema, activeOnly = false): Promise<ScheduleModule[]> {
    const where: any = {};

    if (sistema) {
      where.sistema = sistema;
    }

    if (activeOnly) {
      where.estaActivo = true;
    }

    return await this.scheduleModuleRepository.find({
      where,
      order: {
        sistema: 'ASC',
        numeroModulo: 'ASC',
      },
    });
  }

  /**
   * Obtiene módulos por sistema
   */
  async findBySistema(sistema: Sistema): Promise<ScheduleModule[]> {
    return await this.scheduleModuleRepository.find({
      where: { sistema, estaActivo: true },
      order: { numeroModulo: 'ASC' },
    });
  }

  /**
   * Obtiene un módulo por ID
   */
  async findOne(id: number): Promise<ScheduleModule> {
    const scheduleModule = await this.scheduleModuleRepository.findOne({
      where: { id },
    });

    if (!scheduleModule) {
      throw new NotFoundException(`No se encontró el módulo horario con ID: ${id}`);
    }

    return scheduleModule;
  }

  /**
   * Actualiza un módulo horario
   */
  async update(
    id: number,
    updateScheduleModuleDto: UpdateScheduleModuleDto,
  ): Promise<ScheduleModule> {
    const scheduleModule = await this.findOne(id);

    // Si se está actualizando sistema o número, verificar que no exista
    if (
      updateScheduleModuleDto.sistema ||
      updateScheduleModuleDto.numeroModulo
    ) {
      const existing = await this.scheduleModuleRepository.findOne({
        where: {
          sistema: updateScheduleModuleDto.sistema || scheduleModule.sistema,
          numeroModulo: updateScheduleModuleDto.numeroModulo || scheduleModule.numeroModulo,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ya existe otro módulo con ese sistema y número`,
        );
      }
    }

    Object.assign(scheduleModule, updateScheduleModuleDto);
    return await this.scheduleModuleRepository.save(scheduleModule);
  }

  /**
   * Desactiva un módulo horario
   */
  async deactivate(id: number): Promise<ScheduleModule> {
    const scheduleModule = await this.findOne(id);
    scheduleModule.estaActivo = false;
    return await this.scheduleModuleRepository.save(scheduleModule);
  }

  /**
   * Reactiva un módulo horario
   */
  async activate(id: number): Promise<ScheduleModule> {
    const scheduleModule = await this.findOne(id);
    scheduleModule.estaActivo = true;
    return await this.scheduleModuleRepository.save(scheduleModule);
  }

  /**
   * Elimina un módulo horario
   */
  async remove(id: number): Promise<boolean> {
    const scheduleModule = await this.findOne(id);
    await this.scheduleModuleRepository.remove(scheduleModule);
    return true;
  }
}