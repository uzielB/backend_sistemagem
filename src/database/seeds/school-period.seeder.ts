import { DataSource } from 'typeorm';
import { SchoolPeriod } from '../../school-periods/entities/school-period.entity';

/**
 * Seeder para crear periodos escolares
 * 
 * 2 periodos: Enero-Junio 2025 (actual) y Julio-Diciembre 2025
 */
async function seedSchoolPeriods() {
  console.log('');
  console.log('================================================');
  console.log('🌱 SEEDER DE PERIODOS ESCOLARES - Sistema GEM');
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
    entities: [SchoolPeriod],
    synchronize: false,
  });

  try {
    // Inicializar conexión
    await dataSource.initialize();
    console.log('📡 Conexión a la base de datos establecida');

    // Obtener repositorio
    const schoolPeriodRepository = dataSource.getRepository(SchoolPeriod);

    // Verificar periodos existentes
    const existing = await schoolPeriodRepository.find();
    console.log(`📋 Periodos escolares existentes: ${existing.length}`);

    // Limpiar tabla (opcional)
    if (existing.length > 0) {
      console.log('🗑️  Limpiando tabla de periodos escolares...');
      await schoolPeriodRepository.remove(existing);
      console.log('✅ Tabla limpiada');
    }

    console.log('\n💾 Creando periodos escolares...\n');

    // Periodos escolares
    const periodos = [
      {
        nombre: 'Enero-Junio 2025',
        codigo: '2025-1',
        fechaInicio: new Date('2025-01-13'),
        fechaFin: new Date('2025-06-30'),
        esActual: true, // Este es el periodo actual
        estaActivo: true,
      },
      {
        nombre: 'Julio-Diciembre 2025',
        codigo: '2025-2',
        fechaInicio: new Date('2025-07-01'),
        fechaFin: new Date('2025-12-20'),
        esActual: false,
        estaActivo: true,
      },
    ];

    // Guardar en base de datos
    let count = 0;
    for (const periodoData of periodos) {
      const periodo = schoolPeriodRepository.create(periodoData);
      await schoolPeriodRepository.save(periodo);
      
      console.log(`✅ Periodo creado: ${periodoData.codigo} - ${periodoData.nombre}`);
      console.log(`   Fecha inicio: ${periodoData.fechaInicio.toISOString().split('T')[0]}`);
      console.log(`   Fecha fin: ${periodoData.fechaFin.toISOString().split('T')[0]}`);
      console.log(`   Periodo actual: ${periodoData.esActual ? 'SÍ ⭐' : 'NO'}`);
      console.log('');
      count++;
    }

    console.log('================================================');
    console.log('📊 RESUMEN:');
    console.log(`   ✅ Periodos creados: ${count}`);
    console.log(`   ⭐ Periodo actual: 2025-1 (Enero-Junio 2025)`);
    console.log('================================================');
    console.log('');
    console.log('🎉 Seeder de periodos escolares ejecutado exitosamente');

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
seedSchoolPeriods()
  .then(() => {
    console.log('✅ Seeder completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error al ejecutar seeder:', error);
    process.exit(1);
  });