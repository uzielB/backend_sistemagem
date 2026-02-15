import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Param, 
  Body, 
  UseInterceptors, 
  UploadedFile,
  UseGuards,
  Request,
  Res,
  ParseIntPipe,
  HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { SyllabusesService } from '../syllabuses.service';
import { CreateSyllabusDto } from '../dto/create-syllabus.dto';
import { ReviewLessonPlanDto } from '../dto/review-lesson-plan.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/role.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Admin - Syllabuses')
@ApiBearerAuth()
@Controller('api/admin/syllabuses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AdminSyllabusesController {
  constructor(private readonly syllabusesService: SyllabusesService) {}

  /**
   * Subir temario (PDF)
   */
  @Post('syllabuses')
  @ApiOperation({ summary: 'Subir un nuevo temario (PDF)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Temario subido exitosamente' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Ya existe un temario para esta materia/periodo' })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/temarios',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        cb(null, `temario-${uniqueSuffix}${ext}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos PDF'), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB
    }
  }))
  async uploadSyllabus(
    @UploadedFile() file: Express.Multer.File,
    @Body() createSyllabusDto: CreateSyllabusDto,
    @Request() req
  ) {
    return this.syllabusesService.uploadSyllabus(
      file,
      createSyllabusDto,
      req.user.id
    );
  }

  /**
   * Listar todos los temarios
   */
  @Get('syllabuses')
  @ApiOperation({ summary: 'Listar todos los temarios' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de temarios obtenida exitosamente' })
  async findAllSyllabuses() {
    return this.syllabusesService.findAllSyllabuses();
  }

  /**
   * Obtener un temario por ID
   */
  @Get('syllabuses/:id')
  @ApiOperation({ summary: 'Obtener un temario por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Temario encontrado' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Temario no encontrado' })
  async findOneSyllabus(@Param('id', ParseIntPipe) id: number) {
    return this.syllabusesService.findOneSyllabus(id);
  }

  /**
   * Eliminar temario
   */
  @Delete('syllabuses/:id')
  @ApiOperation({ summary: 'Eliminar un temario (soft delete)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Temario eliminado exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Temario no encontrado' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'No se puede eliminar, tiene planeaciones asociadas' })
  async deleteSyllabus(@Param('id', ParseIntPipe) id: number) {
    await this.syllabusesService.deleteSyllabus(id);
    return { 
      message: 'Temario eliminado exitosamente',
      statusCode: HttpStatus.OK
    };
  }

  /**
   * Descargar temario
   */
  @Get('syllabuses/:id/download')
  @ApiOperation({ summary: 'Descargar archivo PDF del temario' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Archivo descargado' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Temario o archivo no encontrado' })
  async downloadSyllabus(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response
  ) {
    const syllabus = await this.syllabusesService.findOneSyllabus(id);
    const fileBuffer = await this.syllabusesService.downloadFile(syllabus.rutaArchivo);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${syllabus.nombreOriginal}"`);
    res.send(fileBuffer);
  }

  /**
   * Listar TODAS las planeaciones
   */
  @Get('lesson-plans')
  @ApiOperation({ summary: 'Listar todas las planeaciones de todos los docentes' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de planeaciones obtenida exitosamente' })
  async findAllLessonPlans() {
    return this.syllabusesService.findAllLessonPlans();
  }

  /**
   * Obtener una planeación por ID
   */
  @Get('lesson-plans/:id')
  @ApiOperation({ summary: 'Obtener una planeación por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Planeación encontrada' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Planeación no encontrada' })
  async findOneLessonPlan(@Param('id', ParseIntPipe) id: number) {
    return this.syllabusesService.findOneLessonPlan(id);
  }

  /**
   * Revisar planeación (Aprobar/Rechazar)
   */
  @Post('lesson-plans/:id/review')
  @ApiOperation({ summary: 'Revisar planeación (Aprobar/Rechazar/Con Observaciones)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Planeación revisada exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Planeación no encontrada' })
  async reviewLessonPlan(
    @Param('id', ParseIntPipe) id: number,
    @Body() reviewDto: ReviewLessonPlanDto,
    @Request() req
  ) {
    return this.syllabusesService.reviewLessonPlan(
      id,
      reviewDto,
      req.user.id
    );
  }

  /**
   * Descargar planeación
   */
  @Get('lesson-plans/:id/download')
  @ApiOperation({ summary: 'Descargar archivo PDF de la planeación' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Archivo descargado' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Planeación o archivo no encontrado' })
  async downloadLessonPlan(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response
  ) {
    const lessonPlan = await this.syllabusesService.findOneLessonPlan(id);
    const fileBuffer = await this.syllabusesService.downloadFile(lessonPlan.rutaArchivo);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${lessonPlan.nombreOriginal}"`);
    res.send(fileBuffer);
  }

  /**
   * Estadísticas de planeaciones
   */
  @Get('stats/lesson-plans')
  @ApiOperation({ summary: 'Obtener estadísticas de planeaciones por estatus' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Estadísticas obtenidas' })
  async getLessonPlanStats() {
    return this.syllabusesService.getLessonPlanStats();
  }
}