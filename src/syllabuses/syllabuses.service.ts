import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Syllabus } from './entities/sallybus.entity';
import { LessonPlan, LessonPlanStatus } from './entities/lesson-plan.entity';
import { CreateSyllabusDto } from './dto/create-syllabus.dto';
import { CreateLessonPlanDto } from './dto/create-lesson-plan.dto';
import { ReviewLessonPlanDto } from './dto/review-lesson-plan.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SyllabusesService {
  constructor(
    @InjectRepository(Syllabus)
    private syllabusRepository: Repository<Syllabus>,
    
    @InjectRepository(LessonPlan)
    private lessonPlanRepository: Repository<LessonPlan>,
  ) {}

  // ============================================
  // SYLLABUSES (TEMARIOS) - SuperAdmin/Admin
  // ============================================

  /**
   * Subir temario
   */
  async uploadSyllabus(
    file: Express.Multer.File,
    createSyllabusDto: CreateSyllabusDto,
    userId: number
  ): Promise<Syllabus> {
    // Verificar que no exista temario para esta materia/periodo
    const existing = await this.syllabusRepository.findOne({
      where: {
        materiaId: createSyllabusDto.materiaId,
        periodoEscolarId: createSyllabusDto.periodoEscolarId,
        estaActivo: true
      }
    });

    if (existing) {
      // Eliminar archivo subido
      fs.unlinkSync(file.path);
      throw new BadRequestException(
        'Ya existe un temario activo para esta materia en este periodo'
      );
    }

    const syllabus = this.syllabusRepository.create({
      ...createSyllabusDto,
      nombreArchivo: file.filename,
      nombreOriginal: file.originalname,
      rutaArchivo: file.path,
      tamanoMb: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
      subidoPor: userId
    });

    return this.syllabusRepository.save(syllabus);
  }

  /**
   * Listar todos los temarios
   */
  async findAllSyllabuses(): Promise<Syllabus[]> {
    return this.syllabusRepository.find({
      relations: ['uploadedBy'],
      where: { estaActivo: true },
      order: { fechaSubida: 'DESC' }
    });
  }

  /**
   * Obtener un temario por ID
   */
  async findOneSyllabus(id: number): Promise<Syllabus> {
    const syllabus = await this.syllabusRepository.findOne({
      where: { id, estaActivo: true },
      relations: ['uploadedBy']
    });

    if (!syllabus) {
      throw new NotFoundException('Temario no encontrado');
    }

    return syllabus;
  }

  /**
   * Obtener temarios de las materias asignadas a un docente
   */
