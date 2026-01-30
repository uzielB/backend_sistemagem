import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { TeacherBankInfoService } from './teacher-bank-info.service';
import { CreateTeacherBankInfoDto } from './dto/create-teacher-bank-info.dto';
import { UpdateTeacherBankInfoDto } from './dto/update-teacher-bank-info.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

/**
 * Controlador de TeacherBankInfo (Datos Bancarios de Docentes)
 * 
 * Rutas base: /api/teacher-bank-info
 */
@Controller('teacher-bank-info')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeacherBankInfoController {
  constructor(private readonly bankInfoService: TeacherBankInfoService) {}

  /**
   * POST /api/teacher-bank-info
   * Crea datos bancarios
   * 
   * Requiere rol: SUPER_ADMIN, ADMIN o DOCENTE
   */
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCENTE)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBankInfoDto: CreateTeacherBankInfoDto) {
    const bankInfo = await this.bankInfoService.create(createBankInfoDto);

    return {
      message: 'Datos bancarios creados exitosamente',
      data: bankInfo,
    };
  }

  /**
   * GET /api/teacher-bank-info
   * Obtiene todos los registros
   * Query param: ?validadoOnly=true
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findAll(@Query('validadoOnly') validadoOnly?: string) {
    const onlyValidated = validadoOnly === 'true';
    const bankInfos = await this.bankInfoService.findAll(onlyValidated);

    return {
      message: 'Datos bancarios obtenidos exitosamente',
      data: bankInfos,
      count: bankInfos.length,
    };
  }

  /**
   * GET /api/teacher-bank-info/statistics
   * Obtiene estadísticas
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Get('statistics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getStatistics() {
    const statistics = await this.bankInfoService.getStatistics();

    return {
      message: 'Estadísticas obtenidas exitosamente',
      data: statistics,
    };
  }

  /**
   * GET /api/teacher-bank-info/unvalidated
   * Obtiene datos sin validar
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Get('unvalidated')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findUnvalidated() {
    const bankInfos = await this.bankInfoService.findUnvalidated();

    return {
      message: 'Datos bancarios sin validar obtenidos exitosamente',
      data: bankInfos,
      count: bankInfos.length,
    };
  }

  /**
   * GET /api/teacher-bank-info/by-teacher/:docenteId
   * Obtiene datos por docente
   * 
   * Requiere rol: SUPER_ADMIN, ADMIN o DOCENTE
   */
  @Get('by-teacher/:docenteId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCENTE)
  async findByTeacher(@Param('docenteId', ParseIntPipe) docenteId: number) {
    const bankInfo = await this.bankInfoService.findByTeacher(docenteId);

    if (!bankInfo) {
      return {
        message: 'El docente no tiene datos bancarios registrados',
        data: null,
      };
    }

    return {
      message: 'Datos bancarios del docente obtenidos exitosamente',
      data: bankInfo,
    };
  }

  /**
   * GET /api/teacher-bank-info/:id
   * Obtiene un registro por ID
   * 
   * Requiere autenticación
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const bankInfo = await this.bankInfoService.findOne(id);

    return {
      message: 'Datos bancarios encontrados',
      data: bankInfo,
    };
  }

  /**
   * PATCH /api/teacher-bank-info/:id
   * Actualiza datos bancarios
   * 
   * Requiere rol: SUPER_ADMIN, ADMIN o DOCENTE
   */
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCENTE)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBankInfoDto: UpdateTeacherBankInfoDto,
  ) {
    const bankInfo = await this.bankInfoService.update(id, updateBankInfoDto);

    return {
      message: 'Datos bancarios actualizados exitosamente',
      data: bankInfo,
    };
  }

  /**
   * PATCH /api/teacher-bank-info/:id/validate
   * Valida los datos bancarios
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Patch(':id/validate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async validate(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const bankInfo = await this.bankInfoService.validate(id, req.user.id);

    return {
      message: 'Datos bancarios validados exitosamente',
      data: bankInfo,
    };
  }

  /**
   * PATCH /api/teacher-bank-info/:id/invalidate
   * Invalida los datos bancarios
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Patch(':id/invalidate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async invalidate(@Param('id', ParseIntPipe) id: number) {
    const bankInfo = await this.bankInfoService.invalidate(id);

    return {
      message: 'Datos bancarios marcados como no validados',
      data: bankInfo,
    };
  }

  /**
   * DELETE /api/teacher-bank-info/:id
   * Elimina datos bancarios
   * 
   * Requiere rol: SUPER_ADMIN
   */
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.bankInfoService.remove(id);

    return {
      message: 'Datos bancarios eliminados permanentemente',
    };
  }
}