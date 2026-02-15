import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateLessonPlanDto {
  @ApiProperty({ 
    description: 'ID del temario base',
    example: 1
  })
  @IsNumber()
  @Type(() => Number)
  temarioId: number;

  @ApiProperty({ 
    description: 'ID de la asignación del docente',
    example: 1
  })
  @IsNumber()
  @Type(() => Number)
  asignacionId: number;

  @ApiPropertyOptional({ 
    description: 'Título de la planeación',
    example: 'Planeación Anatomía Humana - Grupo 1A'
  })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiPropertyOptional({ 
    description: 'Descripción de la planeación',
    example: 'Planeación detallada para el grupo 1A'
  })
  @IsString()
  @IsOptional()
  descripcion?: string;
}