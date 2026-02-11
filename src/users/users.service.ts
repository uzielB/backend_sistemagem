import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../common/enums/role.enum';

/**
 * Servicio de Usuarios
 * Maneja toda la lógica de negocio relacionada con usuarios
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Crea un nuevo usuario en el sistema
   * 
   * @param createUserDto - Datos del usuario a crear
   * @returns Usuario creado (sin contraseña)
   * @throws ConflictException si el CURP ya existe
   * @throws BadRequestException si hay errores de validación
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el CURP ya existe
    const existingUser = await this.userRepository.findOne({
      where: { curp: createUserDto.curp },
    });

    if (existingUser) {
      throw new ConflictException(
        `Ya existe un usuario con el CURP: ${createUserDto.curp}`,
      );
    }

    // Verificar si el correo ya existe (si se proporcionó)
    if (createUserDto.correo) {
      const existingEmail = await this.userRepository.findOne({
        where: { correo: createUserDto.correo },
      });

      if (existingEmail) {
        throw new ConflictException(
          `Ya existe un usuario con el correo: ${createUserDto.correo}`,
        );
      }
    }

    // Crear la instancia del usuario
    const newUser = this.userRepository.create(createUserDto);

    // Guardar en la base de datos
    // La contraseña se hasheará automáticamente por el hook @BeforeInsert
    const savedUser = await this.userRepository.save(newUser);

    // Retornar usuario sin contraseña
    delete savedUser.contrasena;
    return savedUser;
  }

  /**
   * Obtiene todos los usuarios del sistema
   * Opcionalmente filtra por rol
   * 
   * @param role - Rol para filtrar (opcional)
   * @returns Lista de usuarios (sin contraseñas)
   */
  async findAll(role?: UserRole): Promise<User[]> {
    const where = role ? { rol: role } : {};

    const users = await this.userRepository.find({
      where,
      order: { fechaCreacion: 'DESC' },
    });

    // Eliminar contraseñas de todos los usuarios
    return users.map((user) => {
      delete user.contrasena;
      return user;
    });
  }

  /**
 * Buscar usuarios por rol
 * @param rol - Rol a buscar (ALUMNO, DOCENTE, ADMIN, SUPER_ADMIN)
 * @param soloActivos - Si es true, solo devuelve usuarios activos
 * @returns Lista de usuarios que cumplen con el rol especificado
 */
