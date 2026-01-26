import {Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../common/enums/role.enum';

/**
 * Controlador de Usuarios
 * Maneja todas las peticiones HTTP relacionadas con usuarios
 * 
 * Rutas base: /api/users

 */
@Controller('users')
// @UseGuards(JwtAuthGuard) // Activar cuando tengamos el módulo de Auth
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /api/users
   * Crea un nuevo usuario
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   * 
   * @param createUserDto - Datos del usuario a crear
   * @returns Usuario creado
   */
  @Post()
  // @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN) // Activar con guards
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    return {
      message: 'Usuario creado exitosamente',
      data: user,
    };
  }

  /**
   * GET /api/users
   * Obtiene todos los usuarios
   * Opcionalmente filtra por rol usando query param: ?role=DOCENTE
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   * 
   * @param role - Rol para filtrar (opcional)
   * @returns Lista de usuarios
   */
  @Get()
  // @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findAll(@Query('role') role?: UserRole) {
    const users = await this.usersService.findAll(role);

    return {
      message: 'Usuarios obtenidos exitosamente',
      data: users,
      count: users.length,
    };
  }

  /**
   * GET /api/users/statistics
   * Obtiene estadísticas de usuarios
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   * 
   * @returns Estadísticas de usuarios
   */
  @Get('statistics')
  // @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getStatistics() {
    const statistics = await this.usersService.getStatistics();

    return {
      message: 'Estadísticas obtenidas exitosamente',
      data: statistics,
    };
  }

  /**
   * GET /api/users/curp/:curp
   * Busca un usuario por su CURP
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   * 
   * @param curp - CURP del usuario
   * @returns Usuario encontrado
   */
  @Get('curp/:curp')
  // @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findByCurp(@Param('curp') curp: string) {
    const user = await this.usersService.findByCurp(curp);

    return {
      message: 'Usuario encontrado',
      data: user,
    };
  }

  /**
   * GET /api/users/:id
   * Obtiene un usuario por su ID
   * 
   * Requiere autenticación
   * 
   * @param id - ID del usuario
   * @returns Usuario encontrado
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);

    return {
      message: 'Usuario encontrado',
      data: user,
    };
  }

  /**
   * PATCH /api/users/:id
   * Actualiza los datos de un usuario
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   * 
   * @param id - ID del usuario a actualizar
   * @param updateUserDto - Datos a actualizar
   * @returns Usuario actualizado
   */
  @Patch(':id')
  // @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);

    return {
      message: 'Usuario actualizado exitosamente',
      data: user,
    };
  }

  /**
   * PATCH /api/users/:id/change-password
   * Cambia la contraseña de un usuario
   * 
   * Requiere rol: SUPER_ADMIN o el mismo usuario
   * 
   * @param id - ID del usuario
   * @param body - Objeto con la nueva contraseña
   * @returns Confirmación del cambio
   */
  @Patch(':id/change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { newPassword: string; forceChange?: boolean },
  ) {
    await this.usersService.changePassword(
      id,
      body.newPassword,
      body.forceChange,
    );

    return {
      message: 'Contraseña actualizada exitosamente',
    };
  }

  /**
   * PATCH /api/users/:id/deactivate
   * Desactiva un usuario (baja lógica)
   * 
   * Requiere rol: SUPER_ADMIN
   * 
   * @param id - ID del usuario a desactivar
   * @returns Usuario desactivado
   */
  @Patch(':id/deactivate')
  // @Roles(UserRole.SUPER_ADMIN)
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.deactivate(id);

    return {
      message: 'Usuario desactivado exitosamente',
      data: user,
    };
  }

  /**
   * PATCH /api/users/:id/activate
   * Reactiva un usuario previamente desactivado
   * 
   * Requiere rol: SUPER_ADMIN
   * 
   * @param id - ID del usuario a reactivar
   * @returns Usuario reactivado
   */
  @Patch(':id/activate')
  // @Roles(UserRole.SUPER_ADMIN)
  async activate(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.activate(id);

    return {
      message: 'Usuario reactivado exitosamente',
      data: user,
    };
  }

  /**
   * DELETE /api/users/:id
   * Elimina permanentemente un usuario (baja física)
   * 
   * Requiere rol: SUPER_ADMIN
   * PRECAUCIÓN: Esta operación no se puede deshacer
   * 
   * @param id - ID del usuario a eliminar
   * @returns Confirmación de eliminación
   */
  @Delete(':id')
  // @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.remove(id);

    return {
      message: 'Usuario eliminado permanentemente',
    };
  }
}
