import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ScheduleModulesService } from './schedule-modules.service';
import { CreateScheduleModuleDto } from './dto/create-schedule-module.dto';
import { UpdateScheduleModuleDto } from './dto/update-schedule-module.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { Sistema } from './entities/schedule-module.entity';

/**
 * Controlador de ScheduleModules (Módulos Horarios)
 * Catálogo de módulos horarios
 * 
 */
@Controller('schedule-modules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScheduleModulesController {
  constructor(private readonly scheduleModulesService: ScheduleModulesService) {}

  /**
   * POST /api/schedule-modules
   * Crea un nuevo módulo horario
   * 
   * Requiere rol: SUPER_ADMIN
   */
  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createScheduleModuleDto: CreateScheduleModuleDto) {
    const scheduleModule = await this.scheduleModulesService.create(createScheduleModuleDto);

    return {
      message: 'Módulo horario creado exitosamente',
      data: scheduleModule,
    };
  }

  @Get()
  async findAll(
    @Query('sistema') sistema?: Sistema,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const onlyActive = activeOnly === 'true';
    const scheduleModules = await this.scheduleModulesService.findAll(sistema, onlyActive);

    return {
      message: 'Módulos horarios obtenidos exitosamente',
      data: scheduleModules,
      count: scheduleModules.length,
    };
  }

  /**
   * GET /api/schedule-modules/by-sistema/:sistema
   * Obtiene módulos por sistema
   * 
   * Requiere autenticación
   */
  @Get('by-sistema/:sistema')
  async findBySistema(@Param('sistema') sistema: Sistema) {
    const scheduleModules = await this.scheduleModulesService.findBySistema(sistema);

    return {
      message: `Módulos del sistema ${sistema} obtenidos exitosamente`,
      data: scheduleModules,
      count: scheduleModules.length,
    };
  }

  /**
   * GET /api/schedule-modules/:id
   * Obtiene un módulo por ID
   * 
   * Requiere autenticación
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const scheduleModule = await this.scheduleModulesService.findOne(id);

    return {
      message: 'Módulo horario encontrado',
      data: scheduleModule,
    };
  }

  /**
   * PATCH /api/schedule-modules/:id
   * Actualiza un módulo horario
   * 
   * Requiere rol: SUPER_ADMIN
   */
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScheduleModuleDto: UpdateScheduleModuleDto,
  ) {
    const scheduleModule = await this.scheduleModulesService.update(
      id,
      updateScheduleModuleDto,
    );

    return {
      message: 'Módulo horario actualizado exitosamente',
      data: scheduleModule,
    };
  }

  /**
   * PATCH /api/schedule-modules/:id/deactivate
   * Desactiva un módulo horario
   * 
   * Requiere rol: SUPER_ADMIN
   */
  @Patch(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN)
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    const scheduleModule = await this.scheduleModulesService.deactivate(id);

    return {
      message: 'Módulo horario desactivado exitosamente',
      data: scheduleModule,
    };
  }

  /**
   * PATCH /api/schedule-modules/:id/activate
   * Reactiva un módulo horario
   * 
   * Requiere rol: SUPER_ADMIN
   */
  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN)
  async activate(@Param('id', ParseIntPipe) id: number) {
    const scheduleModule = await this.scheduleModulesService.activate(id);

    return {
      message: 'Módulo horario reactivado exitosamente',
      data: scheduleModule,
    };
  }

  /**
   * DELETE /api/schedule-modules/:id
   * Elimina un módulo horario
   * 
   * Requiere rol: SUPER_ADMIN
   */
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.scheduleModulesService.remove(id);

    return {
      message: 'Módulo horario eliminado permanentemente',
    };
  }
}