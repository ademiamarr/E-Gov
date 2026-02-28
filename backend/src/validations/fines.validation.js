const { z } = require('zod')

const getFinesSchema = z.object({
  embg: z.string().length(13, 'EMBG duhet të ketë 13 shifra'),
})

const addFineSchema = z.object({
  userId: z.string().uuid(),
  fineNumber: z.string().min(1),
  type: z.enum(['traffic', 'parking', 'administrative', 'other']),
  description: z.string().min(1).max(500),
  amount: z.number().positive(),
  issuedDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  issuedBy: z.string().min(1),
})

module.exports = { getFinesSchema, addFineSchema }