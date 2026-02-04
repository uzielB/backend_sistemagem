import { DataSource } from 'typeorm';
import { TeacherBankInfo } from '../../teacher-bank-info/entities/teacher-bank-info.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Seeder para crear datos bancarios de docentes
 * 
 * 3 registros de prueba:
 * - Docente 1 (María): VALIDADO
 * - Docente 2 (Carlos): VALIDADO
 * - Docente 3 (Ana): SIN VALIDAR
 */
async function seedTeacherBankInfo() {
  console.log('');
  console.log('================================================');
  console.log('🌱 SEEDER DE DATOS BANCARIOS - Sistema GEM');
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
    entities: [TeacherBankInfo, Teacher, User], // ✅ Incluir todas las entidades relacionadas
    synchronize: false,
  });

  try {
    // Inicializar conexión
    await dataSource.initialize();
    console.log('📡 Conexión a la base de datos establecida');

    // Obtener repositorio
    const bankInfoRepository = dataSource.getRepository(TeacherBankInfo);

    // Verificar datos bancarios existentes
    const existing = await bankInfoRepository.find();
    console.log(`📋 Datos bancarios existentes: ${existing.length}`);

    // Limpiar tabla (opcional)
    if (existing.length > 0) {
      console.log('🗑️  Limpiando tabla de datos bancarios...');
      await bankInfoRepository.remove(existing);
      console.log('✅ Tabla limpiada');
    }

    console.log('\n💾 Creando datos bancarios de docentes...\n');

    // Datos bancarios de prueba
    const datosBancarios = [
      // DOCENTE 1: María González López - VALIDADO
      {
        docenteId: 1,
        beneficiario: 'MARIA GONZALEZ LOPEZ',
        banco: 'BBVA',
        numeroCuenta: '1234567890',
        numeroTarjeta: '4152 3136 1234 5678',
        clabeInterbancaria: '012180001234567890',
        validado: true,
        validadoPor: 1, // SUPER_ADMIN
        fechaValidacion: new Date('2025-01-21'),
      },

      // DOCENTE 2: Carlos Ramírez Santos - VALIDADO
      {
        docenteId: 2,
        beneficiario: 'CARLOS RAMIREZ SANTOS',
        banco: 'Banamex',
        numeroCuenta: '9876543210',
        numeroTarjeta: '5256 7890 1234 5678',
        clabeInterbancaria: '002180009876543210',
        validado: true,
        validadoPor: 1, // SUPER_ADMIN
        fechaValidacion: new Date('2025-01-22'),
      },

      // DOCENTE 3: Ana Martínez Ruiz - SIN VALIDAR
      {
        docenteId: 3,
        beneficiario: 'ANA MARTINEZ RUIZ',
        banco: 'Santander',
        numeroCuenta: '5555666677',
        numeroTarjeta: '4539 1488 0343 6467',
        clabeInterbancaria: '014180005555666677',
        validado: false,
        validadoPor: null,
        fechaValidacion: null,
      },
    ];

    // Guardar en base de datos
    let count = 0;
    for (const datoData of datosBancarios) {
      const bankInfo = bankInfoRepository.create(datoData);
      await bankInfoRepository.save(bankInfo);

      console.log(`✅ Datos bancarios creados:`);
      console.log(`   Docente ID: ${datoData.docenteId}`);
      console.log(`   Beneficiario: ${datoData.beneficiario}`);
      console.log(`   Banco: ${datoData.banco}`);
      console.log(`   Cuenta: ****${datoData.numeroCuenta.slice(-4)}`);
      console.log(`   CLABE: ${datoData.clabeInterbancaria.slice(0, 6)}*****${datoData.clabeInterbancaria.slice(-5)}`);
      console.log(`   Validado: ${datoData.validado ? 'SÍ ✓' : 'NO ✗'}`);
      console.log('');
      count++;
    }

    console.log('================================================');
    console.log('📊 RESUMEN:');
    console.log(`   ✅ Registros creados: ${count}`);
    console.log(`   ✓ Validados: 2 (Docentes 1 y 2)`);
    console.log(`   ✗ Sin validar: 1 (Docente 3)`);
    console.log('================================================');
    console.log('');
    console.log('🎉 Seeder de datos bancarios ejecutado exitosamente');

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
seedTeacherBankInfo()
  .then(() => {
    console.log('✅ Seeder completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error al ejecutar seeder:', error);
    process.exit(1);
  });