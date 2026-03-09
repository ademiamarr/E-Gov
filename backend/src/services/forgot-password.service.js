const { supabase } = require('../config/supabase')
const { sendEmail } = require('../config/resend')
const { generateVerifyCode, generateCodeExpiry } = require('../utils/generateVerifyCode')

const requestPasswordReset = async (email) => {
  // Kërko userin sipas email
  const { data: user, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, email')
    .eq('email', email)
    .single()

  if (error || !user) {
    // Security: Mos thuaj se email nuk ekziston
    return { success: true, message: 'Nëse email-i ekziston, do të merrni një lidhje për rivendosjen' }
  }

  // Gjenero kodin e reset
  const resetCode = generateVerifyCode()
  const codeExpiry = generateCodeExpiry()

  // Ruaj kodin në database (krijo tabelën nëse nuk ekziston)
  const { error: updateErr } = await supabase
    .from('password_resets')
    .insert([{
      user_id: user.id,
      email: user.email,
      reset_code: resetCode,
      code_expiry: codeExpiry,
      used: false
    }])

  if (updateErr) {
    console.error('Password reset save error:', updateErr)
    throw { status: 500, message: 'Gabim në shërbim' }
  }

  // Dërgo email me linkun
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?code=${resetCode}&email=${encodeURIComponent(user.email)}`

  try {
    await sendEmail({
      to: user.email,
      subject: '🔐 Rivendosja e fjalëkalimit — eGov Portal',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 40px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">🇲🇰 eGov Portal</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px;">Republika e Maqedonisë së Veriut</p>
          </div>
          <div style="padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 8px;">Rivendosja e fjalëkalimit</h2>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">Përshëndetje, <strong>${user.first_name}</strong>!</p>
            
            <p style="color: #374151; font-size: 14px; margin: 0 0 16px; line-height: 1.6;">
              Ju kërkuan rivendosjen e fjalëkalimit. Klikoni butonin më poshtë për të vazhduar:
            </p>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetLink}" style="display: inline-block; background: #1e3a8a; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                🔑 Rivendos fjalëkalimin
              </a>
            </div>

            <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.6;">
              Ose kopjo këtë kod: <strong style="font-family: monospace;">${resetCode}</strong>
            </p>

            <div style="background: #fef3c7; border-radius: 8px; padding: 14px 18px; margin-top: 16px;">
              <p style="color: #92400e; font-size: 12px; margin: 0; font-weight: 600;">
                ⚠️ Ky kod skadon në 30 minuta. Nëse nuk e kërkuat këtë, inoroni emailin.
              </p>
            </div>
          </div>
          <p style="text-align: center; color: #d1d5db; font-size: 11px; margin: 20px 0;">
            © 2026 eGov Portal — Republika e Maqedonisë së Veriut
          </p>
        </div>
      `
    })
  } catch (emailErr) {
    console.error('Reset email failed:', emailErr.message)
  }

  return { success: true, message: 'Nëse email-i ekziston, do të merrni një lidhje për rivendosjen' }
}

const resetPassword = async (email, resetCode, newPassword) => {
  // Valido kodin
  const { data: resetRecord, error: queryErr } = await supabase
    .from('password_resets')
    .select('id, user_id, code_expiry, used')
    .eq('email', email)
    .eq('reset_code', resetCode)
    .eq('used', false)
    .single()

  if (queryErr || !resetRecord) {
    throw { status: 400, message: 'Kodi nuk është i saktë ose ka skaduar' }
  }

  // Kontrollo ekspirimin
  if (new Date() > new Date(resetRecord.code_expiry)) {
    throw { status: 400, message: 'Kodi ka skaduar. Kërkoni një kod të ri.' }
  }

  // Përditëso fjalëkalimin në Clerk
  const Clerk = require('@clerk/clerk-sdk-node')
  
  try {
    const { data: user } = await supabase
      .from('users')
      .select('clerk_id')
      .eq('id', resetRecord.user_id)
      .single()

    if (!user?.clerk_id) {
      throw { status: 400, message: 'Useri nuk u gjet' }
    }

    await Clerk.users.updateUser(user.clerk_id, { password: newPassword })

    // Shëno kodin si i përdorur
    await supabase
      .from('password_resets')
      .update({ used: true })
      .eq('id', resetRecord.id)

    return { success: true, message: 'Fjalëkalimi u ndryshua me sukses' }
  } catch (err) {
    console.error('Password reset error:', err)
    throw { status: 500, message: 'Gabim në ndryshimin e fjalëkalimit' }
  }
}

module.exports = { requestPasswordReset, resetPassword }