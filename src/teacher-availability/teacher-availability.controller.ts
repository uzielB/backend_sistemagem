import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { TeacherAvailabilityService } from './teacher-availability.service';
import { CreateTeacherAvailabilityDto } from './dto/create-teacher-availability.dto';
import { UpdateTeacherAvailabilityDto } from './dto/update-teacher-availability.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { EstatusDisponibilidad } from './entities/teacher-availability.entity';

/**
 * Controlador de TeacherAvailability (Disponibilidad Horaria de Docentes)
 * 
 * Rutas base: /api/teacher-availability
 */
@Controller('teacher-availability')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeacherAvailabilityController {
  constructor(
    private readonly availabilityService: TeacherAvailabilityService,
  ) {}

  /**
   * POST /api/teacher-availability
   * Crea una nueva disponibilidad horaria
   * 
   * Requiere rol: SUPER_ADMIN, ADMIN o DOCENTE
   */
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCENTE)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAvailabilityDto: CreateTeacherAvailabilityDto) {
    const availability = await this.availabilityService.create(
      createAvailabilityDto,
    );

    return {
      message: 'Disponibilidad horaria creada exitosamente',
      data: availability,
    };
  }

  /**
   * GET /api/teacher-availability
   * Obtiene todas las disponibilidades
   * Query params: ?periodoEscolarId=1&estatus=PENDIENTE
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findAll(
    @Query('periodoEscolarId') periodoEscolarId?: string,
    @Query('estatus') estatus?: EstatusDisponibilidad,
  ) {
    const periodoId = periodoEscolarId ? parseInt(periodoEscolarId) : undefined;
    const availabilities = await this.availabilityService.findAll(
      periodoId,
      estatus,
    );

    return {
      message: 'Disponibilidades obtenidas exitosamente',
      data: availabilities,
      count: availabilities.length,
    };
  }

  /**
   * GET /api/teacher-availability/statistics
   * Obtiene estadísticas de disponibilidades
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Get('statistics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getStatistics() {
    const statistics = await this.availabilityService.getStatistics();

    return {
      message: 'Estadísticas obtenidas exitosamente',
      data: statistics,
    };
  }

  /**
   * GET /api/teacher-availability/pending
   * Obtiene disponibilidades pendientes de revisión
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Get('pending')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findPending() {
    const availabilities = await this.availabilityService.findPending();

    return {
      message: 'Disponibilidades pendientes obtenidas exitosamente',
      data: availabilities,
      count: availabilities.length,
    };
  }

  /**
   * GET /api/teacher-availability/by-teacher/:docenteId
   * Obtiene disponibilidades por docente
   * 
   * Requiere rol: SUPER_ADMIN, ADMIN o DOCENTE (el mismo)
   */
  @Get('by-teacher/:docenteId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCENTE)
  async findByTeacher(@Param('docenteId', ParseIntPipe) docenteId: number) {
    const availabilities = await this.availabilityService.findByTeacher(docenteId);

    return {
      message: 'Disponibilidades del docente obtenidas exitosamente',
      data: availabilities,
      count: availabilities.length,
    };
  }

  /**
   * GET /api/teacher-availability/:id
   * Obtiene una disponibilidad por ID
   * 
   * Requiere autenticación
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const availability = await this.availabilityService.findOne(id);

    return {
      message: 'Disponibilidad encontrada',
      data: availability,
    };
  }

  /**
   * PATCH /api/teacher-availability/:id
   * Actualiza una disponibilidad horaria
   * 
   * Requiere rol: SUPER_ADMIN, ADMIN o DOCENTE
   */
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCENTE)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAvailabilityDto: UpdateTeacherAvailabilityDto,
  ) {
    const availability = await this.availabilityService.update(
      id,
      updateAvailabilityDto,
    );

    return {
      message: 'Disponibilidad actualizada exitosamente',
      data: availability,
    };
  }

  /**
   * PATCH /api/teacher-availability/:id/mark-reviewed
   * Marca una disponibilidad como revisada
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Patch(':id/mark-reviewed')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async markAsReviewed(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() body: { comentarios?: string },
  ) {
    const availability = await this.availabilityService.markAsReviewed(
      id,
      req.user.id,
      body.comentarios,
    );

    return {
      message: 'Disponibilidad marcada como revisada',
      data: availability,
    };
  }

  /**
   * PATCH /api/teacher-availability/:id/mark-approved
   * Marca una disponibilidad como aprobada
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Patch(':id/mark-approved')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async markAsApproved(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() body: { comentarios?: string },
  ) {
    const availability = await this.availabilityService.markAsApproved(
      id,
      req.user.id,
      body.comentarios,
    );

    return {
      message: 'Disponibilidad marcada como aprobada',
      data: availability,
    };
  }

  /**
   * DELETE /api/teacher-availability/:id
   * Elimina una disponibilidad
   * 
   * Requiere rol: SUPER_ADMIN
   */
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.availabilityService.remove(id);

    return {
      message: 'Disponibilidad eliminada permanentemente',
    };
  }
}