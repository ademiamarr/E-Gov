const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node')
const { supabase } = require('../config/supabase')
const Clerk = require('@clerk/clerk-sdk-node')

const requireAuth = ClerkExpressRequireAuth()

const attachRole = async (req, res, next) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({ success: false, message: 'Nuk jeni të autorizuar' })
    }

    const clerkUserId = req.auth.userId

    // Kërko user në Supabase
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkUserId)
      .single()

    // Nëse ka error në query (përveç "not found")
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Supabase Error:', error.message)
      return res.status(500).json({ success: false, message: 'Database error' })
    }

    // Nëse user nuk gjendet
    if (!dbUser) {
      console.log('⚠️ User not found in database. Clerk ID:', clerkUserId)
      
      // Opsional: Mund ta krijon automatikisht
      // Për tani, i thuaj client të regjistrohemi
      return res.status(404).json({ 
        success: false, 
        message: 'User not found. Please register first.',
        code: 'USER_NOT_FOUND'
      })
    }

    // User gjendet - attach to request
    req.user = dbUser
    req.userId = dbUser.id
    req.userRole = dbUser.role
    req.verification_status = dbUser.verification_status

    next()
  } catch (err) {
    console.error('❌ attachRole error:', err.message)
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error',
      error: err.message 
    })
  }
}

const protect = [requireAuth, attachRole]

module.exports = { requireAuth, attachRole, protect }