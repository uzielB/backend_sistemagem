import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToOne, OneToMany, BeforeInsert, BeforeUpdate,} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../common/enums/role.enum';

/**
 * Entidad User
 * Tabla principal de autenticación del Sistema Académico GEM
 * 
 * Esta entidad almacena las credenciales y datos básicos de todos los usuarios del sistema.
 * El login se realiza mediante CURP y contraseña.
 * 
 * @table usuarios
 */
@Entity('usuarios')
@Index('idx_usuarios_curp', ['curp'])
@Index('idx_usuarios_correo', ['correo'])
@Index('idx_usuarios_rol', ['rol'])
export class User {
  /**
   * ID único del usuario
   * Generado automáticamente por PostgreSQL
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
    
   * @unique
   * @length 18
   */
  @Column({ type: 'varchar', length: 18, unique: true, nullable: false })
  curp: string;

  /**
   * Contraseña hasheada con bcrypt
   * Se excluye automáticamente en las respuestas JSON por seguridad
   * El hash se genera automáticamente antes de insertar/actualizar
   * 
   * @hashed bcrypt con 10 rounds
   * @exclude en respuestas JSON
   */
  @Column({ type: 'varchar', length: 255, nullable: false })
  @Exclude()
  contrasena: string;

  /**
   * Correo electrónico del usuario
   * Opcional - puede ser null para algunos usuarios
   * Se usa para recuperación de contraseña y notificaciones
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  correo: string;

  /**
   * Rol del usuario en el sistema
   * Define los permisos y accesos del usuario
   * 
   * Valores posibles:
   * - SUPER_ADMIN: Administrador maestro con acceso total
   * - ADMIN: Sub-administrador con permisos limitados
   * - DOCENTE: Profesor con acceso académico
   * - ALUMNO: Estudiante con acceso de consulta
   */
  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: false,
  })
  rol: UserRole;

  /**
   * Nombre(s) del usuario
   * @example "Juan Carlos"
   */
  @Column({ type: 'varchar', length: 100, nullable: false })
  nombre: string;

  /**
   * Apellido paterno del usuario
   * @example "García"
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    name: 'apellido_paterno',
  })
  apellidoPaterno: string;

  /**
   * Apellido materno del usuario
   * Opcional - puede ser null
   * @example "López"
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'apellido_materno',
  })
  apellidoMaterno: string;

  /**
   * Teléfono de contacto
   * Opcional - puede ser null
   * @example "951-123-4567"
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

 
  @Column({ type: 'boolean', default: true, name: 'esta_activo' })
  estaActivo: boolean;


  @Column({
    type: 'boolean',
    default: true,
    name: 'debe_cambiar_contrasena',
  })
  debeCambiarContrasena: boolean;

  /**
   * Fecha y hora del último acceso del usuario
   * Se actualiza cada vez que el usuario inicia sesión exitosamente
   * Útil para auditoría y seguridad
   */
  @Column({ type: 'timestamp', nullable: true, name: 'ultimo_acceso' })
  ultimoAcceso: Date;

  /**
   * Fecha de creación del registro
   * Se establece automáticamente al crear el usuario
   * No se puede modificar
   */
  @CreateDateColumn({ type: 'timestamp', name: 'fecha_creacion' })
  fechaCreacion: Date;

  /**
   * Fecha de última actualización del registro
   * Se actualiza automáticamente cada vez que se modifica el usuario
   */
  @UpdateDateColumn({ type: 'timestamp', name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Solo hashear si la contraseña fue modificada y no está hasheada
    if (this.contrasena && !this.contrasena.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.contrasena = await bcrypt.hash(this.contrasena, salt);
    }
  }

  /**
   * Método para validar la contraseña
   * Compara la contraseña en texto plano con el hash almacenado
   * 
   * @param password - Contraseña en texto plano a validar
   * @returns true si la contraseña es correcta, false en caso contrario
   */
  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.contrasena);
  }

  /**
   * Obtiene el nombre completo del usuario
   * Formato: "Nombre ApellidoPaterno ApellidoMaterno"
   * 
   * @returns Nombre completo del usuario
   */
  getFullName(): string {
    const parts = [this.nombre, this.apellidoPaterno];
    if (this.apellidoMaterno) {
      parts.push(this.apellidoMaterno);
    }
    return parts.join(' ');
  }

  /**
   * Verifica si el usuario es administrador (SUPER_ADMIN o ADMIN)
   * 
   * @returns true si el usuario tiene rol administrativo
   */
  isAdmin(): boolean {
    return this.rol === UserRole.SUPER_ADMIN || this.rol === UserRole.ADMIN;
  }

  /**
   * Verifica si el usuario es Super Administrador
   * 
   * @returns true si el usuario es SUPER_ADMIN
   */
  isSuperAdmin(): boolean {
    return this.rol === UserRole.SUPER_ADMIN;
  }

  /**
   * Verifica si el usuario es Docente
   * 
   * @returns true si el usuario es DOCENTE
   */
  isTeacher(): boolean {
    return this.rol === UserRole.DOCENTE;
  }

  /**
   * Verifica si el usuario es Alumno
   * 
   * @returns true si el usuario es ALUMNO
   */
  isStudent(): boolean {
    return this.rol === UserRole.ALUMNO;
  }

  /**
   * Actualiza la fecha de último acceso a ahora
   */
  updateLastAccess(): void {
    this.ultimoAcceso = new Date();
  }
}