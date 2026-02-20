/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoFinanciero } from './entities/estado-financiero.entity';
import { Pago } from './entities/pago.entity';
import { ConfiguracionFinancieraDto } from './dto/configuracion-financiera.dto';

/**
 * Servicio de Finanzas
 * Maneja la lógica de configuración financiera y generación de pagos
 */
@Injectable()
export class FinanzasService {
  
  constructor(
    @InjectRepository(EstadoFinanciero)
    private readonly estadoFinancieroRepo: Repository<EstadoFinanciero>,
    
    @InjectRepository(Pago)
    private readonly pagoRepo: Repository<Pago>,
  ) {}

  /**
   * Crear configuración financiera y generar pagos
   * Este método se llama al inscribir un nuevo estudiante
   * 
   * @param estudianteId - ID del estudiante recién creado
   * @param config - Configuración financiera del formulario
   * @param creadoPorId - ID del admin que inscribe
   */
  async crearConfiguracionFinanciera(
    estudianteId: number,
    config: ConfiguracionFinancieraDto,
    creadoPorId: number
  ) {
    console.log('');
    console.log('================================================');
    console.log('💰 FinanzasService.crearConfiguracionFinanciera()');
    console.log('Estudiante ID:', estudianteId);
    console.log('Config:', config);
    console.log('================================================');

    // 1. VALIDAR NÚMERO DE PAGOS
    if (![1, 5, 6].includes(config.numeroPagos)) {
      throw new BadRequestException('El número de pagos debe ser 1, 5 o 6');
    }

    // 2. VALIDAR PORCENTAJE DE BECA
    const becasValidas = [0, 5, 10, 15, 20, 25, 30];
    if (!becasValidas.includes(config.porcentajeBeca)) {
      throw new BadRequestException('El porcentaje de beca debe ser: 0, 5, 10, 15, 20, 25 o 30');
    }

    // 3. VALIDAR QUE EL NÚMERO DE FECHAS COINCIDA
    if (config.fechasVencimiento.length !== config.numeroPagos) {
      throw new BadRequestException(
        `Debes proporcionar ${config.numeroPagos} fechas de vencimiento`
      );
    }

    // 4. CALCULAR MONTOS
    const totalSemestre = parseFloat(config.totalSemestre.toString());
    const porcentajeBeca = parseFloat(config.porcentajeBeca.toString());
    
    const totalDescuento = (totalSemestre * porcentajeBeca) / 100;
    const totalConDescuento = totalSemestre - totalDescuento;
    const montoPorPago = totalConDescuento / config.numeroPagos;
    const saldo = totalConDescuento; // Inicialmente, saldo = total

    console.log('📊 Cálculos:');
    console.log('  Total semestre:', totalSemestre);
    console.log('  % Beca:', porcentajeBeca);
    console.log('  Descuento:', totalDescuento);
    console.log('  Total con descuento:', totalConDescuento);
    console.log('  Monto por pago:', montoPorPago);

    // 5. VERIFICAR SI YA EXISTE ESTADO FINANCIERO PARA ESTE ESTUDIANTE EN ESTE PERIODO
    const existente = await this.estadoFinancieroRepo.findOne({
      where: {
        estudianteId,
        periodoEscolarId: config.periodoEscolarId
      }
    });

    if (existente) {
      throw new BadRequestException(
        'Ya existe una configuración financiera para este estudiante en este periodo'
      );
    }

    // 6. CREAR ESTADO FINANCIERO
    const estadoFinanciero = this.estadoFinancieroRepo.create({
      estudianteId,
      periodoEscolarId: config.periodoEscolarId,
      totalSemestre,
      porcentajeBecaAplicado: porcentajeBeca,
      numeroPagos: config.numeroPagos,
      montoPorPago,
      totalDescuento,
      totalPagado: 0,
      saldo
    });

    const estadoGuardado = await this.estadoFinancieroRepo.save(estadoFinanciero);
    console.log('✅ Estado financiero creado con ID:', estadoGuardado.id);

    // 7. CREAR PAGOS
    const pagosCreados = [];

    for (let i = 0; i < config.numeroPagos; i++) {
      const pago = this.pagoRepo.create({
        estudianteId,
        periodoEscolarId: config.periodoEscolarId,
        numeroParcialidad: i + 1,
        montoOriginal: totalSemestre / config.numeroPagos, // Sin descuento
        montoDescuento: totalDescuento / config.numeroPagos, // Parte proporcional
        montoFinal: montoPorPago, // Con descuento
        fechaVencimiento: new Date(config.fechasVencimiento[i]),
        estatus: 'PENDIENTE',
        creadoPor: creadoPorId
      });

      const pagoGuardado = await this.pagoRepo.save(pago);
      pagosCreados.push(pagoGuardado);
      
      console.log(`  ✅ Pago ${i + 1}/${config.numeroPagos} creado - $${montoPorPago} - ${config.fechasVencimiento[i]}`);
    }

    console.log('✅ Configuración financiera completa');
    console.log('================================================');
    console.log('');

    return {
      estadoFinanciero: estadoGuardado,
      pagos: pagosCreados
    };
  }

