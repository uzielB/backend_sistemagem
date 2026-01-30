import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherAvailability, EstatusDisponibilidad } from './entities/teacher-availability.entity';
import { CreateTeacherAvailabilityDto } from './dto/create-teacher-availability.dto';
import { UpdateTeacherAvailabilityDto } from './dto/update-teacher-availability.dto';
import { TeachersService } from '../teachers/teachers.service';
import { SchoolPeriodsService } from '../school-periods/school-periods.service';
import { ProgramsService } from '../programs/programs.service';

/**
 * Servicio de TeacherAvailability (Disponibilidad Horaria de Docentes)
 */
@Injectable()
export class TeacherAvailabilityService {
  constructor(
    @InjectRepository(TeacherAvailability)
    private readonly availabilityRepository: Repository<TeacherAvailability>,
    private readonly teachersService: TeachersService,
    private readonly schoolPeriodsService: SchoolPeriodsService,
    private readonly programsService: ProgramsService,
  ) {}

  /**
   * Crea una nueva disponibilidad horaria
   */
  async create(
    createAvailabilityDto: CreateTeacherAvailabilityDto,
  ): Promise<TeacherAvailability> {
    // Verificar que el docente existe
    await this.teachersService.findOne(createAvailabilityDto.docenteId);

    // Verificar que el periodo escolar existe
    await this.schoolPeriodsService.findOne(createAvailabilityDto.periodoEscolarId);

    // Verificar que no exista ya una disponibilidad para ese docente en ese periodo
    const existing = await this.availabilityRepository.findOne({
      where: {
        docenteId: createAvailabilityDto.docenteId,
        periodoEscolarId: createAvailabilityDto.periodoEscolarId,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe una disponibilidad para este docente en el periodo seleccionado`,
      );
    }

    // Validar que los programas existen
    for (const programId of createAvailabilityDto.programasImparte) {
      await this.programsService.findOne(programId);
    }

    // Validar que tenga módulos según los sistemas seleccionados
    if (createAvailabilityDto.sistemasDisponibles.includes('ESCOLARIZADO')) {
      if (
        !createAvailabilityDto.modulosEscolarizado ||
        createAvailabilityDto.modulosEscolarizado.length === 0
      ) {
        throw new BadRequestException(
          'Debe seleccionar al menos un módulo para el sistema ESCOLARIZADO',
        );
      }
    }

    if (createAvailabilityDto.sistemasDisponibles.includes('SABATINO')) {
      if (
        !createAvailabilityDto.modulosSabatino ||
        createAvailabilityDto.modulosSabatino.length === 0
      ) {
        throw new BadRequestException(
          'Debe seleccionar al menos un módulo para el sistema SABATINO',
        );
      }
    }

    // Crear la disponibilidad
    const availability = this.availabilityRepository.create(createAvailabilityDto);
    const saved = await this.availabilityRepository.save(availability);

    // Marcar el formulario del docente como completado
    await this.teachersService.markFormularioCompleto(createAvailabilityDto.docenteId);

    return await this.findOne(saved.id);
  }

  /**
   * Obtiene todas las disponibilidades
   */
  async findAll(
    periodoEscolarId?: number,
    estatus?: EstatusDisponibilidad,
  ): Promise<TeacherAvailability[]> {
    const where: any = {};

    if (periodoEscolarId) {
      where.periodoEscolarId = periodoEscolarId;
    }

    if (estatus) {
      where.estatus = estatus;
    }

    return await this.availabilityRepository.find({
      where,
      relations: ['docente', 'docente.usuario', 'periodoEscolar'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  /**
   * Obtiene disponibilidades pendientes de revisión
   */
  async findPending(): Promise<TeacherAvailability[]> {
    return await this.availabilityRepository.find({
      where: { estatus: EstatusDisponibilidad.PENDIENTE },
      relations: ['docente', 'docente.usuario', 'periodoEscolar'],
      order: { fechaCreacion: 'ASC' },
    });
  }

  /**
   * Obtiene disponibilidades por docente
   */
  async findByTeacher(docenteId: number): Promise<TeacherAvailability[]> {
    // Verificar que el docente existe
    await this.teachersService.findOne(docenteId);

    return await this.availabilityRepository.find({
      where: { docenteId },
      relations: ['periodoEscolar'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  /**
   * Obtiene una disponibilidad por ID
   */
  async findOne(id: number): Promise<TeacherAvailability> {
    const availability = await this.availabilityRepository.findOne({
      where: { id },
      relations: ['docente', 'docente.usuario', 'periodoEscolar', 'revisor'],
    });

    if (!availability) {
      throw new NotFoundException(
        `No se encontró la disponibilidad horaria con ID: ${id}`,
      );
    }

    return availability;
  }

  /**
   * Obtiene la disponibilidad de un docente en un periodo específico
   */
  async findByTeacherAndPeriod(
    docenteId: number,
    periodoEscolarId: number,
  ): Promise<TeacherAvailability | null> {
    return await this.availabilityRepository.findOne({
      where: { docenteId, periodoEscolarId },
      relations: ['docente', 'docente.usuario', 'periodoEscolar'],
    });
  }

  /**
   * Actualiza una disponibilidad horaria
   */
  async update(
    id: number,
    updateAvailabilityDto: UpdateTeacherAvailabilityDto,
  ): Promise<TeacherAvailability> {
    const availability = await this.findOne(id);

    // Validar programas si se están actualizando
    if (updateAvailabilityDto.programasImparte) {
      for (const programId of updateAvailabilityDto.programasImparte) {
        await this.programsService.findOne(programId);
      }
    }

    // Validar módulos según sistemas
    const sistemasDisponibles =
      updateAvailabilityDto.sistemasDisponibles || availability.sistemasDisponibles;

    if (sistemasDisponibles.includes('ESCOLARIZADO')) {
      const modulosEscolarizado =
        updateAvailabilityDto.modulosEscolarizado !== undefined
          ? updateAvailabilityDto.modulosEscolarizado
          : availability.modulosEscolarizado;

      if (!modulosEscolarizado || modulosEscolarizado.length === 0) {
        throw new BadRequestException(
          'Debe seleccionar al menos un módulo para el sistema ESCOLARIZADO',
        );
      }
    }

    if (sistemasDisponibles.includes('SABATINO')) {
      const modulosSabatino =
        updateAvailabilityDto.modulosSabatino !== undefined
          ? updateAvailabilityDto.modulosSabatino
          : availability.modulosSabatino;

      if (!modulosSabatino || modulosSabatino.length === 0) {
        throw new BadRequestException(
          'Debe seleccionar al menos un módulo para el sistema SABATINO',
        );
      }
    }

    Object.assign(availability, updateAvailabilityDto);
    await this.availabilityRepository.save(availability);

    return await this.findOne(id);
  }

  /**
   * Marca una disponibilidad como revisada
   */
  async markAsReviewed(
    id: number,
    revisadoPor: number,
    comentarios?: string,
  ): Promise<TeacherAvailability> {
    const availability = await this.findOne(id);

    availability.estatus = EstatusDisponibilidad.REVISADO;
    availability.revisadoPor = revisadoPor;
    availability.fechaRevision = new Date();
    if (comentarios) {
      availability.comentariosAdmin = comentarios;
    }

    await this.availabilityRepository.save(availability);
    return await this.findOne(id);
  }

  /**
   * Marca una disponibilidad como aprobada
   */
  async markAsApproved(
    id: number,
    revisadoPor: number,
    comentarios?: string,
  ): Promise<TeacherAvailability> {
    const availability = await this.findOne(id);

    availability.estatus = EstatusDisponibilidad.APROBADO;
    availability.revisadoPor = revisadoPor;
    availability.fechaRevision = new Date();
    if (comentarios) {
      availability.comentariosAdmin = comentarios;
    }

    await this.availabilityRepository.save(availability);
    return await this.findOne(id);
  }

  /**
   * Elimina una disponibilidad
   */
  async remove(id: number): Promise<boolean> {
    const availability = await this.findOne(id);
    await this.availabilityRepository.remove(availability);
    return true;
  }

  /**
   * Obtiene estadísticas de disponibilidades
   */
  async getStatistics(): Promise<{
    total: number;
    pendientes: number;
    revisadas: number;
    aprobadas: number;
    porPeriodo: { periodo: string; cantidad: number }[];
  }> {
    const availabilities = await this.availabilityRepository.find({
      relations: ['periodoEscolar'],
    });

    const statistics = {
      total: availabilities.length,
      pendientes: 0,
      revisadas: 0,
      aprobadas: 0,
      porPeriodo: [] as { periodo: string; cantidad: number }[],
    };

    const periodoCount: { [key: string]: number } = {};

    availabilities.forEach((availability) => {
      // Contar por estatus
      if (availability.estatus === EstatusDisponibilidad.PENDIENTE) {
        statistics.pendientes++;
      } else if (availability.estatus === EstatusDisponibilidad.REVISADO) {
        statistics.revisadas++;
      } else if (availability.estatus === EstatusDisponibilidad.APROBADO) {
        statistics.aprobadas++;
      }

      // Contar por periodo
      const periodoNombre = availability.periodoEscolar?.nombre || 'Sin periodo';
      if (!periodoCount[periodoNombre]) {
        periodoCount[periodoNombre] = 0;
      }
      periodoCount[periodoNombre]++;
    });

    statistics.porPeriodo = Object.keys(periodoCount).map((periodo) => ({
      periodo,
      cantidad: periodoCount[periodo],
    }));

    return statistics;
  }
}