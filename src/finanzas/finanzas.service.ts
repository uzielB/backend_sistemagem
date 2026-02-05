import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago, EstatusPago } from './entities/pago.entity';
import { ConceptoPago } from './entities/concepto-pago.entity';
import { Beca, EstatusBeca } from './entities/beca.entity';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';

@Injectable()
export class FinanzasService {
  constructor(
    @InjectRepository(Pago)
    private pagoRepository: Repository<Pago>,
    
    @InjectRepository(ConceptoPago)
    private conceptoPagoRepository: Repository<ConceptoPago>,
    
    @InjectRepository(Beca)
    private becaRepository: Repository<Beca>,
  ) {}

  // ==========================================
  // CONCEPTOS DE PAGO
  // ==========================================

  async findAllConceptos(): Promise<ConceptoPago[]> {
    return await this.conceptoPagoRepository.find({
      where: { esta_activo: true },
      order: { nombre: 'ASC' }
    });
  }

  // ==========================================
  // PAGOS - CRUD COMPLETO (ADMIN)
  // ==========================================

  async findAllPagos(filters?: {
    estudiante_id?: number;
    estatus?: EstatusPago;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Promise<Pago[]> {
    const query = this.pagoRepository.createQueryBuilder('pago')
      .leftJoinAndSelect('pago.concepto', 'concepto');

    if (filters?.estudiante_id) {
      query.andWhere('pago.estudiante_id = :estudianteId', { estudianteId: filters.estudiante_id });
    }

    if (filters?.estatus) {
      query.andWhere('pago.estatus = :estatus', { estatus: filters.estatus });
    }

    if (filters?.fecha_desde) {
      query.andWhere('pago.fecha_vencimiento >= :fechaDesde', { fechaDesde: filters.fecha_desde });
    }

    if (filters?.fecha_hasta) {
      query.andWhere('pago.fecha_vencimiento <= :fechaHasta', { fechaHasta: filters.fecha_hasta });
    }

    query.orderBy('pago.fecha_vencimiento', 'DESC');

    return await query.getMany();
  }

  async findOnePago(id: number): Promise<Pago> {
    const pago = await this.pagoRepository.findOne({
      where: { id },
      relations: ['concepto']
    });

    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    return pago;
  }

  async createPago(createPagoDto: CreatePagoDto, usuarioId: number): Promise<Pago> {
    const pago = this.pagoRepository.create({
      ...createPagoDto,
      creado_por: usuarioId,
      estatus: createPagoDto.estatus || EstatusPago.PENDIENTE
    });

    return await this.pagoRepository.save(pago);
  }

  async updatePago(id: number, updatePagoDto: UpdatePagoDto): Promise<Pago> {
    const pago = await this.findOnePago(id);
    
    Object.assign(pago, updatePagoDto);
    
    return await this.pagoRepository.save(pago);
  }

  async removePago(id: number): Promise<void> {
    const pago = await this.findOnePago(id);
    await this.pagoRepository.remove(pago);
  }

  // ==========================================
  // PAGOS - ALUMNO (SOLO LECTURA)
  // ==========================================

  async findPagosByEstudiante(estudianteId: number, estatus?: EstatusPago): Promise<Pago[]> {
    const query = this.pagoRepository.createQueryBuilder('pago')
      .leftJoinAndSelect('pago.concepto', 'concepto')
      .where('pago.estudiante_id = :estudianteId', { estudianteId });

    if (estatus) {
      query.andWhere('pago.estatus = :estatus', { estatus });
    }

    query.orderBy('pago.fecha_vencimiento', 'DESC');

    return await query.getMany();
  }

  // ==========================================
  // BECAS
  // ==========================================

  async findBecaActivaByEstudiante(estudianteId: number): Promise<Beca | null> {
    return await this.becaRepository.findOne({
      where: {
        estudiante_id: estudianteId,
        estatus: EstatusBeca.ACTIVA
      }
    });
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  calcularMontoConBeca(montoOriginal: number, porcentajeBeca: number): number {
    const descuento = (montoOriginal * porcentajeBeca) / 100;
    return montoOriginal - descuento;
  }
}