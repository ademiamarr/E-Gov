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
    console.log(`🔍 [attachRole] Kërkojmë user: ${clerkUserId}`)

    // HAPI 1: Merr user nga Supabase
    let { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkUserId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Gabim në query:', error.message)
      return res.status(401).json({ success: false, message: 'Gabim në autentifikim' })
    }

    // HAPI 2: Nëse nuk u gjet fare në Supabase
    // Kjo ndodh vetëm nëse useri ekziston në Clerk por NUK ka bërë register ende
    // NUK krijojmë user me TEMP data - kthejmë 401 që AuthContext të ridrejtojë në /register
    if (!dbUser) {
      console.warn(`⚠️ User ${clerkUserId} nuk ndodhet në Supabase DB`)

      // Kontrollojmë nëse ky është një /auth/register request - lejojmë të kalojë
      // (auth/register routes nuk përdorin attachRole direkt)

      // Për /auth/me - kthejmë 404 që frontend ta trajtojë
      return res.status(404).json({
        success: false,
        message: 'Useri nuk u gjet. Ju lutemi regjistrohuni.',
        code: 'USER_NOT_REGISTERED'
      })
    }

    // HAPI 3: Vendos user në request object
    req.user = dbUser
    req.userId = dbUser.id
    req.userRole = dbUser.role

    console.log(`✅ [attachRole] User authenticated: ${dbUser.email} | role: ${dbUser.role} | EMBG: ${dbUser.personal_id}`)
    next()
  } catch (err) {
    console.error('❌ attachRole error:', err.message)
    return res.status(401).json({ success: false, message: 'Gabim në autentifikimin' })
  }
}

const protect = [requireAuth, attachRole]

module.exports = { requireAuth, attachRole, protect }