async findByRole(rol: UserRole, soloActivos: boolean = true): Promise<User[]> {
  console.log(`📋 UsersService.findByRole()`);
  console.log(`Rol: ${rol}`);
  console.log(`Solo activos: ${soloActivos}`);

  const query = this.userRepository.createQueryBuilder('user')
    .where('user.rol = :rol', { rol });

  if (soloActivos) {
    query.andWhere('user.esta_activo = :activo', { activo: true });
  }

  query
    .select([
      'user.id',
      'user.curp',
      'user.nombre',
      'user.apellido_paterno',
      'user.apellido_materno',
      'user.correo',
      'user.telefono',
      'user.rol',
      'user.esta_activo'
    ])
    .orderBy('user.nombre', 'ASC')
    .addOrderBy('user.apellido_paterno', 'ASC');

  const usuarios = await query.getMany();
  
  console.log(`✅ Usuarios encontrados: ${usuarios.length}`);

  return usuarios;
}

  /**
   * Obtiene un usuario por su ID
   * 
   * @param id - ID del usuario
   * @returns Usuario encontrado (sin contraseña)
   * @throws NotFoundException si no existe el usuario
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`No se encontró el usuario con ID: ${id}`);
    }

    delete user.contrasena;
    return user;
  }

  /**
   * Busca un usuario por su CURP
   * Usado principalmente para autenticación
   * 
   * ✅ CORREGIDO: Usa QueryBuilder para incluir contraseña correctamente
   * 
   * @param curp - CURP del usuario
   * @param includePassword - Si debe incluir la contraseña (para autenticación)
   * @returns Usuario encontrado
   * @throws NotFoundException si no existe el usuario
   */
  async findByCurp(curp: string, includePassword = false): Promise<User> {
    console.log('');
    console.log('📍 UsersService.findByCurp()');
    console.log('CURP buscado:', curp);
    console.log('Incluir contraseña:', includePassword);

    // ✅ CORRECCIÓN: Usar QueryBuilder para incluir contraseña
    let query = this.userRepository
      .createQueryBuilder('user')
      .where('user.curp = :curp', { curp: curp.toUpperCase() });

    // Si se necesita la contraseña, agregarla explícitamente
    if (includePassword) {
      query = query.addSelect('user.contrasena');
    }

    const user = await query.getOne();

    console.log('Usuario encontrado:', user ? 'SÍ' : 'NO');
    if (user) {
      console.log('Usuario ID:', user.id);
      console.log('Contraseña incluida:', user.contrasena ? 'SÍ ✅' : 'NO ❌');
      if (user.contrasena) {
        console.log('Hash (primeros 30 caracteres):', user.contrasena.substring(0, 30) + '...');
      }
    }
    console.log('');

    if (!user) {
      throw new NotFoundException(
        `No se encontró el usuario con CURP: ${curp}`,
      );
    }

    return user;
  }

  /**
   * Busca un usuario por su correo electrónico
   * 
   * @param correo - Correo del usuario
   * @returns Usuario encontrado (sin contraseña)
   * @throws NotFoundException si no existe el usuario
   */
  async findByEmail(correo: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { correo },
    });

    if (!user) {
      throw new NotFoundException(
        `No se encontró el usuario con correo: ${correo}`,
      );
    }

    delete user.contrasena;
    return user;
  }

  /**
   * Actualiza los datos de un usuario
   * No permite actualizar CURP ni contraseña
   * 
   * @param id - ID del usuario a actualizar
   * @param updateUserDto - Datos a actualizar
   * @returns Usuario actualizado (sin contraseña)
   * @throws NotFoundException si no existe el usuario
   * @throws ConflictException si el correo ya existe en otro usuario
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`No se encontró el usuario con ID: ${id}`);
    }

    // Si se está actualizando el correo, verificar que no exista en otro usuario
    if (updateUserDto.correo && updateUserDto.correo !== user.correo) {
      const existingEmail = await this.userRepository.findOne({
        where: { correo: updateUserDto.correo },
      });

      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException(
          `Ya existe otro usuario con el correo: ${updateUserDto.correo}`,
        );
      }
    }

    // Actualizar los campos
    Object.assign(user, updateUserDto);

    // Guardar cambios
    const updatedUser = await this.userRepository.save(user);

    delete updatedUser.contrasena;
    return updatedUser;
  }

  /**
   * Cambia la contraseña de un usuario
   * 
   * @param id - ID del usuario
   * @param newPassword - Nueva contraseña en texto plano
   * @param forceChange - Si debe forzar cambio en próximo login
   * @returns true si la operación fue exitosa
   * @throws NotFoundException si no existe el usuario
   */
  async changePassword(
    id: number,
    newPassword: string,
    forceChange = false,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`No se encontró el usuario con ID: ${id}`);
    }

    // Actualizar contraseña (se hasheará automáticamente por el hook)
    user.contrasena = newPassword;
    user.debeCambiarContrasena = forceChange;

    await this.userRepository.save(user);

    return true;
  }

  /**
   * Desactiva un usuario (baja lógica)
   * El usuario no se elimina, solo se marca como inactivo
   * 
   * @param id - ID del usuario a desactivar
   * @returns Usuario desactivado (sin contraseña)
   * @throws NotFoundException si no existe el usuario
   */
  async deactivate(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`No se encontró el usuario con ID: ${id}`);
    }

    user.estaActivo = false;
    const deactivatedUser = await this.userRepository.save(user);

    delete deactivatedUser.contrasena;
    return deactivatedUser;
  }

  /**
   * Reactiva un usuario previamente desactivado
   * 
   * @param id - ID del usuario a reactivar
   * @returns Usuario reactivado (sin contraseña)
   * @throws NotFoundException si no existe el usuario
   */
  async activate(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`No se encontró el usuario con ID: ${id}`);
    }

    user.estaActivo = true;
    const activatedUser = await this.userRepository.save(user);

    delete activatedUser.contrasena;
    return activatedUser;
  }

  /**
   * Elimina permanentemente un usuario (baja física)
   * PRECAUCIÓN: Esta operación no se puede deshacer
   * 
   * @param id - ID del usuario a eliminar
   * @returns true si la operación fue exitosa
   * @throws NotFoundException si no existe el usuario
   */
  async remove(id: number): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`No se encontró el usuario con ID: ${id}`);
    }

    await this.userRepository.remove(user);
    return true;
  }

  /**
   * Actualiza la fecha de último acceso del usuario
   * Se llama automáticamente al hacer login exitoso
   * 
   * @param id - ID del usuario
   */
  async updateLastAccess(id: number): Promise<void> {
    await this.userRepository.update(id, {
      ultimoAcceso: new Date(),
    });
  }

  /**
   * Obtiene estadísticas de usuarios por rol
   * 
   * @returns Objeto con el conteo de usuarios por rol
   */
  async getStatistics(): Promise<{
    total: number;
    byRole: Record<UserRole, number>;
    active: number;
    inactive: number;
  }> {
    const users = await this.userRepository.find();

    const statistics = {
      total: users.length,
      byRole: {
        [UserRole.SUPER_ADMIN]: 0,
        [UserRole.ADMIN]: 0,
        [UserRole.DOCENTE]: 0,
        [UserRole.ALUMNO]: 0,
        [UserRole.GUEST]: 0,
      },
      active: 0,
      inactive: 0,
    };

    users.forEach((user) => {
      statistics.byRole[user.rol]++;
      if (user.estaActivo) {
        statistics.active++;
      } else {
        statistics.inactive++;
      }
    });

    return statistics;
  }
}