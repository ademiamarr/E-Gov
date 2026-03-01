const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node')
const { supabase } = require('../config/supabase')

const requireAuth = ClerkExpressRequireAuth()

const attachRole = async (req, res, next) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({ success: false, message: 'Nuk jeni të autorizuar' })
    }

    // ✅ MERR USER NGA SUPABASE - NOT CLERK
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', req.auth.userId)
      .single()

    if (error || !dbUser) {
      return res.status(401).json({ success: false, message: 'Useri nuk u gjet në database' })
    }

    // Vendos user në request object
    req.user = dbUser
    req.userId = dbUser.id
    req.userRole = dbUser.role

    next()
  } catch (err) {
    console.error('attachRole error:', err.message)
    return res.status(401).json({ success: false, message: 'Gabim në autentifikimin' })
  }
}

// ✅ EXPORT PROTECT AS ARRAY
const protect = [requireAuth, attachRole]

module.exports = { requireAuth, attachRole, protect }