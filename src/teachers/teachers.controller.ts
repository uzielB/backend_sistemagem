import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

/**
 * Controlador de Teachers (Docentes)
 * Rutas protegidas con autenticación JWT y control de roles
 * 
 * Rutas base: /api/teachers
 */
@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard) 
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  /**
   * POST /api/teachers
   * Crea un nuevo perfil de docente
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTeacherDto: CreateTeacherDto) {
    const teacher = await this.teachersService.create(createTeacherDto);

    return {
      message: 'Docente creado exitosamente',
      data: teacher,
    };
  }

  /**
   * GET /api/teachers
   * Obtiene todos los docentes
   * Query param opcional: ?activeOnly=true
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findAll(@Query('activeOnly') activeOnly?: string) {
    const onlyActive = activeOnly === 'true';
    const teachers = await this.teachersService.findAll(onlyActive);

    return {
      message: 'Docentes obtenidos exitosamente',
      data: teachers,
      count: teachers.length,
    };
  }

  /**
   * GET /api/teachers/statistics
   * Obtiene estadísticas de docentes
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Get('statistics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getStatistics() {
    const statistics = await this.teachersService.getStatistics();

    return {
      message: 'Estadísticas obtenidas exitosamente',
      data: statistics,
    };
  }

  /**
   * GET /api/teachers/incomplete-profiles
   * Obtiene docentes con perfiles incompletos
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Get('incomplete-profiles')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getIncompleteProfiles() {
    const teachers = await this.teachersService.findIncompleteProfiles();

    return {
      message: 'Docentes con perfiles incompletos obtenidos exitosamente',
      data: teachers,
      count: teachers.length,
    };
  }

  /**
   * GET /api/teachers/by-user/:usuarioId
   * Busca un docente por el ID de su usuario
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Get('by-user/:usuarioId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findByUserId(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    const teacher = await this.teachersService.findByUserId(usuarioId);

    return {
      message: 'Docente encontrado',
      data: teacher,
    };
  }

  /**
   * GET /api/teachers/by-empleado/:numeroEmpleado
   * Busca un docente por su número de empleado
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Get('by-empleado/:numeroEmpleado')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findByNumeroEmpleado(@Param('numeroEmpleado') numeroEmpleado: string) {
    const teacher = await this.teachersService.findByNumeroEmpleado(numeroEmpleado);

    return {
      message: 'Docente encontrado',
      data: teacher,
    };
  }

  /**
   * GET /api/teachers/:id
   * Obtiene un docente por su ID
   * 
   * Requiere autenticación (cualquier rol autenticado)
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const teacher = await this.teachersService.findOne(id);

    return {
      message: 'Docente encontrado',
      data: teacher,
    };
  }

  /**
   * PATCH /api/teachers/:id
   * Actualiza los datos de un docente
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    const teacher = await this.teachersService.update(id, updateTeacherDto);

    return {
      message: 'Docente actualizado exitosamente',
      data: teacher,
    };
  }

  /**
   * PATCH /api/teachers/:id/mark-formulario-completo
   * Marca el formulario de disponibilidad como completado
   * 
   * Requiere rol: SUPER_ADMIN, ADMIN o DOCENTE (el mismo docente)
   */
  @Patch(':id/mark-formulario-completo')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCENTE)
  async markFormularioCompleto(@Param('id', ParseIntPipe) id: number) {
    const teacher = await this.teachersService.markFormularioCompleto(id);

    return {
      message: 'Formulario marcado como completado',
      data: teacher,
    };
  }

  /**
   * PATCH /api/teachers/:id/mark-documentos-completos
   * Marca los documentos como completos
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Patch(':id/mark-documentos-completos')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async markDocumentosCompletos(@Param('id', ParseIntPipe) id: number) {
    const teacher = await this.teachersService.markDocumentosCompletos(id);

    return {
      message: 'Documentos marcados como completos',
      data: teacher,
    };
  }

  /**
   * PATCH /api/teachers/:id/mark-datos-bancarios-completos
   * Marca los datos bancarios como proporcionados
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Patch(':id/mark-datos-bancarios-completos')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async markDatosBancariosCompletos(@Param('id', ParseIntPipe) id: number) {
    const teacher = await this.teachersService.markDatosBancariosCompletos(id);

    return {
      message: 'Datos bancarios marcados como proporcionados',
      data: teacher,
    };
  }

  /**
   * PATCH /api/teachers/:id/deactivate
   * Desactiva un docente (baja lógica)
   * 
   * Requiere rol: SUPER_ADMIN
   */
  @Patch(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN)
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    const teacher = await this.teachersService.deactivate(id);

    return {
      message: 'Docente desactivado exitosamente',
      data: teacher,
    };
  }

  /**
   * PATCH /api/teachers/:id/activate
   * Reactiva un docente previamente desactivado
   * 
   * Requiere rol: SUPER_ADMIN
   */
  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN)
  async activate(@Param('id', ParseIntPipe) id: number) {
    const teacher = await this.teachersService.activate(id);

    return {
      message: 'Docente reactivado exitosamente',
      data: teacher,
    };
  }

  /**
   * DELETE /api/teachers/:id
   * Elimina permanentemente un docente (baja física)
   * 
   * Requiere rol: SUPER_ADMIN
   * PRECAUCIÓN: Esta operación no se puede deshacer
   */
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.teachersService.remove(id);

    return {
      message: 'Docente eliminado permanentemente',
    };
  }
}