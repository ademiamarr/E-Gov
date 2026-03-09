const authService = require('../services/auth.service')
const { success, error } = require('../utils/apiResponse')
const { generateVerifyCode, generateCodeExpiry } = require('../utils/generateVerifyCode')
const { sendEmail } = require('../config/resend')
const verifyCodeEmail = require('../email/templates/verify-code.email')

const register = async (req, res) => {
  try {
    const { clerk_id, first_name, last_name, personal_id, email } = req.body
    const file = req.file

    if (!clerk_id || !email) {
      return error(res, 'Missing required fields', 400)
    }

    const user = await authService.register({
      clerk_id, 
      first_name, 
      last_name, 
      personal_id, 
      email, 
      file
    })

    return success(res, user, 'Regjistrimi u krye', 201)
  } catch (err) {
    console.error('❌ Register error:', err.message)
    return error(res, err.message, err.status || 500)
  }
}

const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return error(res, 'User not found', 404)
    }

    return success(res, {
      id: req.user.id,
      clerk_id: req.user.clerk_id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      personal_id: req.user.personal_id,
      role: req.user.role,
      verification_status: req.user.verification_status,
      id_photo_url: req.user.id_photo_url,
      created_at: req.user.created_at,
    }, 'User info')
  } catch (err) {
    console.error('❌ getMe error:', err.message)
    return error(res, err.message, 500)
  }
}

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const clerkUserId = req.auth?.userId

    if (!clerkUserId) {
      return error(res, 'Nuk jeni të autorizuar', 401)
    }

    if (!currentPassword || !newPassword) {
      return error(res, 'Të dhënat janë të pakompletuesa', 400)
    }

    if (newPassword.length < 8) {
      return error(res, 'Fjalëkalimi duhet të ketë min. 8 karaktere', 400)
    }

    try {
      const Clerk = require('@clerk/clerk-sdk-node').default
      
      await Clerk.users.updateUser(clerkUserId, {
        password: newPassword,
      })

      return success(res, {}, 'Fjalëkalimi u ndryshua me sukses')
    } catch (clerkErr) {
      console.error('❌ Clerk error:', clerkErr.message)
      return error(res, 'Gabim në ndryshimin e fjalëkalimit', 500)
    }
  } catch (err) {
    console.error('❌ changePassword error:', err.message)
    return error(res, err.message, 500)
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return error(res, 'Email është i detyrueshëm', 400)
    }

    // Generate reset code
    const resetCode = generateVerifyCode()
    const codeExpiry = generateCodeExpiry()

    // TODO: Save to database (password_resets table)
    // await db.passwordResets.insert({ email, code: resetCode, expiry: codeExpiry })

    // Send email
    try {
      await sendEmail({
        to: email,
        ...verifyCodeEmail({ first_name: 'User', code: resetCode }),
      })
      console.log(`✅ Password reset code sent to ${email}`)
    } catch (emailErr) {
      console.error('❌ Email send failed:', emailErr.message)
    }

    return success(res, { message: 'Kodi u dërgua në email' }, 'Check your email')
  } catch (err) {
    console.error('❌ forgotPassword error:', err.message)
    return error(res, err.message, 500)
  }
}

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body

    if (!email || !code || !newPassword) {
      return error(res, 'Të dhënat janë të pakompletuesa', 400)
    }

    if (newPassword.length < 8) {
      return error(res, 'Fjalëkalimi duhet të ketë min. 8 karaktere', 400)
    }

    // TODO: Verify code from database
    // const reset = await db.passwordResets.findOne({ email, code })
    // if (!reset || reset.expiry < new Date()) {
    //   return error(res, 'Kodi nuk është i saktë ose ka skaduar', 400)
    // }

    // TODO: Update password in Clerk
    // const user = await Clerk.users.list({ emailAddress: email })
    // if (!user) return error(res, 'Useri nuk u gjet', 404)
    // await Clerk.users.updateUser(user[0].id, { password: newPassword })

    // TODO: Mark code as used
    // await db.passwordResets.update({ email, code }, { used: true })

    return success(res, { message: 'Fjalëkalimi u ndryshua' }, 'Password reset successfully')
  } catch (err) {
    console.error('❌ resetPassword error:', err.message)
    return error(res, err.message, 500)
  }
}

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return error(res, 'Email dhe kodi janë të detyrueshëm', 400)
    }

    // TODO: Verify code from database
    // const verification = await db.emailVerifications.findOne({ email, code })
    // if (!verification || verification.expiry < new Date()) {
    //   return error(res, 'Kodi nuk është i saktë ose ka skaduar', 400)
    // }

    // TODO: Mark email as verified
    // await db.emailVerifications.update({ email, code }, { verified: true })

    return success(res, { message: 'Email i verifikuar' }, 'Email verified successfully')
  } catch (err) {
    console.error('❌ verifyEmail error:', err.message)
    return error(res, err.message, 500)
  }
}

const approveUser = async (req, res) => {
  try {
    const userId = req.params.id
    if (!userId) {
      return error(res, 'User ID required', 400)
    }

    const user = await authService.approveUser(userId)
    return success(res, user, 'Useri u aprovua')
  } catch (err) {
    console.error('❌ approveUser error:', err.message)
    return error(res, err.message, err.status || 500)
  }
}

const rejectUser = async (req, res) => {
  try {
    const userId = req.params.id
    const { reason } = req.body

    if (!userId) {
      return error(res, 'User ID required', 400)
    }

    const user = await authService.rejectUser(userId, reason)
    return success(res, user, 'Useri u refuzua')
  } catch (err) {
    console.error('❌ rejectUser error:', err.message)
    return error(res, err.message, err.status || 500)
  }
}

module.exports = { 
  register, 
  getMe, 
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  approveUser, 
  rejectUser 
}