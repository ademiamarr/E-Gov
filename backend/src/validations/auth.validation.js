const { z } = require('zod')
const { validateEMBG } = require('../utils/validateEMBG')

const registerSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  embg: z.string().length(13).refine(
    (val) => validateEMBG(val).valid,
    (val) => ({ message: validateEMBG(val).error || 'EMBG i pavlefshëm' })
  ),
  email: z.string().email().max(100),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  clerkUserId: z.string().min(1),
  documentPhotoPath: z.string().optional(),
  lang: z.enum(['mk', 'sq', 'en']).default('mk'),
})

const verifyCodeSchema = z.object({
  clerkUserId: z.string().min(1),
  email: z.string().email(),
  code: z.string().length(6).regex(/^\d{6}$/),
  lang: z.enum(['mk', 'sq', 'en']).default('mk'),
})

const resendCodeSchema = z.object({
  clerkUserId: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().min(1),
  lang: z.enum(['mk', 'sq', 'en']).default('mk'),
})

const approveUserSchema = z.object({ userId: z.string().uuid() })
const rejectUserSchema = z.object({ userId: z.string().uuid(), reason: z.string().max(500).optional() })

module.exports = { registerSchema, verifyCodeSchema, resendCodeSchema, approveUserSchema, rejectUserSchema }