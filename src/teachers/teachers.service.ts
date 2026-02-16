import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from './entities/teacher.entity';
import { TeacherAssignment } from './entities/teacher-assignment.entity';
import { Grade } from './entities/grade.entity';
import { Attendance } from './entities/attendance.entity';
import { Student } from './entities/student.entity';
import {
  TeacherScheduleResponseDto,
  StudentListResponseDto,
  GetTeacherStudentsDto,
  MyAssignmentsResponseDto,
  TeacherAssignmentResponseDto,
  SaveGradeDto,
  SaveBulkGradesDto,
  GradeResponseDto,
  GetGradesDto,
  SaveAttendanceDto,
  SaveBulkAttendancesDto,
  AttendanceResponseDto,
  GetAttendancesDto,
  AttendancePercentageDto,
} from './dto/teachers.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,

    @InjectRepository(TeacherAssignment)
    private assignmentRepository: Repository<TeacherAssignment>,

    @InjectRepository(Grade)
    private gradeRepository: Repository<Grade>,

    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,

    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  // ==================== HORARIOS Y LISTAS ====================

  private async getTeacherByUserId(usuarioId: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { usuarioId, estaActivo: true },
    });

    if (!teacher) {
      throw new NotFoundException('Docente no encontrado');
    }

    return teacher;
  }

  async getTeacherSchedule(usuarioId: number): Promise<TeacherScheduleResponseDto[]> {
    const teacher = await this.getTeacherByUserId(usuarioId);

    const assignments = await this.assignmentRepository.find({
      where: { docenteId: teacher.id, estaActivo: true },
      relations: ['materia', 'grupo', 'moduloHorario', 'grupo.programa'],
    });

    const schedule: TeacherScheduleResponseDto[] = [];

    for (const assignment of assignments) {
      if (assignment.moduloHorario) {
        const dias = this.getWeekDays(assignment.moduloHorario.sistema);

        for (const dia of dias) {
          schedule.push({
            id: assignment.id,
            dia: dia,
            modulo: assignment.moduloHorario.numeroModulo,
            horaInicio: assignment.moduloHorario.horaInicio,
            horaFin: assignment.moduloHorario.horaFin,
            materia: assignment.materia.nombre,
            grupo: assignment.grupo.nombre,
            aula: assignment.aula || 'Por asignar',
            sistema: assignment.moduloHorario.sistema,
            materiaId: assignment.materiaId,
            grupoId: assignment.grupoId,
            asignacionId: assignment.id,
          });
        }
      }
    }

    return schedule;
  }



