import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherBankInfo } from './entities/teacher-bank-info.entity';
import { CreateTeacherBankInfoDto } from './dto/create-teacher-bank-info.dto';
import { UpdateTeacherBankInfoDto } from './dto/update-teacher-bank-info.dto';
import { TeachersService } from '../teachers/teachers.service';

/**
 * Servicio de TeacherBankInfo (Datos Bancarios de Docentes)
 */
@Injectable()
export class TeacherBankInfoService {
  constructor(
    @InjectRepository(TeacherBankInfo)
    private readonly bankInfoRepository: Repository<TeacherBankInfo>,
    private readonly teachersService: TeachersService,
  ) {}

  /**
   * Crea datos bancarios para un docente
   */
  async create(
    createBankInfoDto: CreateTeacherBankInfoDto,
  ): Promise<TeacherBankInfo> {
    // Verificar que el docente existe
    await this.teachersService.findOne(createBankInfoDto.docenteId);

    // Verificar que no existan ya datos bancarios
    const existing = await this.bankInfoRepository.findOne({
      where: { docenteId: createBankInfoDto.docenteId },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existen datos bancarios para este docente',
      );
    }

    // Crear el registro
    const bankInfo = this.bankInfoRepository.create(createBankInfoDto);
    const saved = await this.bankInfoRepository.save(bankInfo);

    // Marcar en el docente que proporcionó datos bancarios
    await this.teachersService.markDatosBancariosCompletos(
      createBankInfoDto.docenteId,
    );

    return await this.findOne(saved.id);
  }

  /**
   * Obtiene todos los registros de datos bancarios
   */
  async findAll(validadoOnly = false): Promise<TeacherBankInfo[]> {
    const where = validadoOnly ? { validado: true } : {};

    return await this.bankInfoRepository.find({
      where,
      relations: ['docente', 'docente.usuario'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  /**
   * Obtiene datos bancarios sin validar
   */
  async findUnvalidated(): Promise<TeacherBankInfo[]> {
    return await this.bankInfoRepository.find({
      where: { validado: false },
      relations: ['docente', 'docente.usuario'],
      order: { fechaCreacion: 'ASC' },
    });
  }

  /**
   * Obtiene un registro por ID
   */
  async findOne(id: number): Promise<TeacherBankInfo> {
    const bankInfo = await this.bankInfoRepository.findOne({
      where: { id },
      relations: ['docente', 'docente.usuario', 'validador'],
    });

    if (!bankInfo) {
      throw new NotFoundException(
        `No se encontraron datos bancarios con ID: ${id}`,
      );
    }

    return bankInfo;
  }

  /**
   * Obtiene datos bancarios de un docente
   */
  async findByTeacher(docenteId: number): Promise<TeacherBankInfo | null> {
    // Verificar que el docente existe
    await this.teachersService.findOne(docenteId);

    return await this.bankInfoRepository.findOne({
      where: { docenteId },
      relations: ['docente', 'docente.usuario', 'validador'],
    });
  }

  /**
   * Actualiza datos bancarios
   */
  async update(
    id: number,
    updateBankInfoDto: UpdateTeacherBankInfoDto,
  ): Promise<TeacherBankInfo> {
    const bankInfo = await this.findOne(id);

    Object.assign(bankInfo, updateBankInfoDto);
    await this.bankInfoRepository.save(bankInfo);

    return await this.findOne(id);
  }

  /**
   * Valida los datos bancarios
   */
  async validate(id: number, validadoPor: number): Promise<TeacherBankInfo> {
    const bankInfo = await this.findOne(id);

    bankInfo.validado = true;
    bankInfo.validadoPor = validadoPor;
    bankInfo.fechaValidacion = new Date();

    await this.bankInfoRepository.save(bankInfo);

    // Marcar en el docente que tiene datos bancarios completos
    await this.teachersService.markDatosBancariosCompletos(bankInfo.docenteId);

    return await this.findOne(id);
  }

  /**
   * Invalida los datos bancarios
   */
  async invalidate(id: number): Promise<TeacherBankInfo> {
    const bankInfo = await this.findOne(id);

    bankInfo.validado = false;
    bankInfo.validadoPor = null;
    bankInfo.fechaValidacion = null;

    return await this.bankInfoRepository.save(bankInfo);
  }

  /**
   * Elimina datos bancarios
   */
  async remove(id: number): Promise<boolean> {
    const bankInfo = await this.findOne(id);
    await this.bankInfoRepository.remove(bankInfo);
    return true;
  }

  /**
   * Obtiene estadísticas de datos bancarios
   */
  async getStatistics(): Promise<{
    total: number;
    validados: number;
    sinValidar: number;
  }> {
    const bankInfos = await this.bankInfoRepository.find();

    const statistics = {
      total: bankInfos.length,
      validados: 0,
      sinValidar: 0,
    };

    bankInfos.forEach((info) => {
      if (info.validado) {
        statistics.validados++;
      } else {
        statistics.sinValidar++;
      }
    });

    return statistics;
  }
}