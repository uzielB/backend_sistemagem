import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolPeriod } from './entities/school-period.entity';
import { CreateSchoolPeriodDto } from './dto/create-school-period.dto';
import { UpdateSchoolPeriodDto } from './dto/update-school-period.dto';

/**
 * Servicio de SchoolPeriods (Periodos Escolares)
 */
@Injectable()
export class SchoolPeriodsService {
  constructor(
    @InjectRepository(SchoolPeriod)
    private readonly schoolPeriodRepository: Repository<SchoolPeriod>,
  ) {}

  /**
   * Crea un nuevo periodo escolar
   */
  async create(createSchoolPeriodDto: CreateSchoolPeriodDto): Promise<SchoolPeriod> {
    // Verificar que no exista el código
    const existingCodigo = await this.schoolPeriodRepository.findOne({
      where: { codigo: createSchoolPeriodDto.codigo },
    });

    if (existingCodigo) {
      throw new ConflictException(
        `Ya existe un periodo con el código: ${createSchoolPeriodDto.codigo}`,
      );
    }

    // Verificar que fechaInicio < fechaFin
    if (createSchoolPeriodDto.fechaInicio >= createSchoolPeriodDto.fechaFin) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    // Si se marca como actual, desmarcar otros periodos actuales
    if (createSchoolPeriodDto.esActual) {
      await this.unmarkAllAsCurrentExcept(0);
    }

    const schoolPeriod = this.schoolPeriodRepository.create(createSchoolPeriodDto);
    return await this.schoolPeriodRepository.save(schoolPeriod);
  }

  /**
   * Obtiene todos los periodos escolares
   */
  async findAll(activeOnly = false): Promise<SchoolPeriod[]> {
    const where = activeOnly ? { estaActivo: true } : {};

    return await this.schoolPeriodRepository.find({
      where,
      order: { fechaInicio: 'DESC' },
    });
  }

  /**
   * Obtiene el periodo actual
   */
  async findCurrent(): Promise<SchoolPeriod | null> {
    return await this.schoolPeriodRepository.findOne({
      where: { esActual: true, estaActivo: true },
    });
  }

  /**
   * Obtiene un periodo por ID
   */
  async findOne(id: number): Promise<SchoolPeriod> {
    const schoolPeriod = await this.schoolPeriodRepository.findOne({
      where: { id },
    });

    if (!schoolPeriod) {
      throw new NotFoundException(`No se encontró el periodo escolar con ID: ${id}`);
    }

    return schoolPeriod;
  }

  /**
   * Busca un periodo por su código
   */
  async findByCodigo(codigo: string): Promise<SchoolPeriod> {
    const schoolPeriod = await this.schoolPeriodRepository.findOne({
      where: { codigo },
    });

    if (!schoolPeriod) {
      throw new NotFoundException(
        `No se encontró el periodo escolar con código: ${codigo}`,
      );
    }

    return schoolPeriod;
  }

  /**
   * Actualiza un periodo escolar
   */
  async update(
    id: number,
    updateSchoolPeriodDto: UpdateSchoolPeriodDto,
  ): Promise<SchoolPeriod> {
    const schoolPeriod = await this.findOne(id);

    // Verificar código único
    if (updateSchoolPeriodDto.codigo && updateSchoolPeriodDto.codigo !== schoolPeriod.codigo) {
      const existingCodigo = await this.schoolPeriodRepository.findOne({
        where: { codigo: updateSchoolPeriodDto.codigo },
      });

      if (existingCodigo && existingCodigo.id !== id) {
        throw new ConflictException(
          `Ya existe otro periodo con el código: ${updateSchoolPeriodDto.codigo}`,
        );
      }
    }

    // Verificar fechas
    const fechaInicio = updateSchoolPeriodDto.fechaInicio || schoolPeriod.fechaInicio;
    const fechaFin = updateSchoolPeriodDto.fechaFin || schoolPeriod.fechaFin;

    if (fechaInicio >= fechaFin) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    // Si se marca como actual, desmarcar otros
    if (updateSchoolPeriodDto.esActual === true) {
      await this.unmarkAllAsCurrentExcept(id);
    }

    Object.assign(schoolPeriod, updateSchoolPeriodDto);
    return await this.schoolPeriodRepository.save(schoolPeriod);
  }

  /**
   * Marca un periodo como actual
   */
  async setAsCurrent(id: number): Promise<SchoolPeriod> {
    await this.unmarkAllAsCurrentExcept(id);
    
    const schoolPeriod = await this.findOne(id);
    schoolPeriod.esActual = true;
    return await this.schoolPeriodRepository.save(schoolPeriod);
  }

  /**
   * Desactiva un periodo
   */
  async deactivate(id: number): Promise<SchoolPeriod> {
    const schoolPeriod = await this.findOne(id);
    
    if (schoolPeriod.esActual) {
      throw new BadRequestException(
        'No se puede desactivar el periodo actual. Primero marca otro periodo como actual.',
      );
    }

    schoolPeriod.estaActivo = false;
    return await this.schoolPeriodRepository.save(schoolPeriod);
  }

  /**
   * Reactiva un periodo
   */
  async activate(id: number): Promise<SchoolPeriod> {
    const schoolPeriod = await this.findOne(id);
    schoolPeriod.estaActivo = true;
    return await this.schoolPeriodRepository.save(schoolPeriod);
  }

  /**
   * Elimina un periodo
   */
  async remove(id: number): Promise<boolean> {
    const schoolPeriod = await this.findOne(id);
    
    if (schoolPeriod.esActual) {
      throw new BadRequestException(
        'No se puede eliminar el periodo actual.',
      );
    }

    await this.schoolPeriodRepository.remove(schoolPeriod);
    return true;
  }

  /**
   * Desmarca todos los periodos como actuales excepto uno
   */
  private async unmarkAllAsCurrentExcept(exceptId: number): Promise<void> {
    await this.schoolPeriodRepository
      .createQueryBuilder()
      .update(SchoolPeriod)
      .set({ esActual: false })
      .where('id != :exceptId', { exceptId })
      .execute();
  }
}