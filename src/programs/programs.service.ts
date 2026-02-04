import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program, Modalidad } from './entities/program.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

/**
 * Servicio de Programs (Programas Académicos)
 * Catálogo de carreras/licenciaturas
 */
@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
  ) {}

  /**
   * Crea un nuevo programa académico
   */
  async create(createProgramDto: CreateProgramDto): Promise<Program> {
    // Verificar que no exista el código
    const existingCodigo = await this.programRepository.findOne({
      where: { codigo: createProgramDto.codigo },
    });

    if (existingCodigo) {
      throw new ConflictException(
        `Ya existe un programa con el código: ${createProgramDto.codigo}`,
      );
    }

    const program = this.programRepository.create(createProgramDto);
    return await this.programRepository.save(program);
  }

  /**
   * Obtiene todos los programas
   */
  async findAll(modalidad?: Modalidad, activeOnly = false): Promise<Program[]> {
    const where: any = {};

    if (modalidad) {
      where.modalidad = modalidad;
    }

    if (activeOnly) {
      where.estaActivo = true;
    }

    return await this.programRepository.find({
      where,
      order: { nombre: 'ASC' },
    });
  }

  /**
   * Obtiene programas por modalidad
   */
  async findByModalidad(modalidad: Modalidad): Promise<Program[]> {
    return await this.programRepository.find({
      where: { modalidad, estaActivo: true },
      order: { nombre: 'ASC' },
    });
  }

  /**
   * Obtiene un programa por ID
   */
  async findOne(id: number): Promise<Program> {
    const program = await this.programRepository.findOne({
      where: { id },
    });

    if (!program) {
      throw new NotFoundException(`No se encontró el programa con ID: ${id}`);
    }

    return program;
  }

  /**
   * Busca un programa por su código
   */
  async findByCodigo(codigo: string): Promise<Program> {
    const program = await this.programRepository.findOne({
      where: { codigo: codigo.toUpperCase() },
    });

    if (!program) {
      throw new NotFoundException(
        `No se encontró el programa con código: ${codigo}`,
      );
    }

    return program;
  }

  /**
   * Actualiza un programa académico
   */
  async update(id: number, updateProgramDto: UpdateProgramDto): Promise<Program> {
    const program = await this.findOne(id);

    // Si se está actualizando el código, verificar que no exista
    if (updateProgramDto.codigo && updateProgramDto.codigo !== program.codigo) {
      const existingCodigo = await this.programRepository.findOne({
        where: { codigo: updateProgramDto.codigo },
      });

      if (existingCodigo && existingCodigo.id !== id) {
        throw new ConflictException(
          `Ya existe otro programa con el código: ${updateProgramDto.codigo}`,
        );
      }
    }

    Object.assign(program, updateProgramDto);
    return await this.programRepository.save(program);
  }

  /**
   * Desactiva un programa
   */
  async deactivate(id: number): Promise<Program> {
    const program = await this.findOne(id);
    program.estaActivo = false;
    return await this.programRepository.save(program);
  }

  /**
   * Reactiva un programa
   */
  async activate(id: number): Promise<Program> {
    const program = await this.findOne(id);
    program.estaActivo = true;
    return await this.programRepository.save(program);
  }

  /**
   * Elimina un programa
   */
  async remove(id: number): Promise<boolean> {
    const program = await this.findOne(id);
    await this.programRepository.remove(program);
    return true;
  }

  /**
   * Obtiene estadísticas de programas
   */
  async getStatistics(): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    porModalidad: { modalidad: string; cantidad: number }[];
  }> {
    const programs = await this.programRepository.find();

    const statistics = {
      total: programs.length,
      activos: 0,
      inactivos: 0,
      porModalidad: [] as { modalidad: string; cantidad: number }[],
    };

    const modalidadCount: { [key: string]: number } = {};

    programs.forEach((program) => {
      if (program.estaActivo) {
        statistics.activos++;
      } else {
        statistics.inactivos++;
      }

      if (!modalidadCount[program.modalidad]) {
        modalidadCount[program.modalidad] = 0;
      }
      modalidadCount[program.modalidad]++;
    });

    statistics.porModalidad = Object.keys(modalidadCount).map((modalidad) => ({
      modalidad,
      cantidad: modalidadCount[modalidad],
    }));

    return statistics;
  }
}