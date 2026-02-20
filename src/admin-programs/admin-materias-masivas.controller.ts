import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Body,
  ParseIntPipe,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AdminMateriasMasivasService } from './admin-materias-masivas.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
/**
 * Controlador para carga masiva de materias con PDFs
 * Rutas: /api/admin/materias-masivas/*
 */
@Controller('admin/materias-masivas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AdminMateriasMasivasController {
  constructor(
    private readonly adminMateriasMasivasService: AdminMateriasMasivasService
  ) {}

  /**
   * Subir múltiples PDFs y crear materias automáticamente
   * POST /admin/materias-masivas/programa/:programaId
   */
  @Post('programa/:programaId')
  @UseInterceptors(
    FilesInterceptor('files', 200, {
      storage: diskStorage({
        destination: './uploads/temarios',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `materia-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          return callback(
            new BadRequestException('Solo se permiten archivos PDF'),
            false
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    })
  )
  async uploadMateriasMasivas(
    @Param('programaId', ParseIntPipe) programaId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('periodoEscolarId') periodoEscolarId: string,
    @Request() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se recibieron archivos');
    }

    if (!periodoEscolarId) {
      throw new BadRequestException('periodoEscolarId es requerido');
    }

    const userId = req.user.id;

    return this.adminMateriasMasivasService.uploadMateriasMasivas(
      programaId,
      parseInt(periodoEscolarId),
      files,
      userId
    );
  }

  /**
   * ✅ NUEVO: Eliminar materia
   * DELETE /admin/materias-masivas/materia/:materiaId
   */
  @Delete('materia/:materiaId')
  async deleteMateria(
    @Param('materiaId', ParseIntPipe) materiaId: number
  ) {
    return this.adminMateriasMasivasService.deleteMateria(materiaId);
  }

  /**
   * Obtener estadísticas de materias de un programa
   * GET /admin/materias-masivas/programa/:programaId/stats
   */
  @Get('programa/:programaId/stats')
  async getProgramaStats(
    @Param('programaId', ParseIntPipe) programaId: number
  ) {
    return this.adminMateriasMasivasService.getProgramaStats(programaId);
  }
}