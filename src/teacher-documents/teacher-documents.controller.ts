import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { TeacherDocumentsService } from './teacher-documents.service';
import { CreateTeacherDocumentDto } from './dto/create-teacher-document.dto';
import { UpdateTeacherDocumentDto } from './dto/update-teacher-document.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { EstatusDocumentos } from './entities/teacher-document.entity';

/**
 * Controlador de TeacherDocuments (Documentos de Docentes)
 * 
 * Rutas base: /api/teacher-documents
 */
@Controller('teacher-documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeacherDocumentsController {
  constructor(
    private readonly teacherDocumentsService: TeacherDocumentsService,
  ) {}

  /**
   * POST /api/teacher-documents
   * Crea un registro de documentos
   * 
   * Requiere rol: SUPER_ADMIN, ADMIN o DOCENTE
   */
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCENTE)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDocumentDto: CreateTeacherDocumentDto) {
    const document = await this.teacherDocumentsService.create(createDocumentDto);

    return {
      message: 'Registro de documentos creado exitosamente',
      data: document,
    };
  }

  /**
   * GET /api/teacher-documents
   * Obtiene todos los registros de documentos
   * Query param: ?estatus=PENDIENTE
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findAll(@Query('estatus') estatus?: EstatusDocumentos) {
    const documents = await this.teacherDocumentsService.findAll(estatus);

    return {
      message: 'Registros de documentos obtenidos exitosamente',
      data: documents,
      count: documents.length,
    };
  }

  /**
   * GET /api/teacher-documents/statistics
   * Obtiene estadísticas de documentos
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Get('statistics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getStatistics() {
    const statistics = await this.teacherDocumentsService.getStatistics();

    return {
      message: 'Estadísticas obtenidas exitosamente',
      data: statistics,
    };
  }

  /**
   * GET /api/teacher-documents/incomplete
   * Obtiene documentos incompletos
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Get('incomplete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findIncomplete() {
    const documents = await this.teacherDocumentsService.findIncomplete();

    return {
      message: 'Documentos incompletos obtenidos exitosamente',
      data: documents,
      count: documents.length,
    };
  }

  /**
   * GET /api/teacher-documents/by-teacher/:docenteId
   * Obtiene documentos por docente
   * 
   * Requiere rol: SUPER_ADMIN, ADMIN o DOCENTE
   */
  @Get('by-teacher/:docenteId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCENTE)
  async findByTeacher(@Param('docenteId', ParseIntPipe) docenteId: number) {
    const document = await this.teacherDocumentsService.findByTeacher(docenteId);

    if (!document) {
      return {
        message: 'El docente no tiene documentos registrados',
        data: null,
      };
    }

    return {
      message: 'Documentos del docente obtenidos exitosamente',
      data: document,
    };
  }

  /**
   * GET /api/teacher-documents/:id
   * Obtiene un registro por ID
   * 
   * Requiere autenticación
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const document = await this.teacherDocumentsService.findOne(id);

    return {
      message: 'Registro de documentos encontrado',
      data: document,
    };
  }

  /**
   * PATCH /api/teacher-documents/:id
   * Actualiza documentos
   * 
   * Requiere rol: SUPER_ADMIN, ADMIN o DOCENTE
   */
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCENTE)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentDto: UpdateTeacherDocumentDto,
  ) {
    const document = await this.teacherDocumentsService.update(
      id,
      updateDocumentDto,
    );

    return {
      message: 'Documentos actualizados exitosamente',
      data: document,
    };
  }

  /**
   * PATCH /api/teacher-documents/:id/approve
   * Aprueba los documentos
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Patch(':id/approve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() body: { comentarios?: string },
  ) {
    const document = await this.teacherDocumentsService.approve(
      id,
      req.user.id,
      body.comentarios,
    );

    return {
      message: 'Documentos aprobados exitosamente',
      data: document,
    };
  }

  /**
   * PATCH /api/teacher-documents/:id/reject
   * Rechaza los documentos
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Patch(':id/reject')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() body: { comentarios: string },
  ) {
    const document = await this.teacherDocumentsService.reject(
      id,
      req.user.id,
      body.comentarios,
    );

    return {
      message: 'Documentos rechazados',
      data: document,
    };
  }

  /**
   * DELETE /api/teacher-documents/:id
   * Elimina un registro de documentos
   * 
   * Requiere rol: SUPER_ADMIN
   */
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.teacherDocumentsService.remove(id);

    return {
      message: 'Registro de documentos eliminado permanentemente',
    };
  }
}