import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

/**
 * Controlador de Usuarios
 * Rutas protegidas con autenticación JWT y control de roles
 * 
 * Rutas base: /api/users
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // ✅ Proteger todas las rutas
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /api/users
   * Crea un nuevo usuario
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
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
   * 
   * Requiere rol: SUPER_ADMIN o ADMIN
   */
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
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
   */
  @Get('statistics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
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
   */
  @Get('curp/:curp')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
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
   * Requiere autenticación (cualquier rol autenticado)
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
   */
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
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
   * Requiere rol: SUPER_ADMIN
   */
  @Patch(':id/change-password')
  @Roles(UserRole.SUPER_ADMIN)
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
   */
  @Patch(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN)
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
   */
  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN)
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
   */
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.remove(id);

    return {
      message: 'Usuario eliminado permanentemente',
    };
  }
}