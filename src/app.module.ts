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
import { SyllabusesModule } from './syllabuses/syllabuses.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),


    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),

    AuthModule,
    UsersModule,
    TeachersModule,
    ProgramsModule,
    ScheduleModulesModule,
    SchoolPeriodsModule,
    TeacherAvailabilityModule,
    TeacherBankInfoModule,
    TeacherDocumentsModule,
    SyllabusesModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}