async getMyAssignments(usuarioId: number): Promise<MyAssignmentsResponseDto> {
  const teacher = await this.getTeacherByUserId(usuarioId);

  const assignments = await this.assignmentRepository.find({
    where: { docenteId: teacher.id, estaActivo: true },
    relations: [
      'materia',
      'grupo',
      'grupo.programa',
      'moduloHorario',
      'periodoEscolar',
    ],
  });

  const assignmentsDto: TeacherAssignmentResponseDto[] = assignments.map((assignment) => ({
    id: assignment.id,
    sistema: assignment.moduloHorario?.sistema || 'N/A',
    grupo: assignment.grupo.nombre,
    materia: assignment.materia.nombre,
    aula: assignment.aula || 'Por asignar',
    
    // ✅ CAMPOS PLANOS DEL MÓDULO HORARIO (para Schedule frontend)
    moduloNumero: assignment.moduloHorario?.numeroModulo,
    moduloHoraInicio: assignment.moduloHorario?.horaInicio,
    moduloHoraFin: assignment.moduloHorario?.horaFin,
    moduloSistema: assignment.moduloHorario?.sistema,
    moduloDiasSemana: assignment.moduloHorario?.diasSemana,
    
    // Objeto anidado (mantener para compatibilidad)
    moduloHorario: assignment.moduloHorario ? {
      numeroModulo: assignment.moduloHorario.numeroModulo,
      horaInicio: assignment.moduloHorario.horaInicio,
      horaFin: assignment.moduloHorario.horaFin,
      diasSemana: assignment.moduloHorario.diasSemana,
    } : null,
    
    programa: assignment.grupo.programa ? {
      id: assignment.grupo.programa.id,
      nombre: assignment.grupo.programa.nombre,
      codigo: assignment.grupo.programa.codigo,
    } : null,
    
    periodoEscolar: assignment.periodoEscolar ? {
      id: assignment.periodoEscolar.id,
      nombre: assignment.periodoEscolar.nombre,
      codigo: assignment.periodoEscolar.codigo,
    } : null,
  }));

  const uniqueGroups = new Set(assignments.map(a => a.grupoId));
  const totalHours = assignments.reduce((total, assignment) => {
    if (assignment.moduloHorario) {
      const start = this.parseTime(assignment.moduloHorario.horaInicio);
      const end = this.parseTime(assignment.moduloHorario.horaFin);
      return total + (end - start) / 60;
    }
    return total;
  }, 0);

  const groupIds = Array.from(uniqueGroups);
  const totalStudents = await this.studentRepository.count({
    where: groupIds.map(id => ({ grupoId: id, estaActivo: true })),
  });

  return {
    asignaciones: assignmentsDto,
    totalAsignaciones: assignments.length,
    totalGrupos: uniqueGroups.size,
    totalAlumnos: totalStudents,
    totalHorasSemanales: totalHours,
  };
}


  async getTeacherStudents(
    usuarioId: number,
    filters: GetTeacherStudentsDto,
  ): Promise<StudentListResponseDto[]> {
    const teacher = await this.getTeacherByUserId(usuarioId);

    const queryBuilder = this.assignmentRepository
      .createQueryBuilder('asignacion')
      .where('asignacion.docente_id = :docenteId', { docenteId: teacher.id })
      .andWhere('asignacion.esta_activo = :activo', { activo: true });

    if (filters.grupoId) {
      queryBuilder.andWhere('asignacion.grupo_id = :grupoId', { grupoId: filters.grupoId });
    }

    if (filters.materiaId) {
      queryBuilder.andWhere('asignacion.materia_id = :materiaId', { materiaId: filters.materiaId });
    }

    if (filters.asignacionId) {
      queryBuilder.andWhere('asignacion.id = :asignacionId', { asignacionId: filters.asignacionId });
    }

    const assignments = await queryBuilder.getMany();

    if (assignments.length === 0) {
      return [];
    }

    const groupIds = [...new Set(assignments.map(a => a.grupoId))];

    // Obtener alumnos de esos grupos
    const students = await this.studentRepository.find({
      where: groupIds.map(id => ({ grupoId: id, estaActivo: true })),
      relations: ['grupo', 'programa', 'usuario'],
    });

    // Mapear a DTO
    const studentsDto: StudentListResponseDto[] = students.map((student) => ({
      id: student.id,
      matricula: student.matricula,
      nombreCompleto: student.usuario.getFullName(),
      programa: student.programa?.nombre || 'Sin programa',
      grupo: student.grupo?.nombre || 'Sin grupo',
      correo: student.correo || student.usuario.correo,
      telefono: student.telefonoCelular || student.telefonoCasa || 'Sin teléfono',
      estatus: student.estatus,
      programaId: student.programaId,
      grupoId: student.grupoId,
    }));

    return studentsDto;
  }

  // ==================== CALIFICACIONES ====================

  async saveGrade(
    usuarioId: number,
    dto: SaveGradeDto,
  ): Promise<GradeResponseDto> {
    const teacher = await this.getTeacherByUserId(usuarioId);

    await this.verifyTeacherAssignment(teacher.id, dto.asignacionId);
    await this.verifyStudent(dto.estudianteId, dto.asignacionId);

    const existingGrade = await this.gradeRepository.findOne({
      where: {
        estudianteId: dto.estudianteId,
        asignacionId: dto.asignacionId,
        tipoCalificacion: dto.tipoCalificacion,
      },
    });

    if (existingGrade) {
      throw new BadRequestException(
        `Ya existe una calificación ${dto.tipoCalificacion} para este estudiante`,
      );
    }

    const grade = this.gradeRepository.create({
      estudianteId: dto.estudianteId,
      asignacionId: dto.asignacionId,
      tipoCalificacion: dto.tipoCalificacion,
      valorCalificacion: dto.valorCalificacion,
      porcentaje: dto.porcentaje,
      comentarios: dto.comentarios,
      calificadoPor: teacher.id,
    });

    const saved = await this.gradeRepository.save(grade);

    return this.mapGradeToDto(saved);
  }

  async saveBulkGrades(
    usuarioId: number,
    dto: SaveBulkGradesDto,
  ): Promise<{ guardadas: number; calificaciones: GradeResponseDto[] }> {
    const teacher = await this.getTeacherByUserId(usuarioId);

    const savedGrades: Grade[] = [];

    for (const gradeDto of dto.calificaciones) {
      await this.verifyTeacherAssignment(teacher.id, gradeDto.asignacionId);
      await this.verifyStudent(gradeDto.estudianteId, gradeDto.asignacionId);

      let grade = await this.gradeRepository.findOne({
        where: {
          estudianteId: gradeDto.estudianteId,
          asignacionId: gradeDto.asignacionId,
          tipoCalificacion: gradeDto.tipoCalificacion,
        },
      });

      if (grade) {
        grade.valorCalificacion = gradeDto.valorCalificacion;
        grade.porcentaje = gradeDto.porcentaje;
        grade.comentarios = gradeDto.comentarios;
      } else {
        grade = this.gradeRepository.create({
          estudianteId: gradeDto.estudianteId,
          asignacionId: gradeDto.asignacionId,
          tipoCalificacion: gradeDto.tipoCalificacion,
          valorCalificacion: gradeDto.valorCalificacion,
          porcentaje: gradeDto.porcentaje,
          comentarios: gradeDto.comentarios,
          calificadoPor: teacher.id,
        });
      }

      const saved = await this.gradeRepository.save(grade);
      savedGrades.push(saved);
    }

    return {
      guardadas: savedGrades.length,
      calificaciones: savedGrades.map(g => this.mapGradeToDto(g)),
    };
  }

  async getGrades(
    usuarioId: number,
    query: GetGradesDto,
  ): Promise<GradeResponseDto[]> {
    const teacher = await this.getTeacherByUserId(usuarioId);

    await this.verifyTeacherAssignment(teacher.id, query.asignacionId);

    const queryBuilder = this.gradeRepository
      .createQueryBuilder('calificacion')
      .leftJoinAndSelect('calificacion.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.usuario', 'usuario')
      .where('calificacion.asignacion_id = :asignacionId', { asignacionId: query.asignacionId });

    if (query.tipoCalificacion) {
      queryBuilder.andWhere('calificacion.tipo_calificacion = :tipo', { tipo: query.tipoCalificacion });
    }

    const grades = await queryBuilder.getMany();

    return grades.map(g => this.mapGradeToDto(g));
  }

  async updateGrade(
    usuarioId: number,
    gradeId: number,
    dto: Partial<SaveGradeDto>,
  ): Promise<GradeResponseDto> {
    const teacher = await this.getTeacherByUserId(usuarioId);

    const grade = await this.gradeRepository.findOne({
      where: { id: gradeId },
      relations: ['asignacion'],
    });

    if (!grade) {
      throw new NotFoundException('Calificación no encontrada');
    }

    await this.verifyTeacherAssignment(teacher.id, grade.asignacionId);

    if (dto.valorCalificacion !== undefined) {
      grade.valorCalificacion = dto.valorCalificacion;
    }
    if (dto.porcentaje !== undefined) {
      grade.porcentaje = dto.porcentaje;
    }
    if (dto.comentarios !== undefined) {
      grade.comentarios = dto.comentarios;
    }

    const updated = await this.gradeRepository.save(grade);

    return this.mapGradeToDto(updated);
  }

  async deleteGrade(usuarioId: number, gradeId: number): Promise<void> {
    const teacher = await this.getTeacherByUserId(usuarioId);

    const grade = await this.gradeRepository.findOne({
      where: { id: gradeId },
    });

    if (!grade) {
      throw new NotFoundException('Calificación no encontrada');
    }

    await this.verifyTeacherAssignment(teacher.id, grade.asignacionId);

    await this.gradeRepository.remove(grade);
  }

  // ==================== ASISTENCIAS ====================

  async saveAttendance(
    usuarioId: number,
    dto: SaveAttendanceDto,
  ): Promise<AttendanceResponseDto> {
    const teacher = await this.getTeacherByUserId(usuarioId);

    await this.verifyTeacherAssignment(teacher.id, dto.asignacionId);
    await this.verifyStudent(dto.estudianteId, dto.asignacionId);

    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        estudianteId: dto.estudianteId,
        asignacionId: dto.asignacionId,
        fecha: dto.fecha,
      },
    });

    if (existingAttendance) {
      throw new BadRequestException('Ya existe una asistencia registrada para esta fecha');
    }

    const attendance = this.attendanceRepository.create({
      estudianteId: dto.estudianteId,
      asignacionId: dto.asignacionId,
      fecha: dto.fecha,
      estatus: dto.estatus,
      llegoTarde: dto.llegoTarde || (dto.estatus === 'RETARDO'),
      comentarios: dto.comentarios,
      registradoPor: teacher.id,
    });

    const saved = await this.attendanceRepository.save(attendance);

    return this.mapAttendanceToDto(saved);
  }

  async saveBulkAttendances(
    usuarioId: number,
    dto: SaveBulkAttendancesDto,
  ): Promise<{ registradas: number; asistencias: AttendanceResponseDto[] }> {
    const teacher = await this.getTeacherByUserId(usuarioId);

    await this.verifyTeacherAssignment(teacher.id, dto.asignacionId);

    const savedAttendances: Attendance[] = [];

    for (const attendanceDto of dto.asistencias) {
      await this.verifyStudent(attendanceDto.estudianteId, dto.asignacionId);

      let attendance = await this.attendanceRepository.findOne({
        where: {
          estudianteId: attendanceDto.estudianteId,
          asignacionId: dto.asignacionId,
          fecha: dto.fecha,
        },
      });

      if (attendance) {
        attendance.estatus = attendanceDto.estatus;
        attendance.llegoTarde = attendanceDto.estatus === 'RETARDO';
        attendance.comentarios = attendanceDto.comentarios;
      } else {
        attendance = this.attendanceRepository.create({
          estudianteId: attendanceDto.estudianteId,
          asignacionId: dto.asignacionId,
          fecha: dto.fecha,
          estatus: attendanceDto.estatus,
          llegoTarde: attendanceDto.estatus === 'RETARDO',
          comentarios: attendanceDto.comentarios,
          registradoPor: teacher.id,
        });
      }

      const saved = await this.attendanceRepository.save(attendance);
      savedAttendances.push(saved);
    }

    return {
      registradas: savedAttendances.length,
      asistencias: savedAttendances.map(a => this.mapAttendanceToDto(a)),
    };
  }

  async getAttendances(
    usuarioId: number,
    query: GetAttendancesDto,
  ): Promise<AttendanceResponseDto[]> {
    const teacher = await this.getTeacherByUserId(usuarioId);

    await this.verifyTeacherAssignment(teacher.id, query.asignacionId);

    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('asistencia')
      .leftJoinAndSelect('asistencia.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.usuario', 'usuario')
      .where('asistencia.asignacion_id = :asignacionId', { asignacionId: query.asignacionId });

    if (query.fecha) {
      queryBuilder.andWhere('asistencia.fecha = :fecha', { fecha: query.fecha });
    }

    if (query.fechaInicio && query.fechaFin) {
      queryBuilder.andWhere('asistencia.fecha BETWEEN :inicio AND :fin', {
        inicio: query.fechaInicio,
        fin: query.fechaFin,
      });
    }

    const attendances = await queryBuilder.getMany();

    const attendancesWithPercentage = await Promise.all(
      attendances.map(async (attendance) => {
        const percentage = await this.calculateAttendancePercentageInternal(
          attendance.estudianteId,
          attendance.asignacionId,
        );
        
        const dto = this.mapAttendanceToDto(attendance);
        if (dto.estudiante) {
          dto.estudiante.porcentajeAsistencia = percentage.porcentaje;
        }
        return dto;
      }),
    );

    return attendancesWithPercentage;
  }

  async updateAttendance(
    usuarioId: number,
    attendanceId: number,
    dto: Partial<SaveAttendanceDto>,
  ): Promise<AttendanceResponseDto> {
    const teacher = await this.getTeacherByUserId(usuarioId);

    const attendance = await this.attendanceRepository.findOne({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new NotFoundException('Asistencia no encontrada');
    }

    await this.verifyTeacherAssignment(teacher.id, attendance.asignacionId);

    if (dto.estatus) {
      attendance.estatus = dto.estatus;
      attendance.llegoTarde = dto.estatus === 'RETARDO';
    }
    if (dto.comentarios !== undefined) {
      attendance.comentarios = dto.comentarios;
    }

    const updated = await this.attendanceRepository.save(attendance);

    return this.mapAttendanceToDto(updated);
  }

  async deleteAttendance(usuarioId: number, attendanceId: number): Promise<void> {
    const teacher = await this.getTeacherByUserId(usuarioId);

    const attendance = await this.attendanceRepository.findOne({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new NotFoundException('Asistencia no encontrada');
    }

    await this.verifyTeacherAssignment(teacher.id, attendance.asignacionId);

    await this.attendanceRepository.remove(attendance);
  }

  async calculateAttendancePercentage(
    usuarioId: number,
    estudianteId: number,
    asignacionId: number,
  ): Promise<AttendancePercentageDto> {
    const teacher = await this.getTeacherByUserId(usuarioId);
    await this.verifyTeacherAssignment(teacher.id, asignacionId);

    return this.calculateAttendancePercentageInternal(estudianteId, asignacionId);
  }

  // ==================== HELPERS ====================

  private getWeekDays(sistema: string): string[] {
    if (sistema === 'ESCOLARIZADO') {
      return ['Lunes', 'Martes', 'Miércoles', 'Jueves'];
    } else if (sistema === 'SABATINO') {
      return ['Sábado'];
    }
    return [];
  }

  private parseTime(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private async verifyTeacherAssignment(teacherId: number, assignmentId: number): Promise<void> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId, docenteId: teacherId, estaActivo: true },
    });

    if (!assignment) {
      throw new ForbiddenException('No tienes permiso para esta asignación');
    }
  }

  private async verifyStudent(studentId: number, assignmentId: number): Promise<void> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['grupo'],
    });

    const student = await this.studentRepository.findOne({
      where: { id: studentId, grupoId: assignment.grupoId, estaActivo: true },
    });

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado en este grupo');
    }
  }

  private mapGradeToDto(grade: Grade): GradeResponseDto {
    const dto: GradeResponseDto = {
      id: grade.id,
      estudianteId: grade.estudianteId,
      asignacionId: grade.asignacionId,
      tipoCalificacion: grade.tipoCalificacion,
      valorCalificacion: Number(grade.valorCalificacion),
      porcentaje: grade.porcentaje ? Number(grade.porcentaje) : null,
      comentarios: grade.comentarios,
      fechaCalificacion: grade.fechaCalificacion,
    };

    if (grade.estudiante) {
      dto.estudiante = {
        id: grade.estudiante.id,
        matricula: grade.estudiante.matricula,
        nombreCompleto: grade.estudiante.usuario.getFullName(),
      };
    }

    return dto;
  }

  private async calculateAttendancePercentageInternal(
    estudianteId: number,
    asignacionId: number,
  ): Promise<AttendancePercentageDto> {
    const attendances = await this.attendanceRepository.find({
      where: { estudianteId, asignacionId },
    });

    const total = attendances.length;
    const asistio = attendances.filter(a => a.estatus === 'ASISTIO').length;
    const retardos = attendances.filter(a => a.estatus === 'RETARDO').length;
    const faltas = attendances.filter(a => a.estatus === 'FALTO').length;

    const porcentaje = total > 0 ? ((asistio + (retardos * 0.5)) / total) * 100 : 0;

    return {
      porcentaje: Math.round(porcentaje * 100) / 100,
      asistencias: asistio,
      faltas,
      retardos,
      total,
    };
  }

  private mapAttendanceToDto(attendance: Attendance): AttendanceResponseDto {
    const dto: AttendanceResponseDto = {
      id: attendance.id,
      estudianteId: attendance.estudianteId,
      asignacionId: attendance.asignacionId,
      fecha: attendance.fecha,
      estatus: attendance.estatus as any,
      llegoTarde: attendance.llegoTarde,
      comentarios: attendance.comentarios,
    };

    if (attendance.estudiante) {
      dto.estudiante = {
        id: attendance.estudiante.id,
        matricula: attendance.estudiante.matricula,
        nombreCompleto: attendance.estudiante.usuario.getFullName(),
        porcentajeAsistencia: 0,
      };
    }

    return dto;
  }

  // ==================== MÉTODOS PARA OTROS MÓDULOS ====================

  /**
   * Buscar un docente por ID
   * Método usado por teacher-availability, teacher-bank-info, teacher-documents
   */
  async findOne(id: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!teacher) {
      throw new NotFoundException(`Docente con ID ${id} no encontrado`);
    }

    return teacher;
  }

  /**
   * Marcar que el docente completó el formulario de disponibilidad
   * Usado por teacher-availability
   */
  async markFormularioCompleto(docenteId: number): Promise<void> {
    const teacher = await this.findOne(docenteId);
    
    teacher.haCompletadoFormulario = true;
    
    await this.teacherRepository.save(teacher);
  }

  /**
   * Marcar que el docente proporcionó sus datos bancarios
   * Usado por teacher-bank-info
   */
  async markDatosBancariosCompletos(docenteId: number): Promise<void> {
    const teacher = await this.findOne(docenteId);
    
    teacher.haProporcionadoDatosBancarios = true;
    
    await this.teacherRepository.save(teacher);
  }

  /**
   * Marcar que el docente subió todos sus documentos
   * Usado por teacher-documents
   */
  async markDocumentosCompletos(docenteId: number): Promise<void> {
    const teacher = await this.findOne(docenteId);
    
    teacher.haSubidoDocumentos = true;
    
    await this.teacherRepository.save(teacher);
  }
}