/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../teachers/entities/student.entity';
import { InscribirEstudianteDto } from './dto/inscribir-estudiante.dto';
import { FinanzasService } from '../finanzas/finanzas.service';

@Injectable()
export class AdminEstudiantesService {
  
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly finanzasService: FinanzasService,
  ) {}

  async inscribirEstudiante(dto: InscribirEstudianteDto, adminId: number) {
    console.log('');
    console.log('================================================');
    console.log('📚 AdminEstudiantesService.inscribirEstudiante()');
    console.log('DTO:', dto);
    console.log('Admin ID:', adminId);
    console.log('================================================');

    // VERIFICAR QUE NO EXISTA ESTUDIANTE CON ESE CURP
    const existente = await this.studentRepository.findOne({
      where: { curp: dto.curp }
    });

    if (existente) {
      throw new BadRequestException(`Ya existe un estudiante con el CURP: ${dto.curp}`);
    }

    // GENERAR MATRÍCULA
    const matricula = await this.generarMatricula(dto.programaId);
    
    // CREAR ESTUDIANTE
    const estudiante = this.studentRepository.create({
      usuarioId: null,
      matricula,
      curp: dto.curp,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      programaId: dto.programaId,
      grupoId: dto.grupoId || null,
      modalidad: dto.modalidad,
      semestreActual: dto.semestreActual,
      correo: dto.correo,
      telefonoCelular: dto.telefonoCelular,
      escuelaProcedencia: dto.escuelaProcedencia || '',
      promedioBachillerato: dto.promedioBachillerato,
      nombreTutor: dto.nombreTutor,
      telefonoTutor: dto.telefonoTutor,
      estatus: 'ACTIVO',
      estaActivo: true,
      fechaInscripcion: new Date()
    });

    const estudianteGuardado = await this.studentRepository.save(estudiante);
    console.log('✅ Estudiante creado con ID:', estudianteGuardado.id);

    // CREAR CONFIGURACIÓN FINANCIERA
    const configFinanciera = await this.finanzasService.crearConfiguracionFinanciera(
      estudianteGuardado.id,
      dto.configuracionFinanciera,
      adminId
    );
    
    console.log('✅ Configuración financiera creada');
    console.log('================================================');
    console.log('');

    return {
      estudiante: estudianteGuardado,
      estadoFinanciero: configFinanciera.estadoFinanciero,
      pagos: configFinanciera.pagos
    };
  }

  private async generarMatricula(programaId: number): Promise<string> {
    const año = new Date().getFullYear().toString().slice(-2);
    const programa = programaId.toString().padStart(2, '0');
    const count = await this.studentRepository.count();
    const consecutivo = (count + 1).toString().padStart(4, '0');
    return `${año}${programa}${consecutivo}`;
  }

  async obtenerTodos() {
    return await this.studentRepository.find({
      relations: ['programa', 'grupo'],
      order: { fechaCreacion: 'DESC' }
    });
  }

  async obtenerPorId(id: number) {
    const estudiante = await this.studentRepository.findOne({
      where: { id },
      relations: ['programa', 'grupo', 'usuario']
    });

    if (!estudiante) {
      throw new BadRequestException('Estudiante no encontrado');
    }

    return estudiante;
  }
}