async findSyllabusesForTeacher(teacherId: number): Promise<Syllabus[]> {
  const syllabuses = await this.syllabusRepository
    .createQueryBuilder('syllabus')
    .leftJoinAndSelect('syllabus.uploadedBy', 'uploader')
    .leftJoinAndSelect('syllabus.subject', 'subject')      
    .leftJoinAndSelect('subject.programa', 'programa')     
    .where('syllabus.estaActivo = :activo', { activo: true })
    .andWhere(`
      syllabus.materiaId IN (
        SELECT DISTINCT materia_id 
        FROM asignaciones_docentes 
        WHERE docente_id = :teacherId 
        AND esta_activo = true
      )
    `, { teacherId })
    .orderBy('syllabus.fechaSubida', 'DESC')
    .getMany();

  return syllabuses;
}

  /**
   * Eliminar temario (soft delete)
   */
  async deleteSyllabus(id: number): Promise<void> {
    const syllabus = await this.syllabusRepository.findOne({
      where: { id }
    });

    if (!syllabus) {
      throw new NotFoundException('Temario no encontrado');
    }

    // Verificar si tiene planeaciones asociadas
    const lessonPlansCount = await this.lessonPlanRepository.count({
      where: { temarioId: id }
    });

    if (lessonPlansCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar. Existen ${lessonPlansCount} planeaciones basadas en este temario.`
      );
    }

    // Soft delete
    syllabus.estaActivo = false;
    await this.syllabusRepository.save(syllabus);
  }

  // ============================================
  // LESSON PLANS (PLANEACIONES) - Docentes
  // ============================================

  /**
   * Subir planeación
   */
  async uploadLessonPlan(
    file: Express.Multer.File,
    createLessonPlanDto: CreateLessonPlanDto,
    teacherId: number
  ): Promise<LessonPlan> {
    // Verificar que el temario exista
    const syllabus = await this.syllabusRepository.findOne({
      where: { id: createLessonPlanDto.temarioId, estaActivo: true }
    });

    if (!syllabus) {
      fs.unlinkSync(file.path);
      throw new NotFoundException('Temario no encontrado');
    }

    // Buscar si ya tiene planeación para esta asignación
    const existingPlan = await this.lessonPlanRepository.findOne({
      where: {
        docenteId: teacherId,
        asignacionId: createLessonPlanDto.asignacionId
      },
      order: { version: 'DESC' }
    });

    const version = existingPlan ? existingPlan.version + 1 : 1;

    const lessonPlan = this.lessonPlanRepository.create({
      ...createLessonPlanDto,
      docenteId: teacherId,
      nombreArchivo: file.filename,
      nombreOriginal: file.originalname,
      rutaArchivo: file.path,
      tamanoMb: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
      version,
      planeacionAnteriorId: existingPlan?.id || null,
      estatus: LessonPlanStatus.PENDING_REVIEW
    });

    return this.lessonPlanRepository.save(lessonPlan);
  }

  /**
   * Listar planeaciones de un docente
   */
  async findLessonPlansByTeacher(teacherId: number): Promise<LessonPlan[]> {
    return this.lessonPlanRepository.find({
      where: { docenteId: teacherId },
      relations: ['syllabus', 'syllabus.uploadedBy', 'teacher', 'reviewer'],
      order: { fechaSubida: 'DESC' }
    });
  }

  /**
   * Listar TODAS las planeaciones (Admin)
   */
  async findAllLessonPlans(): Promise<LessonPlan[]> {
    return this.lessonPlanRepository.find({
      relations: ['syllabus', 'teacher', 'teacher.user', 'reviewer'],
      order: { fechaSubida: 'DESC' }
    });
  }

  /**
   * Obtener una planeación por ID
   */
  async findOneLessonPlan(id: number): Promise<LessonPlan> {
    const lessonPlan = await this.lessonPlanRepository.findOne({
      where: { id },
      relations: ['syllabus', 'teacher', 'teacher.user', 'reviewer']
    });

    if (!lessonPlan) {
      throw new NotFoundException('Planeación no encontrada');
    }

    return lessonPlan;
  }

  /**
   * Revisar planeación (Aprobar/Rechazar)
   */
  async reviewLessonPlan(
    id: number,
    reviewDto: ReviewLessonPlanDto,
    userId: number
  ): Promise<LessonPlan> {
    const lessonPlan = await this.lessonPlanRepository.findOne({
      where: { id }
    });

    if (!lessonPlan) {
      throw new NotFoundException('Planeación no encontrada');
    }

    lessonPlan.estatus = reviewDto.estatus;
    lessonPlan.observaciones = reviewDto.observaciones || null;
    lessonPlan.revisadoPor = userId;
    lessonPlan.fechaRevision = new Date();

    return this.lessonPlanRepository.save(lessonPlan);
  }

/**
 * Obtener temarios base de una materia específica
 */
async getSyllabusesByMateria(
  materiaId: number,
  periodoEscolarId?: number,
): Promise<Syllabus[]> {
  const where: any = {
    materiaId,
    estaActivo: true,
  };

  if (periodoEscolarId) {
    where.periodoEscolarId = periodoEscolarId;
  }

  const syllabuses = await this.syllabusRepository.find({
    where,
    relations: ['subject', 'subject.programa', 'uploadedBy'],
    order: {
      fechaSubida: 'DESC',
    },
  });

  return syllabuses;
}




  // ============================================
  // ARCHIVOS (Descarga)
  // ============================================

  /**
   * Descargar archivo (temario o planeación)
   */
  async downloadFile(filePath: string): Promise<Buffer> {
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Archivo no encontrado en el servidor');
    }

    try {
      return await fs.promises.readFile(filePath);
    } catch (error) {
      throw new BadRequestException('Error al leer el archivo');
    }
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  /**
   * Obtener estadísticas de planeaciones por estatus
   */
  async getLessonPlanStats(): Promise<any> {
    const stats = await this.lessonPlanRepository
      .createQueryBuilder('plan')
      .select('plan.estatus', 'estatus')
      .addSelect('COUNT(*)', 'count')
      .groupBy('plan.estatus')
      .getRawMany();

    const total = await this.lessonPlanRepository.count();

    return {
      total,
      byStatus: stats
    };
  }
}