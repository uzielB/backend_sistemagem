import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Param,
  Body,
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
import { AdminTemariosService } from './admin-temarios.service';
import { CreateTemarioDto, UpdateTemarioDto } from './dto/admin-programs.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/role.enum';

/**
 * Controlador para gestión de temarios (syllabuses) por Admin
 * Rutas: /api/admin/temarios/*
 */
@Controller('admin/temarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AdminTemariosController {
  constructor(private readonly adminTemariosService: AdminTemariosService) {}

  /**
   * Subir temario (PDF) para una materia
   * POST /admin/temarios
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/temarios',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `temario-${uniqueSuffix}${ext}`);
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
  async uploadTemario(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDto: CreateTemarioDto,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Archivo PDF requerido');
    }

    const userId = req.user.id; // ID del admin que sube el temario

    return this.adminTemariosService.createSyllabus({
      materiaId: createDto.materiaId,
      periodoEscolarId: createDto.periodoEscolarId,
      nombreArchivo: file.filename,
      nombreOriginal: file.originalname,
      rutaArchivo: file.path,
      tamanoMb: file.size / (1024 * 1024),
      titulo: createDto.titulo,
      descripcion: createDto.descripcion,
      subidoPor: userId,
    });
  }

  /**
   * Obtener temario de una materia
   * GET /admin/temarios/materia/:materiaId
   */
  @Get('materia/:materiaId')
  async getTemarioByMateria(
    @Param('materiaId', ParseIntPipe) materiaId: number
  ) {
    return this.adminTemariosService.getSyllabusByMateria(materiaId);
  }

  /**
   * Actualizar temario
   * PUT /admin/temarios/:id
   */
  @Put(':id')
  async updateTemario(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTemarioDto
  ) {
    return this.adminTemariosService.updateSyllabus(id, updateDto);
  }

  /**
   * Eliminar (desactivar) temario
   * DELETE /admin/temarios/:id
   */
  @Delete(':id')
  async deleteTemario(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.adminTemariosService.deleteSyllabus(id);
  }

  /**
   * Reemplazar archivo PDF de un temario
   * POST /admin/temarios/:id/reemplazar
   */
  @Post(':id/reemplazar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/temarios',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `temario-${uniqueSuffix}${ext}`);
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
  async replaceTemario(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Archivo PDF requerido');
    }

    return this.adminTemariosService.replaceSyllabusFile(id, {
      nombreArchivo: file.filename,
      nombreOriginal: file.originalname,
      rutaArchivo: file.path,
      tamanoMb: file.size / (1024 * 1024),
    });
  }
}