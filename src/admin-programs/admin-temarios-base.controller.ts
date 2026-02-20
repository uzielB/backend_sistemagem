import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { 
  AdminTemariosBaseService, 
  CreateArchivoTemarioBaseDto, 
  UpdateArchivoTemarioBaseDto 
} from './admin-temarios-base.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/role.enum';


/**
 * Controlador para gestión de archivos de temarios base (múltiples por materia)
 * Rutas: /api/admin/temarios-base/*
 */
@Controller('admin/temarios-base')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AdminTemariosBaseController {
  constructor(private readonly adminTemariosBaseService: AdminTemariosBaseService) {}

  /**
   * Subir archivo de temario base (PDF)
   * POST /admin/temarios-base
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/temarios',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `temario-base-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          return callback(new BadRequestException('Solo se permiten archivos PDF'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    })
  )
  async uploadArchivoTemarioBase(
    @UploadedFile() file: Express.Multer.File,
    @Body('materiaId') materiaId: string,
    @Body('periodoEscolarId') periodoEscolarId: string,
    @Body('titulo') titulo: string,
    @Body('descripcion') descripcion: string,
    @Body('tipo') tipo: string,
    @Body('orden') orden: string,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Archivo PDF requerido');
    }

    if (!materiaId || !periodoEscolarId) {
      throw new BadRequestException('materiaId y periodoEscolarId son requeridos');
    }

    const userId = req.user.id;

    const createDto: CreateArchivoTemarioBaseDto = {
      materiaId: parseInt(materiaId),
      periodoEscolarId: parseInt(periodoEscolarId),
      titulo: titulo || file.originalname,
      descripcion: descripcion || null,
      archivoPdf: file.path,
      nombreOriginal: file.originalname,
      tamanoMb: file.size / (1024 * 1024),
      orden: orden ? parseInt(orden) : undefined,
      tipo: tipo || 'GENERAL',
      subidoPor: userId,
    };

    return this.adminTemariosBaseService.createArchivoTemarioBase(createDto);
  }

  /**
   * Obtener archivos de temario de una materia
   * GET /admin/temarios-base/materia/:materiaId
   */
  @Get('materia/:materiaId')
  async getArchivosByMateria(
    @Param('materiaId', ParseIntPipe) materiaId: number,
    @Query('periodoId') periodoId?: string,
  ) {
    const periodoIdNum = periodoId ? parseInt(periodoId) : undefined;
    return this.adminTemariosBaseService.getArchivosByMateria(materiaId, periodoIdNum);
  }

  /**
   * Obtener un archivo específico
   * GET /admin/temarios-base/:id
   */
  @Get(':id')
  async getArchivoById(@Param('id', ParseIntPipe) id: number) {
    return this.adminTemariosBaseService.getArchivoById(id);
  }

  /**
   * Actualizar archivo de temario
   * PUT /admin/temarios-base/:id
   */
  @Put(':id')
  async updateArchivoTemarioBase(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateArchivoTemarioBaseDto
  ) {
    return this.adminTemariosBaseService.updateArchivoTemarioBase(id, updateDto);
  }

  /**
   * Eliminar (desactivar) archivo de temario
   * DELETE /admin/temarios-base/:id
   */
  @Delete(':id')
  async deleteArchivoTemarioBase(@Param('id', ParseIntPipe) id: number) {
    return this.adminTemariosBaseService.deleteArchivoTemarioBase(id);
  }

  /**
   * Reemplazar archivo PDF
   * POST /admin/temarios-base/:id/reemplazar
   */
  @Post(':id/reemplazar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/temarios',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `temario-base-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          return callback(new BadRequestException('Solo se permiten archivos PDF'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    })
  )
  async replaceArchivoFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Archivo PDF requerido');
    }

    return this.adminTemariosBaseService.replaceArchivoFile(id, {
      archivoPdf: file.path,
      nombreOriginal: file.originalname,
      tamanoMb: file.size / (1024 * 1024),
    });
  }

  /**
   * Reordenar archivos de una materia
   * POST /admin/temarios-base/materia/:materiaId/reordenar
   */
  @Post('materia/:materiaId/reordenar')
  async reorderArchivos(
    @Param('materiaId', ParseIntPipe) materiaId: number,
    @Body('periodoId') periodoId: number,
    @Body('ordenNuevo') ordenNuevo: { id: number; orden: number }[]
  ) {
    await this.adminTemariosBaseService.reorderArchivos(materiaId, periodoId, ordenNuevo);
    return { message: 'Archivos reordenados correctamente' };
  }

  /**
   * Contar archivos por materia
   * GET /admin/temarios-base/materia/:materiaId/count
   */
  @Get('materia/:materiaId/count')
  async countArchivosByMateria(
    @Param('materiaId', ParseIntPipe) materiaId: number,
    @Query('periodoId') periodoId?: string,
  ) {
    const periodoIdNum = periodoId ? parseInt(periodoId) : undefined;
    const count = await this.adminTemariosBaseService.countArchivosByMateria(materiaId, periodoIdNum);
    return { count };
  }

  /**
   * Obtener archivos por tipo
   * GET /admin/temarios-base/materia/:materiaId/tipo/:tipo
   */
  @Get('materia/:materiaId/tipo/:tipo')
  async getArchivosByTipo(
    @Param('materiaId', ParseIntPipe) materiaId: number,
    @Param('tipo') tipo: string,
  ) {
    return this.adminTemariosBaseService.getArchivosByTipo(materiaId, tipo);
  }
}