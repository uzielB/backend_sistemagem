/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FinanzasService } from './finanzas.service';

// ✅ RUTAS CORRECTAS (en common/):
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@Controller('finanzas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanzasController {
  constructor(private readonly finanzasService: FinanzasService) {}

  @Get('pagos')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async obtenerTodosPagos() {
    console.log('📊 GET /api/finanzas/pagos');
    
    const pagos = await this.finanzasService.obtenerTodosPagos();
    
    return {
      success: true,
      data: pagos
    };
  }

  @Get('estudiante/:estudianteId/periodo/:periodoId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ALUMNO)
  async obtenerEstadoFinanciero(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Param('periodoId', ParseIntPipe) periodoId: number
  ) {
    console.log(`📊 GET /api/finanzas/estudiante/${estudianteId}/periodo/${periodoId}`);
    
    const estado = await this.finanzasService.obtenerEstadoFinanciero(
      estudianteId,
      periodoId
    );
    
    if (!estado) {
      return {
        success: false,
        message: 'No se encontró información financiera'
      };
    }
    
    return {
      success: true,
      data: estado
    };
  }

  @Post('pagos/:pagoId/registrar')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async registrarPago(
    @Param('pagoId', ParseIntPipe) pagoId: number,
    @Body() body: { metodoPago: string; fechaPago?: string }
  ) {
    console.log(`💵 POST /api/finanzas/pagos/${pagoId}/registrar`);
    console.log('Body:', body);
    
    const fechaPago = body.fechaPago ? new Date(body.fechaPago) : new Date();
    
    const result = await this.finanzasService.registrarPago(
      pagoId,
      body.metodoPago,
      fechaPago
    );
    
    return {
      success: true,
      message: 'Pago registrado exitosamente',
      data: result
    };
  }

  @Post('actualizar-vencidos')
  @Roles(UserRole.SUPER_ADMIN)
  async actualizarPagosVencidos() {
    console.log('🔄 POST /api/finanzas/actualizar-vencidos');
    
    const afectados = await this.finanzasService.actualizarPagosVencidos();
    
    return {
      success: true,
      message: `${afectados} pagos actualizados a VENCIDO`
    };
  }
}