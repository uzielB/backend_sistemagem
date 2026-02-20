import { 
  IsNumber, 
  IsInt, 
  IsArray, 
  IsNotEmpty, 
  Min, 
  Max, 
  ArrayMinSize, 
  ArrayMaxSize,
  IsString,
  Matches
} from 'class-validator';

/**
 * DTO para configuración financiera del estudiante
 * Se usa al inscribir un nuevo estudiante
 */
export class ConfiguracionFinancieraDto {
  
  @IsNumber({}, { message: 'El total del semestre debe ser un número' })
  @IsNotEmpty({ message: 'El total del semestre es obligatorio' })
  @Min(1, { message: 'El total debe ser mayor a 0' })
  totalSemestre: number;

  @IsNumber({}, { message: 'El porcentaje de beca debe ser un número' })
  @IsNotEmpty({ message: 'El porcentaje de beca es obligatorio' })
  @Min(0, { message: 'El porcentaje mínimo es 0' })
  @Max(30, { message: 'El porcentaje máximo es 30' })
  porcentajeBeca: number; // Opciones: 0, 5, 10, 15, 20, 25, 30

  @IsInt({ message: 'El número de pagos debe ser un entero' })
  @IsNotEmpty({ message: 'El número de pagos es obligatorio' })
  numeroPagos: number; // 1, 5 o 6

  @IsArray({ message: 'Las fechas de vencimiento deben ser un arreglo' })
  @IsNotEmpty({ message: 'Las fechas de vencimiento son obligatorias' })
  @ArrayMinSize(1, { message: 'Debe haber al menos 1 fecha' })
  @ArrayMaxSize(6, { message: 'Máximo 6 fechas' })
  @IsString({ each: true, message: 'Cada fecha debe ser un string en formato YYYY-MM-DD' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { 
    each: true, 
    message: 'Formato de fecha inválido. Use YYYY-MM-DD' 
  })
  fechasVencimiento: string[]; // Array de fechas en formato YYYY-MM-DD

  @IsInt({ message: 'El periodo escolar debe ser un entero' })
  @IsNotEmpty({ message: 'El periodo escolar es obligatorio' })
  periodoEscolarId: number;
}

/**
 * Response después de generar configuración financiera
 */
export class ConfiguracionFinancieraResponse {
  estadoFinanciero: {
    id: number;
    totalSemestre: number;
    porcentajeBecaAplicado: number;
    totalDescuento: number;
    totalConDescuento: number;
    numeroPagos: number;
    montoPorPago: number;
    saldo: number;
  };
  
  pagos: Array<{
    id: number;
    numeroParcialidad: number;
    montoFinal: number;
    fechaVencimiento: string;
    estatus: string;
  }>;
}