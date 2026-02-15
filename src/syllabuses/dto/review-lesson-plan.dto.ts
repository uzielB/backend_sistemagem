import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LessonPlanStatus } from '../entities/lesson-plan.entity';

export class ReviewLessonPlanDto {
  @ApiProperty({ 
    description: 'Nuevo estatus de la planeación',
    enum: LessonPlanStatus,
    example: LessonPlanStatus.APPROVED
  })
  @IsEnum(LessonPlanStatus)
  estatus: LessonPlanStatus;

  @ApiPropertyOptional({ 
    description: 'Observaciones del revisor',
    example: 'Excelente planeación, aprobada sin cambios.'
  })
  @IsString()
  @IsOptional()
  observaciones?: string;
}