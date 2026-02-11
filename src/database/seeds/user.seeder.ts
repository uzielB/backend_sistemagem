import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { UsersService } from '../../users/users.service';
import { UserRole } from '../../common/enums/role.enum';
import { CreateUserDto } from '../../users/dto/create-user.dto';

/**
 * Seeder de Usuarios Iniciales
 * Crea 6 usuarios de prueba del sistema (1 SuperAdmin, 1 Admin, 3 Docentes, 1 Alumno)
 *
 * Para ejecutar:
 * npm run build
 * node dist/database/seeds/user.seeder.js
 */
async function seedUsers() {
  console.log('');
  console.log('================================================');
  console.log('🌱 SEEDER DE USUARIOS - Sistema Académico GEM');
  console.log('================================================');
  console.log('');

  // Crear aplicación NestJS
  const app = await NestFactory.createApplicationContext(AppModule);

  // Obtener servicio de usuarios
  const usersService = app.get(UsersService);

  // Usuarios iniciales según el diseño de BD
  const initialUsers: CreateUserDto[] = [
    // SUPER ADMINISTRADOR
    {
      curp: 'SUPE800101HDFXXX01',
      contrasena: 'super1234',
      correo: 'superadmin@gem.edu.mx',
      rol: UserRole.SUPER_ADMIN,
      nombre: 'Super',
      apellidoPaterno: 'Administrador',
      apellidoMaterno: 'GEM',
      telefono: '951-000-0001',
      estaActivo: true,
      debeCambiarContrasena: false,
    },

    // ADMINISTRADOR
    {
      curp: 'ADMI850101HDFXXX02',
      contrasena: 'admin1234',
      correo: 'admin@gem.edu.mx',
      rol: UserRole.ADMIN,
      nombre: 'Administrador',
      apellidoPaterno: 'General',
      apellidoMaterno: 'GEM',
      telefono: '951-000-0002',
      estaActivo: true,
      debeCambiarContrasena: false,
    },

    // DOCENTE 1
    {
      curp: 'DOCE900101HDFXXX03',
      contrasena: 'docente1234',
      correo: 'docente1@gem.edu.mx',
      rol: UserRole.DOCENTE,
      nombre: 'María',
      apellidoPaterno: 'González',
      apellidoMaterno: 'López',
      telefono: '951-000-0003',
      estaActivo: true,
      debeCambiarContrasena: false,
    },

    // DOCENTE 2
    {
      curp: 'DOCE910101HDFXXX04',
      contrasena: 'docente2234',
      correo: 'docente2@gem.edu.mx',
      rol: UserRole.DOCENTE,
      nombre: 'Carlos',
      apellidoPaterno: 'Ramírez',
      apellidoMaterno: 'Santos',
      telefono: '951-000-0004',
      estaActivo: true,
      debeCambiarContrasena: false,
    },

    // DOCENTE 3
    {
      curp: 'DOCE920101HDFXXX05',
      contrasena: 'docente3234',
      correo: 'docente3@gem.edu.mx',
      rol: UserRole.DOCENTE,
      nombre: 'Ana',
      apellidoPaterno: 'Martínez',
      apellidoMaterno: 'Ruiz',
      telefono: '951-000-0005',
      estaActivo: true,
      debeCambiarContrasena: false,
    },

    // ALUMNO
    {
      curp: 'ALUM050101HDFXXX06',
      contrasena: 'alumno1234',
      correo: 'alumno@gem.edu.mx',
      rol: UserRole.ALUMNO,
      nombre: 'Estudiante',
      apellidoPaterno: 'Ejemplo',
      apellidoMaterno: 'Demo',
      telefono: '951-000-0006',
      estaActivo: true,
      debeCambiarContrasena: false,
    },
  ];

  console.log('📝 Creando usuarios iniciales...');
  console.log('');

  let created = 0;
  let existing = 0;

  for (const userData of initialUsers) {
    try {
      const user = await usersService.create(userData);

      console.log(`✅ Usuario creado: ${user.curp} (${user.rol})`);
      console.log(
        `   Nombre: ${user.nombre} ${user.apellidoPaterno} ${user.apellidoMaterno || ''}`,
      );
      console.log(`   Correo: ${user.correo}`);
      console.log(`   Contraseña inicial: ${userData.contrasena}`);
      console.log('');

      created++;
    } catch (error) {
      if (error.message.includes('Ya existe')) {
        console.log(`⚠️  Usuario ya existe: ${userData.curp}`);
        console.log('');
        existing++;
      } else {
        console.error(
          `❌ Error al crear usuario ${userData.curp}:`,
          error.message,
        );
        console.log('');
      }
    }
  }

  console.log('================================================');
  console.log('📊 RESUMEN:');
  console.log(`   ✅ Usuarios creados: ${created}`);
  console.log(`   ⚠️  Usuarios existentes: ${existing}`);
  console.log(`   📝 Total procesados: ${initialUsers.length}`);
  console.log('================================================');
  console.log('');
  console.log('🔑 CREDENCIALES DE ACCESO:');
  console.log('');
  console.log('   SUPER ADMIN:');
  console.log('   CURP: SUPE800101HDFXXX01');
  console.log('   Contraseña: super1234');
  console.log('');
  console.log('   ADMIN:');
  console.log('   CURP: ADMI850101HDFXXX02');
  console.log('   Contraseña: admin1234');
  console.log('');
  console.log('   DOCENTE 1:');
  console.log('   CURP: DOCE900101HDFXXX03');
  console.log('   Contraseña: docente1234');
  console.log('');
  console.log('   DOCENTE 2:');
  console.log('   CURP: DOCE910101HDFXXX04');
  console.log('   Contraseña: docente2234');
  console.log('');
  console.log('   DOCENTE 3:');
  console.log('   CURP: DOCE920101HDFXXX05');
  console.log('   Contraseña: docente3234');
  console.log('');
  console.log('   ALUMNO:');
  console.log('   CURP: ALUM050101HDFXXX06');
  console.log('   Contraseña: alumno1234');
  console.log('');
  console.log('================================================');
  console.log('');

  // Cerrar aplicación
  await app.close();
}

// Ejecutar seeder
seedUsers()
  .then(() => {
    console.log('✅ Seeder completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error al ejecutar seeder:', error);
    process.exit(1);
  });