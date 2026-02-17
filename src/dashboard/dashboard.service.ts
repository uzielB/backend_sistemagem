import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/role.enum';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Student } from '../teachers/entities/student.entity';
import { Program } from '../programs/entities/program.entity';
import { Subject } from '../teachers/entities/subject.entity';
import { Group } from '../teachers/entities/group.entity';
import { SchoolPeriod } from '../school-periods/entities/school-period.entity';
import { TeacherAssignment } from '../teachers/entities/teacher-assignment.entity';
import { TeacherDocument, EstatusDocumentos } from '../teacher-documents/entities/teacher-document.entity';
import { TeacherAvailability, EstatusDisponibilidad } from '../teacher-availability/entities/teacher-availability.entity';
import { LessonPlan, LessonPlanStatus } from '../syllabuses/entities/lesson-plan.entity'; // ✅ CORREGIDO
import {
  DashboardResponseDto,
  UsuariosMetricsDto,
  DocentesMetricsDto,
  EstudiantesMetricsDto,
  AcademicoMetricsDto,
  AsignacionesMetricsDto,
  AlertasDto,
  DashboardFiltersDto,
} from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,

    @InjectRepository(Student)
    private studentRepository: Repository<Student>,

    @InjectRepository(Program)
    private programRepository: Repository<Program>,

    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,

    @InjectRepository(Group)
    private groupRepository: Repository<Group>,

    @InjectRepository(SchoolPeriod)
    private schoolPeriodRepository: Repository<SchoolPeriod>,

    @InjectRepository(TeacherAssignment)
    private assignmentRepository: Repository<TeacherAssignment>,

    @InjectRepository(TeacherDocument)
    private teacherDocumentRepository: Repository<TeacherDocument>,

    @InjectRepository(TeacherAvailability)
    private availabilityRepository: Repository<TeacherAvailability>,

    @InjectRepository(LessonPlan) // ✅ CORREGIDO
    private lessonPlanRepository: Repository<LessonPlan>,
  ) {}

  /**
   * Obtener todas las métricas del dashboard
   */
  async getDashboardMetrics(filters?: DashboardFiltersDto): Promise<DashboardResponseDto> {
    const [
      usuarios,
      docentes,
      estudiantes,
      academico,
      asignaciones,
      alertas,
    ] = await Promise.all([
      this.getUsuariosMetrics(),
      this.getDocentesMetrics(),
      this.getEstudiantesMetrics(),
      this.getAcademicoMetrics(),
      this.getAsignacionesMetrics(filters?.periodoEscolarId),
      this.getAlertas(),
    ]);

    return {
      usuarios,
      docentes,
      estudiantes,
      academico,
      asignaciones,
      alertas,
      generadoEn: new Date(),
    };
  }

  /**
   * Métricas de usuarios
   */
  private async getUsuariosMetrics(): Promise<UsuariosMetricsDto> {
    const totalUsuarios = await this.userRepository.count();
    
    const usuariosActivos = await this.userRepository.count({
      where: { estaActivo: true },
    });

    const usuariosInactivos = totalUsuarios - usuariosActivos;

    // Contar por rol (usando el enum UserRole) ✅ CORREGIDO
    const superAdmin = await this.userRepository.count({
      where: { rol: UserRole.SUPER_ADMIN },
    });
    const admin = await this.userRepository.count({
      where: { rol: UserRole.ADMIN },
    });
    const docente = await this.userRepository.count({
      where: { rol: UserRole.DOCENTE },
    });
    const alumno = await this.userRepository.count({
      where: { rol: UserRole.ALUMNO },
    });

    // Nuevos este mes
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const nuevosEsteMes = await this.userRepository.count({
      where: {
        fechaCreacion: Between(inicioMes, new Date()),
      },
    });

    return {
      totalUsuarios,
      usuariosPorRol: {
        superAdmin,
        admin,
        docente,
        alumno,
      },
      usuariosActivos,
      usuariosInactivos,
      nuevosEsteMes,
    };
  }

  /**
   * Métricas de docentes
   */
  private async getDocentesMetrics(): Promise<DocentesMetricsDto> {
    const totalDocentes = await this.teacherRepository.count();
    
    const docentesActivos = await this.teacherRepository.count({
      where: { estaActivo: true },
    });

    const docentesInactivos = totalDocentes - docentesActivos;

    const docentesConFormularioCompleto = await this.teacherRepository.count({
      where: { haCompletadoFormulario: true },
    });

    const docentesConDocumentosCompletos = await this.teacherRepository.count({
      where: { haSubidoDocumentos: true },
    });

    const docentesConDatosBancarios = await this.teacherRepository.count({
      where: { haProporcionadoDatosBancarios: true },
    });

    return {
      totalDocentes,
      docentesActivos,
      docentesInactivos,
      docentesConFormularioCompleto,
      docentesConDocumentosCompletos,
      docentesConDatosBancarios,
    };
  }

  /**
   * Métricas de estudiantes
   */
  private async getEstudiantesMetrics(): Promise<EstudiantesMetricsDto> {
    const totalEstudiantes = await this.studentRepository.count();

    // Por estatus
    const activos = await this.studentRepository.count({
      where: { estatus: 'ACTIVO' },
    });
    const bajaTemporal = await this.studentRepository.count({
      where: { estatus: 'BAJA_TEMPORAL' },
    });
    const egresados = await this.studentRepository.count({
      where: { estatus: 'EGRESADO' },
    });

    // Por programa
    const estudiantes = await this.studentRepository.find({
      relations: ['programa'],
    });

    const estudiantesPorProgramaMap = new Map<string, number>();
    estudiantes.forEach(e => {
      const programaNombre = e.programa?.nombre || 'Sin programa';
      estudiantesPorProgramaMap.set(
        programaNombre,
        (estudiantesPorProgramaMap.get(programaNombre) || 0) + 1
      );
    });

    const estudiantesPorPrograma = Array.from(estudiantesPorProgramaMap.entries()).map(
      ([programaNombre, cantidad]) => ({ programaNombre, cantidad })
    );

    // Nuevos este mes
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const nuevosEsteMes = await this.studentRepository.count({
      where: {
        fechaCreacion: Between(inicioMes, new Date()),
      },
    });

    return {
      totalEstudiantes,
      estudiantesPorEstatus: {
        activos,
        bajaTemporal,
        egresados,
      },
      estudiantesPorPrograma,
      nuevosEsteMes,
    };
  }

  /**
   * Métricas académicas
   */
  private async getAcademicoMetrics(): Promise<AcademicoMetricsDto> {
    const totalProgramas = await this.programRepository.count();
    const programasActivos = await this.programRepository.count({
      where: { estaActivo: true },
    });

    const totalMaterias = await this.subjectRepository.count();
    const materiasActivas = await this.subjectRepository.count({
      where: { estaActivo: true },
    });

    const totalGrupos = await this.groupRepository.count();
    const gruposActivos = await this.groupRepository.count({
      where: { estaActivo: true },
    });

    // Periodo actual
    const periodoActual = await this.schoolPeriodRepository.findOne({
      where: { esActual: true },
    });

    return {
      totalProgramas,
      programasActivos,
      totalMaterias,
      materiasActivas,
      totalGrupos,
      gruposActivos,
      periodoActual: periodoActual ? {
        id: periodoActual.id,
        nombre: periodoActual.nombre,
        codigo: periodoActual.codigo,
        fechaInicio: periodoActual.fechaInicio,
        fechaFin: periodoActual.fechaFin,
      } : null,
    };
  }

  /**
   * Métricas de asignaciones
   */
  private async getAsignacionesMetrics(periodoId?: number): Promise<AsignacionesMetricsDto> {
    const whereCondition: any = { estaActivo: true };
    
    if (periodoId) {
      whereCondition.periodoEscolarId = periodoId;
    }

    const totalAsignaciones = await this.assignmentRepository.count();
    const asignacionesActivas = await this.assignmentRepository.count({
      where: whereCondition,
    });

    const asignacionesSinModuloHorario = await this.assignmentRepository.count({
      where: { ...whereCondition, moduloHorarioId: null },
    });

    // Por sistema (requiere join con modulo_horario)
    const assignments = await this.assignmentRepository.find({
      where: whereCondition,
      relations: ['moduloHorario'],
    });

    let escolarizado = 0;
    let sabatino = 0;

    assignments.forEach(a => {
      if (a.moduloHorario?.sistema === 'ESCOLARIZADO') {
        escolarizado++;
      } else if (a.moduloHorario?.sistema === 'SABATINO') {
        sabatino++;
      }
    });

    // Docentes con asignaciones
    const docentesConAsignaciones = new Set(
      assignments.map(a => a.docenteId)
    ).size;

    // Grupos cubiertos
    const gruposCubiertos = new Set(
      assignments.map(a => a.grupoId)
    ).size;

    return {
      totalAsignaciones,
      asignacionesActivas,
      asignacionesSinModuloHorario,
      asignacionesPorSistema: {
        escolarizado,
        sabatino,
      },
      docentesConAsignaciones,
      gruposCubiertos,
    };
  }

  /**
   * Alertas del sistema
   */
  private async getAlertas(): Promise<AlertasDto> {
    // Documentos de docentes pendientes (usando el enum) ✅ CORREGIDO
    const documentosDocentesPendientes = await this.teacherDocumentRepository.count({
      where: { estatus: EstatusDocumentos.PENDIENTE },
    });

    // Planeaciones pendientes de revisión
    const planeacionesPendientesRevision = await this.lessonPlanRepository.count({
      where: { estatus: LessonPlanStatus.PENDING_REVIEW }, // Ajustar según el enum de lesson-plan
    });

    // Disponibilidad pendiente de revisión (usando el enum) ✅ CORREGIDO
    const disponibilidadPendienteRevision = await this.availabilityRepository.count({
      where: { estatus: EstatusDisponibilidad.PENDIENTE },
    });

    // Asignaciones sin módulo horario
    const asignacionesSinModulo = await this.assignmentRepository.count({
      where: { estaActivo: true, moduloHorarioId: null },
    });

    // Docentes sin formulario completo
    const docentesSinFormulario = await this.teacherRepository.count({
      where: { estaActivo: true, haCompletadoFormulario: false },
    });

    // Docentes sin documentos completos
    const docentesSinDocumentos = await this.teacherRepository.count({
      where: { estaActivo: true, haSubidoDocumentos: false },
    });

    // Estudiantes sin documentos completos (requiere join con documentos_estudiantes)
    const estudiantesSinDocumentos = await this.studentRepository
      .createQueryBuilder('estudiante')
      .leftJoin('estudiante.documentos', 'documentos')
      .where('estudiante.esta_activo = :activo', { activo: true })
      .andWhere('(documentos.documentos_completos = :completos OR documentos.id IS NULL)', { completos: false })
      .getCount();

    return {
      documentosDocentesPendientes,
      planeacionesPendientesRevision,
      disponibilidadPendienteRevision,
      asignacionesSinModulo,
      docentesSinFormulario,
      docentesSinDocumentos,
      estudiantesSinDocumentos,
    };
  }
}