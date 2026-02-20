import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from '../teachers/entities/subject.entity';
import { ArchivoTemarioBase } from './entities/archivo-temario-base.entity';
import { Program } from '../programs/entities/program.entity';

export interface MateriaCreationResult {
  materiaId: number;
  materiaNombre: string;
  materiaCodigo: string;
  archivoId: number;
  created: boolean;
  reactivated: boolean;
}

export interface BatchUploadResult {
  success: MateriaCreationResult[];
  errors: {
    filename: string;
    error: string;
  }[];
  total: number;
  created: number;
  existing: number;
  reactivated: number;
  failed: number;
}

@Injectable()
export class AdminMateriasMasivasService {
  constructor(
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,

    @InjectRepository(ArchivoTemarioBase)
    private archivoTemarioBaseRepository: Repository<ArchivoTemarioBase>,

    @InjectRepository(Program)
    private programRepository: Repository<Program>,
  ) {}

  /**
   * Subir múltiples PDFs y crear materias automáticamente
   * ✅ MEJORADO: Reactiva materias eliminadas
   */
  async uploadMateriasMasivas(
    programaId: number,
    periodoEscolarId: number,
    files: Express.Multer.File[],
    subidoPor: number,
  ): Promise<BatchUploadResult> {
    const result: BatchUploadResult = {
      success: [],
      errors: [],
      total: files.length,
      created: 0,
      existing: 0,
      reactivated: 0, // ✅ NUEVO
      failed: 0,
    };

    const programa = await this.programRepository.findOne({
      where: { id: programaId },
    });

    if (!programa) {
      throw new BadRequestException(`Programa con ID ${programaId} no encontrado`);
    }

    for (const file of files) {
      try {
        const fileInfo = this.extractFileInfo(file.originalname, programa.codigo);

        // ✅ BUSCAR MATERIA SIN FILTRAR POR esta_activo
        let materia = await this.subjectRepository.findOne({
          where: { 
            codigo: fileInfo.codigo,
            programaId: programaId 
          },
        });

        let materiaCreated = false;
        let materiaReactivated = false;

        if (!materia) {
          // ✅ CASO 1: Materia NO existe → Crear nueva
          materia = this.subjectRepository.create({
            programaId: programaId,
            nombre: fileInfo.nombre,
            codigo: fileInfo.codigo,
            semestre: fileInfo.semestre,
            creditos: 5,
            estaActivo: true,
          });

          materia = await this.subjectRepository.save(materia);
          materiaCreated = true;
          result.created++;

        } else if (!materia.estaActivo) {
          // ✅ CASO 2: Materia existe pero está INACTIVA → Reactivar
          materia.estaActivo = true;
          materia = await this.subjectRepository.save(materia);
          materiaReactivated = true;
          result.reactivated++;

        } else {
          // ✅ CASO 3: Materia existe y está ACTIVA → Contar como existente
          result.existing++;
        }

        // ✅ Obtener el próximo orden disponible
        const ultimoOrden = await this.archivoTemarioBaseRepository
          .createQueryBuilder('archivo')
          .select('MAX(archivo.orden)', 'maxOrden')
          .where('archivo.materiaId = :materiaId', { materiaId: materia.id })
          .andWhere('archivo.periodoEscolarId = :periodoId', { periodoId: periodoEscolarId })
          .andWhere('archivo.estaActivo = :activo', { activo: true })
          .getRawOne();

        const siguienteOrden = (ultimoOrden?.maxOrden || 0) + 1;

        // ✅ Crear archivo
        const archivo = this.archivoTemarioBaseRepository.create({
          materiaId: materia.id,
          periodoEscolarId: periodoEscolarId,
          titulo: fileInfo.nombre,
          descripcion: `Temario de ${fileInfo.nombre}`,
          archivoPdf: file.path,
          nombreOriginal: file.originalname,
          tamanoMb: file.size / (1024 * 1024),
          orden: siguienteOrden,
          tipo: 'GENERAL',
          subidoPor: subidoPor,
          estaActivo: true,
        });

        const archivoGuardado = await this.archivoTemarioBaseRepository.save(archivo);

        result.success.push({
          materiaId: materia.id,
          materiaNombre: materia.nombre,
          materiaCodigo: materia.codigo,
          archivoId: archivoGuardado.id,
          created: materiaCreated,
          reactivated: materiaReactivated, // ✅ NUEVO
        });

      } catch (error) {
        result.errors.push({
          filename: file.originalname,
          error: error.message || 'Error desconocido',
        });
        result.failed++;
      }
    }

    return result;
  }

  /**
   * Eliminar materia (desactivar)
   */
  async deleteMateria(materiaId: number): Promise<{ message: string }> {
    const materia = await this.subjectRepository.findOne({
      where: { id: materiaId },
    });

    if (!materia) {
      throw new BadRequestException(`Materia con ID ${materiaId} no encontrada`);
    }

    // Desactivar materia
    materia.estaActivo = false;
    await this.subjectRepository.save(materia);

    // Desactivar todos sus archivos
    await this.archivoTemarioBaseRepository.update(
      { materiaId: materiaId },
      { estaActivo: false }
    );

    return { message: 'Materia eliminada correctamente' };
  }

  /**
   * Extraer información del nombre del archivo
   */
  private extractFileInfo(filename: string, programaCodigo: string): {
    codigo: string;
    nombre: string;
    semestre: number;
  } {
    const nombreSinExtension = filename.replace(/\.pdf$/i, '');
    const codigo = nombreSinExtension;

    const match = codigo.match(/\d+/);
    let semestre = 1;
    
    if (match) {
      const numero = match[0];
      semestre = parseInt(numero.charAt(0)) || 1;
    }

    const nombre = `Materia ${codigo}`;

    return {
      codigo,
      nombre,
      semestre,
    };
  }

  /**
   * Obtener estadísticas de materias de un programa
   */
  async getProgramaStats(programaId: number): Promise<{
    totalMaterias: number;
    materiasPorSemestre: { [semestre: number]: number };
    materiasConTemario: number;
  }> {
    const materias = await this.subjectRepository.find({
      where: { programaId, estaActivo: true },
    });

    const materiasPorSemestre: { [semestre: number]: number } = {};
    
    for (const materia of materias) {
      if (!materiasPorSemestre[materia.semestre]) {
        materiasPorSemestre[materia.semestre] = 0;
      }
      materiasPorSemestre[materia.semestre]++;
    }

    let materiasConTemario = 0;
    for (const materia of materias) {
      const count = await this.archivoTemarioBaseRepository.count({
        where: { materiaId: materia.id, estaActivo: true },
      });
      if (count > 0) materiasConTemario++;
    }

    return {
      totalMaterias: materias.length,
      materiasPorSemestre,
      materiasConTemario,
    };
  }
}