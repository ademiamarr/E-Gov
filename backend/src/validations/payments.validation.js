const { z } = require('zod')

const processPaymentSchema = z.object({
  fineId: z.string().min(1),
  fineType: z.string().min(1),
  amount: z.number().positive(),
  cardData: z.object({
    cardNumber: z.string().regex(/^\d{16}$/),
    holderName: z.string().min(3),
    expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/),
    expiryYear: z.string().regex(/^\d{4}$/),
    cvv: z.string().regex(/^\d{3,4}$/),
  }),
  lang: z.enum(['mk', 'sq', 'en']).default('mk'),
})

module.exports = { processPaymentSchema }