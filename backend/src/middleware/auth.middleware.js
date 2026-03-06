const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node')
const { supabase } = require('../config/supabase')

const requireAuth = ClerkExpressRequireAuth()

const attachRole = async (req, res, next) => {
  try {
    console.log('🔍 [AUTH CHECK] Starting authentication check...')
    console.log('📌 req.auth:', req.auth)
    console.log('📌 req.auth?.userId:', req.auth?.userId)

    if (!req.auth?.userId) {
      console.log('❌ [AUTH] No auth userId found!')
      return res.status(401).json({ 
        success: false, 
        message: 'Nuk jeni të autorizuar' 
      })
    }

    const clerkUserId = req.auth.userId
    console.log('✅ [AUTH] Found userId:', clerkUserId)
    console.log('🔎 [DB] Searching for user in Supabase...')

    // Kërko user në Supabase
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkUserId)
      .single()

    console.log('📊 [DB RESPONSE]', {
      hasData: !!dbUser,
      hasError: !!error,
      errorCode: error?.code,
      errorMessage: error?.message,
      userData: dbUser ? {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        verification_status: dbUser.verification_status
      } : null
    })

    // Nëse ka error në query (përveç "not found")
    if (error && error.code !== 'PGRST116') {
      console.error('❌ [DB ERROR] Database query failed:', error.message)
      return res.status(500).json({ 
        success: false, 
        message: 'Gabim në database',
        error: error.message
      })
    }

    // Nëse user nuk gjendet
    if (!dbUser) {
      console.log('⚠️ [DB] User not found for clerk_id:', clerkUserId)
      console.log('💡 [INFO] User needs to register first')
      
      return res.status(404).json({ 
        success: false, 
        message: 'Useri nuk u gjet. Duhet të regjistroheni fillimisht.',
        code: 'USER_NOT_FOUND'
      })
    }

    // User gjendet - attach to request
    console.log('✅ [AUTH SUCCESS] User authenticated:', {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role
    })

    req.user = dbUser
    req.userId = dbUser.id
    req.userRole = dbUser.role
    req.verification_status = dbUser.verification_status

    console.log('✅ [MIDDLEWARE] User attached to request, proceeding to next middleware...')
    next()
  } catch (err) {
    console.error('❌ [EXCEPTION] Unexpected error in attachRole:', {
      message: err.message,
      stack: err.stack
    })
    return res.status(500).json({ 
      success: false, 
      message: 'Gabim në autentifikim',
      error: err.message 
    })
  }
}

const protect = [requireAuth, attachRole]

console.log('✅ [INIT] Auth middleware loaded')

module.exports = { requireAuth, attachRole, protect }