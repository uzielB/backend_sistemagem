import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { TeachersService } from './teachers.service';
import {
  TeacherScheduleResponseDto,
  StudentListResponseDto,
  GetTeacherStudentsDto,
  MyAssignmentsResponseDto,
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

@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DOCENTE)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  // ==================== HORARIOS Y LISTAS ====================

  @Get('horarios')
  async getSchedule(@Request() req): Promise<TeacherScheduleResponseDto[]> {
    const usuarioId = req.user.id;
    return this.teachersService.getTeacherSchedule(usuarioId);
  }

  @Get('mis-asignaciones')
  async getMyAssignments(@Request() req): Promise<MyAssignmentsResponseDto> {
    const usuarioId = req.user.id;
    return this.teachersService.getMyAssignments(usuarioId);
  }

  @Get('alumnos')
  async getStudents(
    @Request() req,
    @Query() query: GetTeacherStudentsDto,
  ): Promise<StudentListResponseDto[]> {
    const usuarioId = req.user.id;
    return this.teachersService.getTeacherStudents(usuarioId, query);
  }

  // ==================== CALIFICACIONES ====================

  @Post('calificaciones')
  @HttpCode(HttpStatus.CREATED)
  async saveGrade(
    @Request() req,
    @Body() dto: SaveGradeDto,
  ): Promise<GradeResponseDto> {
    const usuarioId = req.user.id;
    return this.teachersService.saveGrade(usuarioId, dto);
  }

  @Post('calificaciones/masivas')
  @HttpCode(HttpStatus.CREATED)
  async saveBulkGrades(
    @Request() req,
    @Body() dto: SaveBulkGradesDto,
  ): Promise<{ guardadas: number; calificaciones: GradeResponseDto[] }> {
    const usuarioId = req.user.id;
    return this.teachersService.saveBulkGrades(usuarioId, dto);
  }

  @Get('calificaciones')
  async getGrades(
    @Request() req,
    @Query() query: GetGradesDto,
  ): Promise<GradeResponseDto[]> {
    const usuarioId = req.user.id;
    return this.teachersService.getGrades(usuarioId, query);
  }

  @Put('calificaciones/:id')
  async updateGrade(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<SaveGradeDto>,
  ): Promise<GradeResponseDto> {
    const usuarioId = req.user.id;
    return this.teachersService.updateGrade(usuarioId, id, dto);
  }

  @Delete('calificaciones/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGrade(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const usuarioId = req.user.id;
    await this.teachersService.deleteGrade(usuarioId, id);
  }

  // ==================== ASISTENCIAS ====================

  @Post('asistencias')
  @HttpCode(HttpStatus.CREATED)
  async saveAttendance(
    @Request() req,
    @Body() dto: SaveAttendanceDto,
  ): Promise<AttendanceResponseDto> {
    const usuarioId = req.user.id;
    return this.teachersService.saveAttendance(usuarioId, dto);
  }

  @Post('asistencias/masivas')
  @HttpCode(HttpStatus.CREATED)
  async saveBulkAttendances(
    @Request() req,
    @Body() dto: SaveBulkAttendancesDto,
  ): Promise<{ registradas: number; asistencias: AttendanceResponseDto[] }> {
    const usuarioId = req.user.id;
    return this.teachersService.saveBulkAttendances(usuarioId, dto);
  }

  @Get('asistencias')
  async getAttendances(
    @Request() req,
    @Query() query: GetAttendancesDto,
  ): Promise<AttendanceResponseDto[]> {
    const usuarioId = req.user.id;
    return this.teachersService.getAttendances(usuarioId, query);
  }

  @Put('asistencias/:id')
  async updateAttendance(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<SaveAttendanceDto>,
  ): Promise<AttendanceResponseDto> {
    const usuarioId = req.user.id;
    return this.teachersService.updateAttendance(usuarioId, id, dto);
  }

  @Delete('asistencias/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAttendance(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const usuarioId = req.user.id;
    await this.teachersService.deleteAttendance(usuarioId, id);
  }

  @Get('asistencias/porcentaje/:estudianteId/:asignacionId')
  async getAttendancePercentage(
    @Request() req,
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Param('asignacionId', ParseIntPipe) asignacionId: number,
  ): Promise<AttendancePercentageDto> {
    const usuarioId = req.user.id;
    return this.teachersService.calculateAttendancePercentage(
      usuarioId,
      estudianteId,
      asignacionId,
    );
  }
}