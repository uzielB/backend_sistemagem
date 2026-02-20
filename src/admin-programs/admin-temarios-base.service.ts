import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArchivoTemarioBase } from './entities/archivo-temario-base.entity';
import { Subject } from '../teachers/entities/subject.entity';
import { SchoolPeriod } from '../school-periods/entities/school-period.entity';

export interface CreateArchivoTemarioBaseDto {
  materiaId: number;
  periodoEscolarId: number;
  titulo: string;
  descripcion?: string;
  archivoPdf: string;
  nombreOriginal: string;
  tamanoMb: number;
  orden?: number;
  tipo?: string;
  subidoPor: number;
}

export interface UpdateArchivoTemarioBaseDto {
  titulo?: string;
  descripcion?: string;
  orden?: number;
  tipo?: string;
  estaActivo?: boolean;
}

export interface ArchivoTemarioBaseResponseDto {
  id: number;
  materiaId: number;
  periodoEscolarId: number;
  titulo: string;
  descripcion: string;
  archivoPdf: string;
  nombreOriginal: string;
  tamanoMb: number;
  orden: number;
  tipo: string;
  subidoPor: number;
  fechaSubida: Date;
  estaActivo: boolean;
}

@Injectable()
export class AdminTemariosBaseService {
  constructor(
    @InjectRepository(ArchivoTemarioBase)
    private archivoTemarioBaseRepository: Repository<ArchivoTemarioBase>,

    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,

    @InjectRepository(SchoolPeriod)
    private periodRepository: Repository<SchoolPeriod>,
  ) {}

  /**
   * Crear archivo de temario base
   */
  async createArchivoTemarioBase(data: CreateArchivoTemarioBaseDto): Promise<ArchivoTemarioBase> {
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

    // Si no se especifica orden, asignar el siguiente disponible
    if (!data.orden) {
      const ultimoArchivo = await this.archivoTemarioBaseRepository.findOne({
        where: { 
          materiaId: data.materiaId, 
          periodoEscolarId: data.periodoEscolarId,
          estaActivo: true 
        },
        order: { orden: 'DESC' },
      });
      data.orden = ultimoArchivo ? ultimoArchivo.orden + 1 : 1;
    }

    // Crear el archivo
    const archivo = this.archivoTemarioBaseRepository.create({
      materiaId: data.materiaId,
      periodoEscolarId: data.periodoEscolarId,
      titulo: data.titulo,
      descripcion: data.descripcion,
      archivoPdf: data.archivoPdf,
      nombreOriginal: data.nombreOriginal,
      tamanoMb: data.tamanoMb,
      orden: data.orden,
      tipo: data.tipo || 'GENERAL',
      subidoPor: data.subidoPor,
      estaActivo: true,
    });

    return this.archivoTemarioBaseRepository.save(archivo);
  }

  /**
   * Obtener todos los archivos de una materia
   */
  async getArchivosByMateria(materiaId: number, periodoId?: number): Promise<ArchivoTemarioBase[]> {
    const whereCondition: any = {
      materiaId,
      estaActivo: true,
    };

    if (periodoId) {
      whereCondition.periodoEscolarId = periodoId;
    }

    const archivos = await this.archivoTemarioBaseRepository.find({
      where: whereCondition,
      order: { orden: 'ASC', fechaSubida: 'DESC' },
    });

    return archivos;
  }

  /**
   * Obtener un archivo específico
   */
  async getArchivoById(id: number): Promise<ArchivoTemarioBase> {
    const archivo = await this.archivoTemarioBaseRepository.findOne({
      where: { id },
    });

    if (!archivo) {
      throw new NotFoundException(`Archivo de temario con ID ${id} no encontrado`);
    }

    return archivo;
  }

  /**
   * Actualizar archivo de temario
   */
  async updateArchivoTemarioBase(id: number, updateDto: UpdateArchivoTemarioBaseDto): Promise<ArchivoTemarioBase> {
    const archivo = await this.getArchivoById(id);

    // Actualizar campos
    if (updateDto.titulo !== undefined) archivo.titulo = updateDto.titulo;
    if (updateDto.descripcion !== undefined) archivo.descripcion = updateDto.descripcion;
    if (updateDto.orden !== undefined) archivo.orden = updateDto.orden;
    if (updateDto.tipo !== undefined) archivo.tipo = updateDto.tipo;
    if (updateDto.estaActivo !== undefined) archivo.estaActivo = updateDto.estaActivo;

    return this.archivoTemarioBaseRepository.save(archivo);
  }

  /**
   * Eliminar (desactivar) archivo de temario
   */
  async deleteArchivoTemarioBase(id: number): Promise<{ message: string }> {
    const archivo = await this.getArchivoById(id);

    archivo.estaActivo = false;
    await this.archivoTemarioBaseRepository.save(archivo);

    return { message: 'Archivo de temario eliminado correctamente' };
  }

  /**
   * Reemplazar archivo PDF
   */
  async replaceArchivoFile(
    id: number,
    fileData: {
      archivoPdf: string;
      nombreOriginal: string;
      tamanoMb: number;
    }
  ): Promise<ArchivoTemarioBase> {
    const archivo = await this.getArchivoById(id);

    // Actualizar archivo
    archivo.archivoPdf = fileData.archivoPdf;
    archivo.nombreOriginal = fileData.nombreOriginal;
    archivo.tamanoMb = fileData.tamanoMb;
    archivo.fechaSubida = new Date();

    return this.archivoTemarioBaseRepository.save(archivo);
  }

  /**
   * Reordenar archivos de una materia
   */
  async reorderArchivos(
    materiaId: number, 
    periodoId: number, 
    ordenNuevo: { id: number; orden: number }[]
  ): Promise<void> {
    for (const item of ordenNuevo) {
      await this.archivoTemarioBaseRepository.update(
        { id: item.id, materiaId, periodoEscolarId: periodoId },
        { orden: item.orden }
      );
    }
  }

  /**
   * Contar archivos por materia
   */
  async countArchivosByMateria(materiaId: number, periodoId?: number): Promise<number> {
    const whereCondition: any = {
      materiaId,
      estaActivo: true,
    };

    if (periodoId) {
      whereCondition.periodoEscolarId = periodoId;
    }

    return this.archivoTemarioBaseRepository.count({
      where: whereCondition,
    });
  }

  /**
   * Obtener archivos por tipo
   */
  async getArchivosByTipo(materiaId: number, tipo: string): Promise<ArchivoTemarioBase[]> {
    return this.archivoTemarioBaseRepository.find({
      where: { materiaId, tipo, estaActivo: true },
      order: { orden: 'ASC' },
    });
  }
}