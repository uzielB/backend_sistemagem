import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherDocument, EstatusDocumentos } from './entities/teacher-document.entity';
import { CreateTeacherDocumentDto } from './dto/create-teacher-document.dto';
import { UpdateTeacherDocumentDto } from './dto/update-teacher-document.dto';
import { TeachersService } from '../teachers/teachers.service';

/**
 * Servicio de TeacherDocuments (Documentos de Docentes)
 */
@Injectable()
export class TeacherDocumentsService {
  constructor(
    @InjectRepository(TeacherDocument)
    private readonly teacherDocumentRepository: Repository<TeacherDocument>,
    private readonly teachersService: TeachersService,
  ) {}

  /**
   * Crea un registro de documentos para un docente
   */
  async create(
    createDocumentDto: CreateTeacherDocumentDto,
  ): Promise<TeacherDocument> {
    // Verificar que el docente existe
    await this.teachersService.findOne(createDocumentDto.docenteId);

    // Verificar que no exista ya un registro de documentos
    const existing = await this.teacherDocumentRepository.findOne({
      where: { docenteId: createDocumentDto.docenteId },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe un registro de documentos para este docente',
      );
    }

    // Crear el registro
    const document = this.teacherDocumentRepository.create(createDocumentDto);
    document.actualizarEstado();

    return await this.teacherDocumentRepository.save(document);
  }

  /**
   * Obtiene todos los registros de documentos
   */
  async findAll(estatus?: EstatusDocumentos): Promise<TeacherDocument[]> {
    const where = estatus ? { estatus } : {};

    return await this.teacherDocumentRepository.find({
      where,
      relations: ['docente', 'docente.usuario'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  /**
   * Obtiene registros con documentos incompletos
   */
  async findIncomplete(): Promise<TeacherDocument[]> {
    return await this.teacherDocumentRepository.find({
      where: { documentosCompletos: false },
      relations: ['docente', 'docente.usuario'],
      order: { fechaCreacion: 'ASC' },
    });
  }

  /**
   * Obtiene un registro por ID
   */
  async findOne(id: number): Promise<TeacherDocument> {
    const document = await this.teacherDocumentRepository.findOne({
      where: { id },
      relations: ['docente', 'docente.usuario', 'revisor'],
    });

    if (!document) {
      throw new NotFoundException(
        `No se encontró el registro de documentos con ID: ${id}`,
      );
    }

    return document;
  }

  /**
   * Obtiene los documentos de un docente
   */
  async findByTeacher(docenteId: number): Promise<TeacherDocument | null> {
    // Verificar que el docente existe
    await this.teachersService.findOne(docenteId);

    return await this.teacherDocumentRepository.findOne({
      where: { docenteId },
      relations: ['docente', 'docente.usuario', 'revisor'],
    });
  }

  /**
   * Actualiza los documentos de un docente
   */
  async update(
    id: number,
    updateDocumentDto: UpdateTeacherDocumentDto,
  ): Promise<TeacherDocument> {
    const document = await this.findOne(id);

    Object.assign(document, updateDocumentDto);
    document.actualizarEstado();

    await this.teacherDocumentRepository.save(document);

    // Marcar en el docente que subió documentos si están completos
    if (document.documentosCompletos) {
      await this.teachersService.markDocumentosCompletos(document.docenteId);
    }

    return await this.findOne(id);
  }

  /**
   * Aprueba los documentos de un docente
   */
  async approve(
    id: number,
    revisadoPor: number,
    comentarios?: string,
  ): Promise<TeacherDocument> {
    const document = await this.findOne(id);

    document.estatus = EstatusDocumentos.APROBADO;
    document.revisadoPor = revisadoPor;
    document.fechaRevision = new Date();
    if (comentarios) {
      document.comentarios = comentarios;
    }

    await this.teacherDocumentRepository.save(document);

    // Marcar en el docente que tiene documentos completos
    await this.teachersService.markDocumentosCompletos(document.docenteId);

    return await this.findOne(id);
  }

  /**
   * Rechaza los documentos de un docente
   */
  async reject(
    id: number,
    revisadoPor: number,
    comentarios: string,
  ): Promise<TeacherDocument> {
    const document = await this.findOne(id);

    document.estatus = EstatusDocumentos.RECHAZADO;
    document.revisadoPor = revisadoPor;
    document.fechaRevision = new Date();
    document.comentarios = comentarios;

    return await this.teacherDocumentRepository.save(document);
  }

  /**
   * Elimina un registro de documentos
   */
  async remove(id: number): Promise<boolean> {
    const document = await this.findOne(id);
    await this.teacherDocumentRepository.remove(document);
    return true;
  }

  /**
   * Obtiene estadísticas de documentos
   */
  async getStatistics(): Promise<{
    total: number;
    completos: number;
    incompletos: number;
    aprobados: number;
    rechazados: number;
    pendientes: number;
  }> {
    const documents = await this.teacherDocumentRepository.find();

    const statistics = {
      total: documents.length,
      completos: 0,
      incompletos: 0,
      aprobados: 0,
      rechazados: 0,
      pendientes: 0,
    };

    documents.forEach((doc) => {
      if (doc.documentosCompletos) {
        statistics.completos++;
      } else {
        statistics.incompletos++;
      }

      if (doc.estatus === EstatusDocumentos.APROBADO) {
        statistics.aprobados++;
      } else if (doc.estatus === EstatusDocumentos.RECHAZADO) {
        statistics.rechazados++;
      } else {
        statistics.pendientes++;
      }
    });

    return statistics;
  }
}