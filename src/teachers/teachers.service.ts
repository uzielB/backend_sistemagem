import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from '../teachers/entities/teacher.entity';
import { CreateTeacherDto } from '../teachers/dto/create-teacher.dto';
import { UpdateTeacherDto } from '../teachers/dto/update-teacher.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/enums/role.enum';

/**
 * Servicio de Teachers (Docentes)
 * Maneja toda la lógica de negocio relacionada con docentes
 */
@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Crea un nuevo perfil de docente
   * 
   * @param createTeacherDto - Datos del docente a crear
   * @returns Docente creado con su usuario relacionado
   * @throws ConflictException si el número de empleado ya existe
   * @throws BadRequestException si el usuario no es DOCENTE o ya tiene perfil
   */
  async create(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    // Verificar que el usuario existe y es DOCENTE
    const user = await this.usersService.findOne(createTeacherDto.usuarioId);

    if (user.rol !== UserRole.DOCENTE) {
      throw new BadRequestException(
        `El usuario con ID ${createTeacherDto.usuarioId} no tiene rol DOCENTE`,
      );
    }

    // Verificar que el usuario no tenga ya un perfil de docente
    const existingTeacher = await this.teacherRepository.findOne({
      where: { usuarioId: createTeacherDto.usuarioId },
    });

    if (existingTeacher) {
      throw new ConflictException(
        `El usuario con ID ${createTeacherDto.usuarioId} ya tiene un perfil de docente`,
      );
    }

    // Verificar que el número de empleado no exista
    const existingEmpleado = await this.teacherRepository.findOne({
      where: { numeroEmpleado: createTeacherDto.numeroEmpleado },
    });

    if (existingEmpleado) {
      throw new ConflictException(
        `Ya existe un docente con el número de empleado: ${createTeacherDto.numeroEmpleado}`,
      );
    }

    // Crear el docente
    const newTeacher = this.teacherRepository.create(createTeacherDto);

    // Guardar en la base de datos
    const savedTeacher = await this.teacherRepository.save(newTeacher);

    // Retornar con la relación del usuario cargada
    return await this.findOne(savedTeacher.id);
  }

  /**
   * Obtiene todos los docentes del sistema
   * Incluye información del usuario relacionado
   * 
   * @param activeOnly - Si true, solo retorna docentes activos
   * @returns Lista de docentes
   */
  async findAll(activeOnly = false): Promise<Teacher[]> {
    const where = activeOnly ? { estaActivo: true } : {};

    return await this.teacherRepository.find({
      where,
      relations: ['usuario'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  /**
   * Obtiene un docente por su ID
   * Incluye información del usuario relacionado
   * 
   * @param id - ID del docente
   * @returns Docente encontrado
   * @throws NotFoundException si no existe el docente
   */
  async findOne(id: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!teacher) {
      throw new NotFoundException(`No se encontró el docente con ID: ${id}`);
    }

    return teacher;
  }

  /**
   * Busca un docente por el ID de su usuario
   * 
   * @param usuarioId - ID del usuario
   * @returns Docente encontrado
   * @throws NotFoundException si no existe el docente
   */
  async findByUserId(usuarioId: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { usuarioId },
      relations: ['usuario'],
    });

    if (!teacher) {
      throw new NotFoundException(
        `No se encontró un docente asociado al usuario con ID: ${usuarioId}`,
      );
    }

    return teacher;
  }

  /**
   * Busca un docente por su número de empleado
   * 
   * @param numeroEmpleado - Número de empleado
   * @returns Docente encontrado
   * @throws NotFoundException si no existe el docente
   */
  async findByNumeroEmpleado(numeroEmpleado: string): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { numeroEmpleado },
      relations: ['usuario'],
    });

    if (!teacher) {
      throw new NotFoundException(
        `No se encontró el docente con número de empleado: ${numeroEmpleado}`,
      );
    }

    return teacher;
  }

  /**
   * Actualiza los datos de un docente
   * 
   * @param id - ID del docente a actualizar
   * @param updateTeacherDto - Datos a actualizar
   * @returns Docente actualizado
   * @throws NotFoundException si no existe el docente
   * @throws ConflictException si el nuevo número de empleado ya existe
   */
  async update(id: number, updateTeacherDto: UpdateTeacherDto): Promise<Teacher> {
    // Verificar que el docente existe
    const teacher = await this.findOne(id);

    // Si se está actualizando el número de empleado, verificar que no exista
    if (
      updateTeacherDto.numeroEmpleado &&
      updateTeacherDto.numeroEmpleado !== teacher.numeroEmpleado
    ) {
      const existingEmpleado = await this.teacherRepository.findOne({
        where: { numeroEmpleado: updateTeacherDto.numeroEmpleado },
      });

      if (existingEmpleado && existingEmpleado.id !== id) {
        throw new ConflictException(
          `Ya existe otro docente con el número de empleado: ${updateTeacherDto.numeroEmpleado}`,
        );
      }
    }

    // Actualizar los campos
    Object.assign(teacher, updateTeacherDto);

    // Guardar cambios
    await this.teacherRepository.save(teacher);

    // Retornar con relaciones actualizadas
    return await this.findOne(id);
  }

  /**
   * Desactiva un docente (baja lógica)
   * El docente no se elimina, solo se marca como inactivo
   * 
   * @param id - ID del docente a desactivar
   * @returns Docente desactivado
   * @throws NotFoundException si no existe el docente
   */
  async deactivate(id: number): Promise<Teacher> {
    const teacher = await this.findOne(id);

    teacher.estaActivo = false;
    await this.teacherRepository.save(teacher);

    return teacher;
  }

  /**
   * Reactiva un docente previamente desactivado
   * 
   * @param id - ID del docente a reactivar
   * @returns Docente reactivado
   * @throws NotFoundException si no existe el docente
   */
  async activate(id: number): Promise<Teacher> {
    const teacher = await this.findOne(id);

    teacher.estaActivo = true;
    await this.teacherRepository.save(teacher);

    return teacher;
  }

  /**
   * Elimina permanentemente un docente (baja física)
   * PRECAUCIÓN: Esta operación no se puede deshacer
   * 
   * @param id - ID del docente a eliminar
   * @returns true si la operación fue exitosa
   * @throws NotFoundException si no existe el docente
   */
  async remove(id: number): Promise<boolean> {
    const teacher = await this.findOne(id);

    await this.teacherRepository.remove(teacher);
    return true;
  }

  /**
   * Obtiene estadísticas de docentes
   * 
   * @returns Objeto con estadísticas generales
   */
  async getStatistics(): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    conFormularioCompleto: number;
    conDocumentosCompletos: number;
    conDatosBancarios: number;
    perfilesCompletos: number;
  }> {
    const teachers = await this.teacherRepository.find();

    const statistics = {
      total: teachers.length,
      activos: 0,
      inactivos: 0,
      conFormularioCompleto: 0,
      conDocumentosCompletos: 0,
      conDatosBancarios: 0,
      perfilesCompletos: 0,
    };

    teachers.forEach((teacher) => {
      if (teacher.estaActivo) {
        statistics.activos++;
      } else {
        statistics.inactivos++;
      }

      if (teacher.haCompletadoFormulario) {
        statistics.conFormularioCompleto++;
      }

      if (teacher.haSubidoDocumentos) {
        statistics.conDocumentosCompletos++;
      }

      if (teacher.haProporcionadoDatosBancarios) {
        statistics.conDatosBancarios++;
      }

      if (teacher.perfilCompleto()) {
        statistics.perfilesCompletos++;
      }
    });

    return statistics;
  }

  /**
   * Obtiene docentes con perfiles incompletos
   * 
   * @returns Lista de docentes que no han completado su perfil
   */
  async findIncompleteProfiles(): Promise<Teacher[]> {
    const teachers = await this.teacherRepository.find({
      where: { estaActivo: true },
      relations: ['usuario'],
    });

    // Filtrar solo los que NO tienen perfil completo
    return teachers.filter((teacher) => !teacher.perfilCompleto());
  }

  /**
   * Marca el formulario de disponibilidad como completado
   * 
   * @param id - ID del docente
   * @returns Docente actualizado
   */
  async markFormularioCompleto(id: number): Promise<Teacher> {
    const teacher = await this.findOne(id);

    teacher.haCompletadoFormulario = true;
    await this.teacherRepository.save(teacher);

    return teacher;
  }

  /**
   * Marca los documentos como completos
   * 
   * @param id - ID del docente
   * @returns Docente actualizado
   */
  async markDocumentosCompletos(id: number): Promise<Teacher> {
    const teacher = await this.findOne(id);

    teacher.haSubidoDocumentos = true;
    await this.teacherRepository.save(teacher);

    return teacher;
  }

  /**
   * Marca los datos bancarios como proporcionados
   * 
   * @param id - ID del docente
   * @returns Docente actualizado
   */
  async markDatosBancariosCompletos(id: number): Promise<Teacher> {
    const teacher = await this.findOne(id);

    teacher.haProporcionadoDatosBancarios = true;
    await this.teacherRepository.save(teacher);

    return teacher;
  }
}
