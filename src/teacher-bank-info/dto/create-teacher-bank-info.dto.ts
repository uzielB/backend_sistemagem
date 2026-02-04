import { IsInt, IsString, IsOptional, IsNotEmpty, Length, Matches } from 'class-validator';

/**
 * DTO para crear datos bancarios de un docente
 */
export class CreateTeacherBankInfoDto {
  /**
   * ID del docente
   */
  @IsInt({ message: 'El ID del docente debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del docente es obligatorio' })
  docenteId: number;

  /**
   * Nombre del beneficiario
   */
  @IsString({ message: 'El beneficiario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El beneficiario es obligatorio' })
  @Length(3, 255, {
    message: 'El beneficiario debe tener entre 3 y 255 caracteres',
  })
  beneficiario: string;

  /**
   * Nombre del banco
   */
  @IsString({ message: 'El banco debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El banco es obligatorio' })
  @Length(3, 100, {
    message: 'El banco debe tener entre 3 y 100 caracteres',
  })
  banco: string;

  /**
   * Número de cuenta
   * Entre 10 y 20 dígitos
   */
  @IsString({ message: 'El número de cuenta debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de cuenta es obligatorio' })
  @Matches(/^[0-9]{10,20}$/, {
    message: 'El número de cuenta debe tener entre 10 y 20 dígitos',
  })
  numeroCuenta: string;

  /**
   * Número de tarjeta (opcional)
   * 16 dígitos, puede tener espacios
   */
  @IsOptional()
  @IsString({ message: 'El número de tarjeta debe ser una cadena de texto' })
  @Matches(/^[0-9\s]{13,19}$/, {
    message: 'El número de tarjeta debe tener entre 13 y 19 caracteres (puede incluir espacios)',
  })
  numeroTarjeta?: string;

  /**
   * CLABE interbancaria
   * Exactamente 18 dígitos
   */
  @IsString({ message: 'La CLABE debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La CLABE interbancaria es obligatoria' })
  @Matches(/^[0-9]{18}$/, {
    message: 'La CLABE interbancaria debe tener exactamente 18 dígitos',
  })
  clabeInterbancaria: string;
}