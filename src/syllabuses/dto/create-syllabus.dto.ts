import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSyllabusDto {
  @ApiProperty({ 
    description: 'ID de la materia',
    example: 1
  })
  @IsNumber()
  @Type(() => Number)
  materiaId: number;

  @ApiProperty({ 
    description: 'ID del periodo escolar',
    example: 1
  })
  @IsNumber()
  @Type(() => Number)
  periodoEscolarId: number;

  @ApiPropertyOptional({ 
    description: 'Título del temario',
    example: 'Temario Oficial - Anatomía Humana'
  })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiPropertyOptional({ 
    description: 'Descripción del temario',
    example: 'Temario completo para el curso de Anatomía Humana'
  })
  @IsString()
  @IsOptional()
  descripcion?: string;
}