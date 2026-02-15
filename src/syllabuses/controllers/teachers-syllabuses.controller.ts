import { 
  Controller, 
  Post, 
  Get, 
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
import { CreateLessonPlanDto } from '../dto/create-lesson-plan.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/role.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Teachers - Syllabuses')
@ApiBearerAuth()
@Controller('api/teachers/syllabuses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DOCENTE)
export class TeachersSyllabusesController {
  constructor(private readonly syllabusesService: SyllabusesService) {}

  /**
   * Ver temarios de las materias asignadas al docente
   */
  @Get('syllabuses')
  @ApiOperation({ summary: 'Obtener temarios de mis materias asignadas' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de temarios obtenida exitosamente' })
  async findMySyllabuses(@Request() req) {
    return this.syllabusesService.findSyllabusesForTeacher(req.user.teacherId);
  }

  /**
   * Obtener un temario específico
   */
  @Get('syllabuses/:id')
  @ApiOperation({ summary: 'Obtener un temario por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Temario encontrado' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Temario no encontrado' })
  async findOneSyllabus(@Param('id', ParseIntPipe) id: number) {
    return this.syllabusesService.findOneSyllabus(id);
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
   * Subir planeación (PDF)
   */
  @Post('lesson-plans')
  @ApiOperation({ summary: 'Subir una nueva planeación basada en un temario (PDF)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Planeación subida exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Temario no encontrado' })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/planeaciones',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        cb(null, `planeacion-${uniqueSuffix}${ext}`);
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
  async uploadLessonPlan(
    @UploadedFile() file: Express.Multer.File,
    @Body() createLessonPlanDto: CreateLessonPlanDto,
    @Request() req
  ) {
    return this.syllabusesService.uploadLessonPlan(
      file,
      createLessonPlanDto,
      req.user.teacherId
    );
  }

  /**
   * Ver mis planeaciones
   */
  @Get('lesson-plans')
  @ApiOperation({ summary: 'Obtener todas mis planeaciones' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de planeaciones obtenida exitosamente' })
  async findMyLessonPlans(@Request() req) {
    return this.syllabusesService.findLessonPlansByTeacher(req.user.teacherId);
  }

  /**
   * Obtener una planeación específica
   */
  @Get('lesson-plans/:id')
  @ApiOperation({ summary: 'Obtener una de mis planeaciones por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Planeación encontrada' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Planeación no encontrada' })
  async findOneLessonPlan(@Param('id', ParseIntPipe) id: number) {
    return this.syllabusesService.findOneLessonPlan(id);
  }

  /**
   * Descargar mi planeación
   */
  @Get('lesson-plans/:id/download')
  @ApiOperation({ summary: 'Descargar archivo PDF de mi planeación' })
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
}