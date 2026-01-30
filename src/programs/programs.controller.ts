import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { Modalidad } from './entities/program.entity';

/**
 * Controlador de Programs (Programas Académicos)
 * Catálogo de carreras/licenciaturas
 * 
 * Rutas base: /api/programs
 */
@Controller('programs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  /**
   * POST /api/programs
   * Crea un nuevo programa académico
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProgramDto: CreateProgramDto) {
    const program = await this.programsService.create(createProgramDto);

    return {
      message: 'Programa académico creado exitosamente',
      data: program,
    };
  }

  /**
   * GET /api/programs
   * Obtiene todos los programas
   * Query params opcionales: ?modalidad=ESCOLARIZADO&activeOnly=true
   * 
   * Requiere autenticación
   */
  @Get()
  async findAll(
    @Query('modalidad') modalidad?: Modalidad,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const onlyActive = activeOnly === 'true';
    const programs = await this.programsService.findAll(modalidad, onlyActive);

    return {
      message: 'Programas académicos obtenidos exitosamente',
      data: programs,
      count: programs.length,
    };
  }

  /**
   * GET /api/programs/statistics
   * Obtiene estadísticas de programas
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Get('statistics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getStatistics() {
    const statistics = await this.programsService.getStatistics();

    return {
      message: 'Estadísticas obtenidas exitosamente',
      data: statistics,
    };
  }

  /**
   * GET /api/programs/by-modalidad/:modalidad
   * Obtiene programas por modalidad
   * 
   * Requiere autenticación
   */
  @Get('by-modalidad/:modalidad')
  async findByModalidad(@Param('modalidad') modalidad: Modalidad) {
    const programs = await this.programsService.findByModalidad(modalidad);

    return {
      message: `Programas de modalidad ${modalidad} obtenidos exitosamente`,
      data: programs,
      count: programs.length,
    };
  }

  /**
   * GET /api/programs/by-codigo/:codigo
   * Busca un programa por su código
   * 
   * Requiere autenticación
   */
  @Get('by-codigo/:codigo')
  async findByCodigo(@Param('codigo') codigo: string) {
    const program = await this.programsService.findByCodigo(codigo);

    return {
      message: 'Programa encontrado',
      data: program,
    };
  }

  /**
   * GET /api/programs/:id
   * Obtiene un programa por ID
   * 
   * Requiere autenticación
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const program = await this.programsService.findOne(id);

    return {
      message: 'Programa encontrado',
      data: program,
    };
  }

  /**
   * PATCH /api/programs/:id
   * Actualiza un programa académico
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProgramDto: UpdateProgramDto,
  ) {
    const program = await this.programsService.update(id, updateProgramDto);

    return {
      message: 'Programa académico actualizado exitosamente',
      data: program,
    };
  }

  /**
   * PATCH /api/programs/:id/deactivate
   * Desactiva un programa
   * 
   * Requiere rol: SUPER_ADMIN
   */
  @Patch(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN)
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    const program = await this.programsService.deactivate(id);

    return {
      message: 'Programa desactivado exitosamente',
      data: program,
    };
  }

  /**
   * PATCH /api/programs/:id/activate
   * Reactiva un programa
   * 
   * Requiere rol: SUPER_ADMIN
   */
  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN)
  async activate(@Param('id', ParseIntPipe) id: number) {
    const program = await this.programsService.activate(id);

    return {
      message: 'Programa reactivado exitosamente',
      data: program,
    };
  }

  /**
   * DELETE /api/programs/:id
   * Elimina un programa
   * 
   * Requiere rol: SUPER_ADMIN
   */
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.programsService.remove(id);

    return {
      message: 'Programa eliminado permanentemente',
    };
  }
}