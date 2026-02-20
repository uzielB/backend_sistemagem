import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AdminProgramsService } from './admin-programs.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
@Controller('admin/programs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AdminProgramsController {
  constructor(private readonly adminProgramsService: AdminProgramsService) {}

  /**
   * Obtener todos los programas
   * GET /admin/programs
   */
  @Get()
  async getAllPrograms(
    @Query('modalidad') modalidad?: string,
    @Query('estaActivo') estaActivo?: string,
  ) {
    const filters: any = {};

    if (modalidad) {
      filters.modalidad = modalidad;
    }

    if (estaActivo !== undefined) {
      filters.estaActivo = estaActivo === 'true';
    }

    return this.adminProgramsService.getAllPrograms(filters);
  }

  /**
   * Obtener detalle de un programa
   * GET /admin/programs/:id
   */
  @Get(':id')
  async getProgramDetail(@Param('id', ParseIntPipe) id: number) {
    return this.adminProgramsService.getProgramDetail(id);
  }

  /**
   * Obtener materias de un programa
   * GET /admin/programs/:programId/materias
   * ✅ CORREGIDO: getMateriasByPrograma
   */
  @Get(':programId/materias')
  async getMateriasByPrograma(
    @Param('programId', ParseIntPipe) programId: number,
    @Query('semestre') semestre?: string,
    @Query('tieneTemario') tieneTemario?: string,
  ) {
    const filters: any = {};

    if (semestre) {
      filters.semestre = parseInt(semestre);
    }

    if (tieneTemario !== undefined) {
      filters.tieneTemario = tieneTemario === 'true';
    }

    return this.adminProgramsService.getMateriasByPrograma(programId, filters);
  }

  // ❌ MÉTODOS DE DOCENTES COMENTADOS TEMPORALMENTE
  // Estos métodos deben estar en un controller separado de docentes
  // o agregarse al service si son necesarios

  /*
  @Get('docentes')
  async getAllDocentes(
    @Query('especialidad') especialidad?: string,
    @Query('estaActivo') estaActivo?: string,
  ) {
    const filters: any = {};

    if (especialidad) {
      filters.especialidad = especialidad;
    }

    if (estaActivo !== undefined) {
      filters.estaActivo = estaActivo === 'true';
    }

    return this.adminProgramsService.getAllDocentes(filters);
  }

  @Get('docentes/:id')
  async getDocenteDetail(@Param('id', ParseIntPipe) id: number) {
    return this.adminProgramsService.getDocenteDetail(id);
  }
  */
}