import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Configuración de JWT (JSON Web Tokens)
 * Sistema Académico GEM
 * 
 * Usa variables de entorno del archivo .env
 * 
 * El secret debe ser una cadena larga y segura en producción
 * El expiresIn define cuánto tiempo es válido un token
 */
export const getJwtConfig = (
  configService: ConfigService,
): JwtModuleOptions => ({
  // Secret para firmar los tokens
  // IMPORTANTE: Debe ser un string largo y aleatorio en producción
  secret: configService.get<string>(
    'JWT_SECRET',
    'GEM_SECRET_KEY_DEFAULT_CAMBIAR_EN_PRODUCCION',
  ),

  // Opciones de firma del token
  signOptions: {
    // Tiempo de expiración del token
    // Valores posibles: '1d' (1 día), '7d' (7 días), '1h' (1 hora), etc.
    expiresIn: configService.get('JWT_EXPIRATION') || '1d',
  },
});
