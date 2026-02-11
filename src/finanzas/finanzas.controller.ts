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
  ParseIntPipe
} from '@nestjs/common';
import { FinanzasService } from './finanzas.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { EstatusPago } from './entities/pago.entity';

@Controller('finanzas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanzasController {
  constructor(private readonly finanzasService: FinanzasService) {}

  // ==========================================
  // CONCEPTOS DE PAGO (Todos los roles autenticados)
  // ==========================================

  @Get('conceptos')
  async findAllConceptos() {
    const conceptos = await this.finanzasService.findAllConceptos();
    return {
      success: true,
      data: conceptos
    };
  }

  // ==========================================
  // PAGOS - ADMIN (CRUD COMPLETO)
  // ==========================================

  @Get('pagos')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async findAllPagos(
    @Query('estudiante_id') estudianteId?: number,
    @Query('estatus') estatus?: EstatusPago,
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
  ) {
    const pagos = await this.finanzasService.findAllPagos({
      estudiante_id: estudianteId,
      estatus,
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta
    });

    return {
      success: true,
      data: pagos,
      total: pagos.length
    };
  }

  @Get('pagos/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async findOnePago(@Param('id', ParseIntPipe) id: number) {
    const pago = await this.finanzasService.findOnePago(id);
    return {
      success: true,
      data: pago
    };
  }

  @Post('pagos')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async createPago(@Body() createPagoDto: CreatePagoDto, @Request() req) {
    console.log('📝 Creando pago...');
    console.log('Usuario autenticado:', req.user);
    console.log('Datos del pago:', createPagoDto);

    const pago = await this.finanzasService.createPago(createPagoDto, req.user.userId);
    
    console.log('✅ Pago creado exitosamente:', pago.id);

    return {
      success: true,
      data: pago,
      message: 'Pago creado exitosamente'
    };
  }

  @Put('pagos/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updatePago(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePagoDto: UpdatePagoDto
  ) {
    const pago = await this.finanzasService.updatePago(id, updatePagoDto);
    return {
      success: true,
      data: pago,
      message: 'Pago actualizado exitosamente'
    };
  }

  @Delete('pagos/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async removePago(@Param('id', ParseIntPipe) id: number) {
    await this.finanzasService.removePago(id);
    return {
      success: true,
      message: 'Pago eliminado exitosamente'
    };
  }

  // ==========================================
  // PAGOS - ALUMNO (SOLO LECTURA)
  // ==========================================

  @Get('mis-pagos')
  @Roles(UserRole.ALUMNO)
  async getMisPagos(@Request() req, @Query('estatus') estatus?: EstatusPago) {
    // ✅ CORRECCIÓN: Usar userId en lugar de estudianteId
    // El token JWT contiene userId, no estudianteId
    const estudianteId = req.user.userId;
    
    console.log('🔍 Usuario autenticado:', req.user);
    console.log('🔍 Buscando pagos del estudiante ID:', estudianteId);
    
    const pagos = await this.finanzasService.findPagosByEstudiante(estudianteId, estatus);
    
    console.log('📥 Pagos encontrados:', pagos.length);
    
    return {
      success: true,
      data: pagos,
      total: pagos.length
    };
  }

  // ==========================================
  // BECAS
  // ==========================================

  @Get('becas/estudiante/:estudianteId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ALUMNO)
  async getBecaEstudiante(@Param('estudianteId', ParseIntPipe) estudianteId: number) {
    const beca = await this.finanzasService.findBecaActivaByEstudiante(estudianteId);
    return {
      success: true,
      data: beca
    };
  }
}