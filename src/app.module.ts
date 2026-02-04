import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TeachersModule } from './teachers/teachers.module';
import { ProgramsModule } from './programs/programs.module';
import { ScheduleModulesModule } from './schedule-modules/schedule-modules.module';
import { SchoolPeriodsModule } from './school-periods/school-periods.module';
import { TeacherAvailabilityModule } from './teacher-availability/teacher-availability.module';
import { TeacherBankInfoModule } from './teacher-bank-info/teacher-bank-info.module';
import { TeacherDocumentsModule } from './teacher-documents/teacher-documents.module';
@Module({
  imports: [
    // ✅ Configuración de variables de entorno (.env)
    // isGlobal: true hace que esté disponible en toda la app
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ✅ Configuración de TypeORM usando variables de entorno
    // Lee las credenciales del archivo .env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),

    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    TeachersModule,
    ProgramsModule,
    ScheduleModulesModule,
    SchoolPeriodsModule,
    TeacherAvailabilityModule,
    TeacherBankInfoModule,
    TeacherDocumentsModule,
    // TODO: Agregar más módulos según se vayan creando:
    // StudentsModule,
    // SubjectsModule,
    // PeriodsModule,
    // GroupsModule,
    // AssignmentsModule,
    // GradesModule,
    // AttendanceModule,
    // FinanceModule,
    // PreEnrollmentModule,
    // NotificationsModule,
    // AuditModule,
  ],
  controllers: [AppController], // Mantener si los tienes
  providers: [AppService], // Mantener si los tienes
})
export class AppModule {}