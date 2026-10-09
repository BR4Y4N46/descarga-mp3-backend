import rateLimit from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Espera un minuto.' },
  validate: { xForwardedForHeader: false }   // 👈 añade esto
})
