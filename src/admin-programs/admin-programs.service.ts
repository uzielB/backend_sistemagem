import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from '../programs/entities/program.entity';
import { Subject } from '../teachers/entities/subject.entity';
import { Syllabus } from '../syllabuses/entities/sallybus.entity';
import { SchoolPeriod } from '../school-periods/entities/school-period.entity';

@Injectable()
export class AdminProgramsService {
  constructor(
    @InjectRepository(Program)
    private programRepository: Repository<Program>,

    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,

    @InjectRepository(Syllabus)
    private syllabusRepository: Repository<Syllabus>,

    @InjectRepository(SchoolPeriod)
    private periodRepository: Repository<SchoolPeriod>,
  ) {}

  /**
   * Obtener todos los programas activos
   */
  async getAllPrograms(filters?: { modalidad?: string; estaActivo?: boolean }) {
    const where: any = {};

    if (filters?.modalidad) {
      where.modalidad = filters.modalidad;
    }

    if (filters?.estaActivo !== undefined) {
      where.estaActivo = filters.estaActivo;
    } else {
      where.estaActivo = true; // Por defecto solo activos
    }

    const programs = await this.programRepository.find({
      where,
      order: { nombre: 'ASC' },
    });

    // Contar materias ACTIVAS por programa
    const programsWithCount = await Promise.all(
      programs.map(async (program) => {
        const materiasCount = await this.subjectRepository.count({
          where: { 
            programaId: program.id,
            estaActivo: true // ✅ SOLO MATERIAS ACTIVAS
          },
        });

        return {
          ...program,
          totalMaterias: materiasCount,
        };
      })
    );

    return programsWithCount;
  }

  /**
   * Obtener detalle de un programa con sus materias ACTIVAS
   */
  async getProgramDetail(programId: number) {
    const program = await this.programRepository.findOne({
      where: { id: programId },
    });

    if (!program) {
      throw new Error(`Programa con ID ${programId} no encontrado`);
    }

    // ✅ SOLO MATERIAS ACTIVAS
    const materias = await this.subjectRepository.find({
      where: { 
        programaId: programId,
        estaActivo: true // ✅ FILTRO IMPORTANTE
      },
      order: { semestre: 'ASC', nombre: 'ASC' },
    });

    // Verificar si tienen temario
    const materiasConTemario = await Promise.all(
      materias.map(async (materia) => {
        const temario = await this.syllabusRepository.findOne({
          where: { materiaId: materia.id },
        });

        return {
          ...materia,
          tieneTemario: !!temario,
          temario: temario || null,
        };
      })
    );

    const totalMaterias = materias.length;

    return {
      ...program,
      materias: materiasConTemario,
      totalMaterias,
    };
  }

  /**
   * Obtener materias de un programa filtradas y ACTIVAS
   */
  async getMateriasByPrograma(
    programaId: number,
    filters?: { semestre?: number; tieneTemario?: boolean }
  ) {
    const where: any = { 
      programaId,
      estaActivo: true // ✅ SOLO ACTIVAS
    };

    if (filters?.semestre) {
      where.semestre = filters.semestre;
    }

    const materias = await this.subjectRepository.find({
      where,
      order: { semestre: 'ASC', nombre: 'ASC' },
    });

    // Filtrar por tieneTemario si se especifica
    if (filters?.tieneTemario !== undefined) {
      const materiasConTemario = await Promise.all(
        materias.map(async (materia) => {
          const temario = await this.syllabusRepository.findOne({
            where: { materiaId: materia.id },
          });

          return {
            materia,
            tieneTemario: !!temario,
          };
        })
      );

      const filtradas = materiasConTemario
        .filter((item) => item.tieneTemario === filters.tieneTemario)
        .map((item) => item.materia);

      return filtradas;
    }

    return materias;
  }
}