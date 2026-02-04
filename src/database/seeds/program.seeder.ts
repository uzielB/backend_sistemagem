import { DataSource } from 'typeorm';
import { Program, Modalidad } from '../../programs/entities/program.entity';

/**
 * Seeder para crear programas académicos (licenciaturas)
 * 
 * 7 licenciaturas según el diseño de BD
 */
async function seedPrograms() {
  console.log('');
  console.log('================================================');
  console.log('🌱 SEEDER DE PROGRAMAS ACADÉMICOS - Sistema GEM');
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
    entities: [Program],
    synchronize: false,
  });

  try {
    // Inicializar conexión
    await dataSource.initialize();
    console.log('📡 Conexión a la base de datos establecida');

    // Obtener repositorio
    const programRepository = dataSource.getRepository(Program);

    // Verificar programas existentes
    const existing = await programRepository.find();
    console.log(`📋 Programas existentes: ${existing.length}`);

    // Limpiar tabla (opcional)
    if (existing.length > 0) {
      console.log('🗑️  Limpiando tabla de programas...');
      await programRepository.remove(existing);
      console.log('✅ Tabla limpiada');
    }

    console.log('\n💾 Creando programas académicos...\n');

    // Programas según DATABASE-DESIGN-FINAL-ESPAÑOL-V3.md
    const programas = [
      // Licenciaturas de Salud
      {
        nombre: 'Licenciatura en Fisioterapia',
        codigo: 'LFT',
        modalidad: Modalidad.ESCOLARIZADO,
        duracionSemestres: 8,
        estaActivo: true,
      },

      // Licenciaturas Sociales y Humanísticas
      {
        nombre: 'Licenciatura en Trabajo Social',
        codigo: 'LTS',
        modalidad: Modalidad.ESCOLARIZADO,
        duracionSemestres: 8,
        estaActivo: true,
      },
      {
        nombre: 'Licenciatura en Derecho',
        codigo: 'LDO',
        modalidad: Modalidad.ESCOLARIZADO,
        duracionSemestres: 9,
        estaActivo: true,
      },
      {
        nombre: 'Licenciatura en Psicopedagogía',
        codigo: 'LPP',
        modalidad: Modalidad.ESCOLARIZADO,
        duracionSemestres: 8,
        estaActivo: true,
      },
      {
        nombre: 'Licenciatura en Ciencias de la Educación',
        codigo: 'LCE',
        modalidad: Modalidad.ESCOLARIZADO,
        duracionSemestres: 8,
        estaActivo: true,
      },

      // Licenciaturas de Diseño y Arquitectura
      {
        nombre: 'Licenciatura en Diseño Gráfico y Mercadotecnia Publicitaria',
        codigo: 'LDM',
        modalidad: Modalidad.ESCOLARIZADO,
        duracionSemestres: 8,
        estaActivo: true,
      },
      {
        nombre: 'Licenciatura en Arquitectura e Imagen',
        codigo: 'LAI',
        modalidad: Modalidad.ESCOLARIZADO,
        duracionSemestres: 10,
        estaActivo: true,
      },
    ];

    // Guardar en base de datos
    let count = 0;
    for (const programData of programas) {
      const program = programRepository.create(programData);
      await programRepository.save(program);
      console.log(`✅ Programa creado: ${programData.codigo} - ${programData.nombre}`);
      console.log(`   Duración: ${programData.duracionSemestres} semestres (${Math.ceil(programData.duracionSemestres / 2)} años)`);
      console.log('');
      count++;
    }

    console.log('================================================');
    console.log('📊 RESUMEN:');
    console.log(`   ✅ Programas de Salud: 1`);
    console.log(`   ✅ Programas Sociales y Humanísticos: 4`);
    console.log(`   ✅ Programas de Diseño y Arquitectura: 2`);
    console.log(`   📝 Total creados: ${count}`);
    console.log('================================================');
    console.log('');
    console.log('🎉 Seeder de programas académicos ejecutado exitosamente');

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
seedPrograms()
  .then(() => {
    console.log('✅ Seeder completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error al ejecutar seeder:', error);
    process.exit(1);
  });