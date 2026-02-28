const { z } = require('zod')

const createAppointmentSchema = z.object({
  slotId: z.string().uuid(),
  documentTypeId: z.string().uuid(),
  officeId: z.string().uuid(),
  lang: z.enum(['mk', 'sq', 'en']).default('mk'),
})
const cancelAppointmentSchema = z.object({ appointmentId: z.string().uuid() })
const createSlotsSchema = z.object({
  officeId: z.string().uuid(),
  documentTypeId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slots: z.array(z.object({
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
  })).min(1),
})
module.exports = { createAppointmentSchema, cancelAppointmentSchema, createSlotsSchema }