  /**
   * Obtener configuración financiera de un estudiante
   */
  async obtenerEstadoFinanciero(estudianteId: number, periodoEscolarId: number) {
    const estado = await this.estadoFinancieroRepo.findOne({
      where: {
        estudianteId,
        periodoEscolarId
      },
      relations: ['estudiante', 'periodoEscolar']
    });

    if (!estado) {
      return null;
    }

    const pagos = await this.pagoRepo.find({
      where: {
        estudianteId,
        periodoEscolarId
      },
      order: {
        numeroParcialidad: 'ASC'
      }
    });

    return {
      estadoFinanciero: estado,
      pagos
    };
  }

  /**
   * Obtener todos los pagos (para módulo de finanzas del admin)
   */
  async obtenerTodosPagos() {
    const pagos = await this.pagoRepo.find({
      relations: ['estudiante', 'estudiante.usuario', 'periodoEscolar'],
      order: {
        fechaVencimiento: 'ASC'
      }
    });

    return pagos.map(pago => ({
      id: pago.id,
      estudianteId: pago.estudianteId,
      matricula: pago.estudiante?.matricula || 'N/A',
      nombreCompleto: pago.estudiante?.usuario?.getFullName() || 'Sin nombre',
      numeroParcialidad: pago.numeroParcialidad,
      montoFinal: Number(pago.montoFinal),
      fechaVencimiento: pago.fechaVencimiento,
      fechaPago: pago.fechaPago,
      estatus: pago.estatus,
      metodoPago: pago.metodoPago,
      periodoEscolar: pago.periodoEscolar?.nombre || 'N/A'
    }));
  }

  /**
   * Registrar un pago (marcar como PAGADO)
   */
  async registrarPago(
    pagoId: number,
    metodoPago: string,
    fechaPago: Date = new Date()
  ) {
    const pago = await this.pagoRepo.findOne({ 
      where: { id: pagoId },
      relations: ['estudiante']
    });
    
    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (pago.estatus === 'PAGADO') {
      throw new BadRequestException('Este pago ya fue registrado');
    }

    // Actualizar pago
    pago.estatus = 'PAGADO';
    pago.metodoPago = metodoPago;
    pago.fechaPago = fechaPago;
    await this.pagoRepo.save(pago);

    // Actualizar estado financiero
    const estado = await this.estadoFinancieroRepo.findOne({
      where: {
        estudianteId: pago.estudianteId,
        periodoEscolarId: pago.periodoEscolarId
      }
    });

    if (estado) {
      estado.totalPagado = Number(estado.totalPagado) + Number(pago.montoFinal);
      estado.saldo = estado.totalConDescuento - Number(estado.totalPagado);
      estado.fechaUltimoPago = fechaPago;
      await this.estadoFinancieroRepo.save(estado);
    }

    return { pago, estado };
  }

  /**
   * Actualizar estatus de pagos vencidos (CRON JOB)
   * Se puede ejecutar diariamente
   */
  async actualizarPagosVencidos() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const result = await this.pagoRepo
      .createQueryBuilder()
      .update(Pago)
      .set({ estatus: 'VENCIDO' })
      .where('fecha_vencimiento < :hoy', { hoy })
      .andWhere('estatus = :estatus', { estatus: 'PENDIENTE' })
      .execute();

    console.log(`🔄 Pagos vencidos actualizados: ${result.affected}`);
    return result.affected;
  }
}