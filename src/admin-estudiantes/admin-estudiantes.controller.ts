/* eslint-disable prettier/prettier */
import { Controller, Post, Get, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AdminEstudiantesService } from './admin-estudiantes.service';
import { InscribirEstudianteDto } from './dto/inscribir-estudiante.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';

// Si NO existe, comentar la línea que dice @GetUser()

@Controller('admin/estudiantes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AdminEstudiantesController {
  
  constructor(
    private readonly adminEstudiantesService: AdminEstudiantesService
  ) {}

  @Post('inscribir')
  async inscribirEstudiante(
    @Body() dto: InscribirEstudianteDto,
    // ⚠️ Si NO tienes GetUser decorator, comenta esta línea:
    // @GetUser() user: User
  ) {
    console.log('');
    console.log('========================================');
    console.log('📚 POST /api/admin/estudiantes/inscribir');
    console.log('========================================');

    const adminId = 1; // user?.id || 1;
    const result = await this.adminEstudiantesService.inscribirEstudiante(dto, adminId);

    return {
      success: true,
      message: '¡Listo! Alumno inscrito exitosamente',
      data: {
        estudiante: {
          id: result.estudiante.id,
          matricula: result.estudiante.matricula,
          curp: result.estudiante.curp,
          programaId: result.estudiante.programaId,
          modalidad: result.estudiante.modalidad
        },
        estadoFinanciero: {
          id: result.estadoFinanciero.id,
          totalSemestre: result.estadoFinanciero.totalSemestre,
          porcentajeBecaAplicado: result.estadoFinanciero.porcentajeBecaAplicado,
          numeroPagos: result.estadoFinanciero.numeroPagos
        },
        totalPagosGenerados: result.pagos.length
      }
    };
  }

  @Get()
  async obtenerTodos() {
    const estudiantes = await this.adminEstudiantesService.obtenerTodos();
    return { success: true, data: estudiantes };
  }

  @Get(':id')
  async obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    const estudiante = await this.adminEstudiantesService.obtenerPorId(id);
    return { success: true, data: estudiante };
  }
}