import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Syllabus } from '../syllabuses/entities/sallybus.entity';
import { Subject } from '../teachers/entities/subject.entity';
import { SchoolPeriod } from '../school-periods/entities/school-period.entity';
import { CreateTemarioDto, UpdateTemarioDto, TemarioResponseDto } from './dto/admin-programs.dto';

@Injectable()
export class AdminTemariosService {
  constructor(
    @InjectRepository(Syllabus)
    private syllabusRepository: Repository<Syllabus>,

    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,

    @InjectRepository(SchoolPeriod)
    private periodRepository: Repository<SchoolPeriod>,
  ) {}

  /**
   * Crear temario
   */
  async createSyllabus(data: {
    materiaId: number;
    periodoEscolarId: number;
    nombreArchivo: string;
    nombreOriginal: string;
    rutaArchivo: string;
    tamanoMb: number;
    titulo?: string;
    descripcion?: string;
    subidoPor: number;
  }): Promise<Syllabus> {
    // Verificar que la materia existe
    const materia = await this.subjectRepository.findOne({
      where: { id: data.materiaId },
    });

    if (!materia) {
      throw new NotFoundException(`Materia con ID ${data.materiaId} no encontrada`);
    }

    // Verificar que el periodo existe
    const periodo = await this.periodRepository.findOne({
      where: { id: data.periodoEscolarId },
    });

    if (!periodo) {
      throw new NotFoundException(`Periodo escolar con ID ${data.periodoEscolarId} no encontrado`);
    }

    // Verificar si ya existe un temario para esta materia y periodo
    const existingSyllabus = await this.syllabusRepository.findOne({
      where: {
        materiaId: data.materiaId,
        periodoEscolarId: data.periodoEscolarId,
        estaActivo: true,
      },
    });

    if (existingSyllabus) {
      throw new BadRequestException(
        `Ya existe un temario activo para esta materia en el periodo seleccionado`
      );
    }

    // Crear el temario
    const syllabus = this.syllabusRepository.create({
      materiaId: data.materiaId,
      periodoEscolarId: data.periodoEscolarId,
      nombreArchivo: data.nombreArchivo,
      nombreOriginal: data.nombreOriginal,
      rutaArchivo: data.rutaArchivo,
      tamanoMb: data.tamanoMb,
      titulo: data.titulo || materia.nombre,
      descripcion: data.descripcion,
      subidoPor: data.subidoPor,
      estaActivo: true,
    });

    return this.syllabusRepository.save(syllabus);
  }

  /**
   * Obtener temario de una materia
   */
  async getSyllabusByMateria(materiaId: number): Promise<Syllabus | null> {
    const syllabus = await this.syllabusRepository.findOne({
      where: { materiaId, estaActivo: true },
    });

    return syllabus;
  }

  /**
   * Actualizar temario
   */
  async updateSyllabus(id: number, updateDto: UpdateTemarioDto): Promise<Syllabus> {
    const syllabus = await this.syllabusRepository.findOne({
      where: { id },
    });

    if (!syllabus) {
      throw new NotFoundException(`Temario con ID ${id} no encontrado`);
    }

    // Actualizar campos
    if (updateDto.titulo !== undefined) {
      syllabus.titulo = updateDto.titulo;
    }

    if (updateDto.descripcion !== undefined) {
      syllabus.descripcion = updateDto.descripcion;
    }

    if (updateDto.estaActivo !== undefined) {
      syllabus.estaActivo = updateDto.estaActivo;
    }

    return this.syllabusRepository.save(syllabus);
  }

  /**
   * Eliminar (desactivar) temario
   */
  async deleteSyllabus(id: number): Promise<{ message: string }> {
    const syllabus = await this.syllabusRepository.findOne({
      where: { id },
    });

    if (!syllabus) {
      throw new NotFoundException(`Temario con ID ${id} no encontrado`);
    }

    syllabus.estaActivo = false;
    await this.syllabusRepository.save(syllabus);

    return { message: 'Temario eliminado correctamente' };
  }

  /**
   * Reemplazar archivo PDF de un temario
   */
  async replaceSyllabusFile(
    id: number,
    fileData: {
      nombreArchivo: string;
      nombreOriginal: string;
      rutaArchivo: string;
      tamanoMb: number;
    }
  ): Promise<Syllabus> {
    const syllabus = await this.syllabusRepository.findOne({
      where: { id },
    });

    if (!syllabus) {
      throw new NotFoundException(`Temario con ID ${id} no encontrado`);
    }

    // Actualizar archivo
    syllabus.nombreArchivo = fileData.nombreArchivo;
    syllabus.nombreOriginal = fileData.nombreOriginal;
    syllabus.rutaArchivo = fileData.rutaArchivo;
    syllabus.tamanoMb = fileData.tamanoMb;
    syllabus.fechaSubida = new Date();

    return this.syllabusRepository.save(syllabus);
  }
}