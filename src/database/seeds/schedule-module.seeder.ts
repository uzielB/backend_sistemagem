import { DataSource } from 'typeorm';
import { ScheduleModule, Sistema } from '../../schedule-modules/entities/schedule-module.entity';

/**
 * Seeder para crear módulos horarios
 * 
 * ESCOLARIZADO: 4 módulos (Lunes a Jueves)
 * SABATINO: 3 módulos (Sábados)
 */
async function seedScheduleModules() {
  console.log('');
  console.log('================================================');
  console.log('🌱 SEEDER DE MÓDULOS HORARIOS - Sistema GEM');
  console.log('================================================');
  console.log('');

  // Crear conexión a la base de datos
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'Postgres2025!',
    database: 'sistema_academico',
    entities: [ScheduleModule],
    synchronize: false,
  });

  try {
    // Inicializar conexión
    await dataSource.initialize();
    console.log('📡 Conexión a la base de datos establecida');

    // Obtener repositorio
    const scheduleModuleRepository = dataSource.getRepository(ScheduleModule);

    // Verificar módulos existentes
    const existing = await scheduleModuleRepository.find();
    console.log(`📋 Módulos horarios existentes: ${existing.length}`);

    // Limpiar tabla (opcional)
    if (existing.length > 0) {
      console.log('🗑️  Limpiando tabla de módulos horarios...');
      await scheduleModuleRepository.remove(existing);
      console.log('✅ Tabla limpiada');
    }

    console.log('\n💾 Creando módulos horarios...\n');

    // MÓDULOS ESCOLARIZADO (Lunes a Jueves, 4 módulos)
    const modulosEscolarizado = [
      {
        sistema: Sistema.ESCOLARIZADO,
        numeroModulo: 1,
        horaInicio: '08:00',
        horaFin: '09:30',
        diasSemana: 'Lunes a Jueves',
        descripcion: 'Módulo 1: 8:00 a 9:30',
        estaActivo: true,
      },
      {
        sistema: Sistema.ESCOLARIZADO,
        numeroModulo: 2,
        horaInicio: '10:00',
        horaFin: '11:30',
        diasSemana: 'Lunes a Jueves',
        descripcion: 'Módulo 2: 10:00 a 11:30',
        estaActivo: true,
      },
      {
        sistema: Sistema.ESCOLARIZADO,
        numeroModulo: 3,
        horaInicio: '12:00',
        horaFin: '13:30',
        diasSemana: 'Lunes a Jueves',
        descripcion: 'Módulo 3: 12:00 a 13:30',
        estaActivo: true,
      },
      {
        sistema: Sistema.ESCOLARIZADO,
        numeroModulo: 4,
        horaInicio: '13:30',
        horaFin: '15:00',
        diasSemana: 'Lunes a Jueves',
        descripcion: 'Módulo 4: 13:30 a 15:00',
        estaActivo: true,
      },
    ];

    // MÓDULOS SABATINO (Sábados, 3 módulos)
    const modulosSabatino = [
      {
        sistema: Sistema.SABATINO,
        numeroModulo: 1,
        horaInicio: '08:00',
        horaFin: '11:30',
        diasSemana: 'Sábados',
        descripcion: 'Módulo 1: 8:00 a 11:30',
        estaActivo: true,
      },
      {
        sistema: Sistema.SABATINO,
        numeroModulo: 2,
        horaInicio: '11:30',
        horaFin: '14:30',
        diasSemana: 'Sábados',
        descripcion: 'Módulo 2: 11:30 a 14:30',
        estaActivo: true,
      },
      {
        sistema: Sistema.SABATINO,
        numeroModulo: 3,
        horaInicio: '14:30',
        horaFin: '17:30',
        diasSemana: 'Sábados',
        descripcion: 'Módulo 3: 14:30 a 17:30 (solo LTS)',
        estaActivo: true,
      },
    ];

    // Combinar todos los módulos
    const allModules = [...modulosEscolarizado, ...modulosSabatino];

    // Guardar en base de datos
    let count = 0;
    for (const moduleData of allModules) {
      const module = scheduleModuleRepository.create(moduleData);
      await scheduleModuleRepository.save(module);
      console.log(`✅ Módulo creado: ${moduleData.sistema} - Módulo ${moduleData.numeroModulo} (${moduleData.horaInicio} - ${moduleData.horaFin})`);
      count++;
    }

    console.log('\n================================================');
    console.log('📊 RESUMEN:');
    console.log(`   ✅ Módulos ESCOLARIZADO: 4`);
    console.log(`   ✅ Módulos SABATINO: 3`);
    console.log(`   📝 Total creados: ${count}`);
    console.log('================================================');
    console.log('');
    console.log('🎉 Seeder de módulos horarios ejecutado exitosamente');

    // Cerrar conexión
    await dataSource.destroy();
    console.log('✅ Conexión cerrada\n');

  } catch (error) {
    console.error('❌ Error al ejecutar el seeder:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

// Ejecutar seeder
seedScheduleModules()
  .then(() => {
    console.log('✅ Seeder completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error al ejecutar seeder:', error);
    process.exit(1);
  });