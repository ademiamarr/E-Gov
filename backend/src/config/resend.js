const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = `E-Gov Maqedonia <${process.env.RESEND_FROM_EMAIL || 'noreply@e-gov.mk'}>`

const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html })
    if (error) return { success: false, error }
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

module.exports = { resend, FROM, sendEmail }