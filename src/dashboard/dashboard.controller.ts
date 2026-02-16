import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardResponseDto, DashboardFiltersDto } from './dto/dashboard.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

/**
 * Controlador del Dashboard SuperAdmin
 * Endpoints para obtener métricas e indicadores del sistema
 */
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Obtener todas las métricas del dashboard
   * GET /dashboard
   * 
   * @returns Métricas completas del sistema
   */
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getDashboardMetrics(
    @Query('periodoEscolarId') periodoEscolarId?: number,
  ): Promise<DashboardResponseDto> {
    const filters: DashboardFiltersDto = {};
    
    if (periodoEscolarId) {
      filters.periodoEscolarId = Number(periodoEscolarId);
    }

    return this.dashboardService.getDashboardMetrics(filters);
  }
}