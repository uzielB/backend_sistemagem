import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { SchoolPeriodsService } from './school-periods.service';
import { CreateSchoolPeriodDto } from './dto/create-school-period.dto';
import { UpdateSchoolPeriodDto } from './dto/update-school-period.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

/**
 * Controlador de SchoolPeriods (Periodos Escolares)
 * 
 * Rutas base: /api/school-periods
 */
@Controller('school-periods')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolPeriodsController {
  constructor(private readonly schoolPeriodsService: SchoolPeriodsService) {}

  /**
   * POST /api/school-periods
   * Crea un nuevo periodo escolar
   * 
   * Requiere rol: SUPER_ADMIN
   */
  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSchoolPeriodDto: CreateSchoolPeriodDto) {
    const schoolPeriod = await this.schoolPeriodsService.create(createSchoolPeriodDto);

    return {
      message: 'Periodo escolar creado exitosamente',
      data: schoolPeriod,
    };
  }

  /**
   * GET /api/school-periods
   * Obtiene todos los periodos escolares
   * Query param opcional: ?activeOnly=true
   * 
   * Requiere autenticación
   */
  @Get()
  async findAll(@Query('activeOnly') activeOnly?: string) {
    const onlyActive = activeOnly === 'true';
    const schoolPeriods = await this.schoolPeriodsService.findAll(onlyActive);

    return {
      message: 'Periodos escolares obtenidos exitosamente',
      data: schoolPeriods,
      count: schoolPeriods.length,
    };
  }

  /**
   * GET /api/school-periods/current
   * Obtiene el periodo actual
   * 
   * Requiere autenticación
   */
  @Get('current')
  async findCurrent() {
    const schoolPeriod = await this.schoolPeriodsService.findCurrent();

    if (!schoolPeriod) {
      return {
        message: 'No hay periodo actual definido',
        data: null,
      };
    }

    return {
      message: 'Periodo actual obtenido exitosamente',
      data: schoolPeriod,
    };
  }

  /**
   * GET /api/school-periods/by-codigo/:codigo
   * Busca un periodo por su código
   * 
   * Requiere autenticación
   */
  @Get('by-codigo/:codigo')
  async findByCodigo(@Param('codigo') codigo: string) {
    const schoolPeriod = await this.schoolPeriodsService.findByCodigo(codigo);

    return {
      message: 'Periodo escolar encontrado',
      data: schoolPeriod,
    };
  }

  /**
   * GET /api/school-periods/:id
   * Obtiene un periodo por ID
   * 
   * Requiere autenticación
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const schoolPeriod = await this.schoolPeriodsService.findOne(id);

    return {
      message: 'Periodo escolar encontrado',
      data: schoolPeriod,
    };
  }

  /**
   * PATCH /api/school-periods/:id
   * Actualiza un periodo escolar
   * 
   * Requiere rol: SUPER_ADMIN
   */
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSchoolPeriodDto: UpdateSchoolPeriodDto,
  ) {
    const schoolPeriod = await this.schoolPeriodsService.update(id, updateSchoolPeriodDto);

    return {
      message: 'Periodo escolar actualizado exitosamente',
      data: schoolPeriod,
    };
  }

  /**
   * PATCH /api/school-periods/:id/set-current
   * Marca un periodo como actual
   * 
   * Requiere rol: SUPER_ADMIN
   */
  @Patch(':id/set-current')
  @Roles(UserRole.SUPER_ADMIN)
  async setAsCurrent(@Param('id', ParseIntPipe) id: number) {
    const schoolPeriod = await this.schoolPeriodsService.setAsCurrent(id);

    return {
      message: 'Periodo marcado como actual exitosamente',
      data: schoolPeriod,
    };
  }

  /**
   * PATCH /api/school-periods/:id/deactivate
   * Desactiva un periodo
   * 
   * Requiere rol: SUPER_ADMIN
   */
  @Patch(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN)
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    const schoolPeriod = await this.schoolPeriodsService.deactivate(id);

    return {
      message: 'Periodo desactivado exitosamente',
      data: schoolPeriod,
    };
  }

  /**
   * PATCH /api/school-periods/:id/activate
   * Reactiva un periodo
   * 
   * Requiere rol: SUPER_ADMIN
   */
  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN)
  async activate(@Param('id', ParseIntPipe) id: number) {
    const schoolPeriod = await this.schoolPeriodsService.activate(id);

    return {
      message: 'Periodo reactivado exitosamente',
      data: schoolPeriod,
    };
  }

  /**
   * DELETE /api/school-periods/:id
   * Elimina un periodo
   * 
   * Requiere rol: SUPER_ADMIN
   */
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.schoolPeriodsService.remove(id);

    return {
      message: 'Periodo eliminado permanentemente',
    };
  }
}