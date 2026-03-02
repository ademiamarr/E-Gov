const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node')
const { supabase } = require('../config/supabase')
const Clerk = require('@clerk/clerk-sdk-node')

const requireAuth = ClerkExpressRequireAuth()

const VALID_ROLES = [
  'super_admin', 'admin_users', 'admin_mvr',
  'admin_komuna', 'admin_fines', 'user', 'pending', 'rejected'
]

const attachRole = async (req, res, next) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({ success: false, message: 'Nuk jeni të autorizuar' })
    }

    const clerkUserId = req.auth.userId

    // Hapi 1: Kërko user në Supabase
    let { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkUserId)
      .single()

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ success: false, message: 'Gabim në autentifikim' })
    }

    // Hapi 2: Nëse nuk ka në Supabase, sinkronizo nga Clerk
    if (!dbUser) {
      try {
        const clerkUser = await Clerk.users.getUser(clerkUserId)
        const userRole = clerkUser.publicMetadata?.role || 'pending'

        // Valido rolin para se të insertosh
        const safeRole = VALID_ROLES.includes(userRole) ? userRole : 'pending'

        const newUser = {
          clerk_id:            clerkUserId,
          first_name:          clerkUser.firstName || 'Unknown',
          last_name:           clerkUser.lastName  || 'User',
          email:               clerkUser.emailAddresses[0]?.emailAddress || '',
          personal_id:         clerkUser.publicMetadata?.personal_id || `TEMP-${clerkUserId.slice(0, 8)}`,
          role:                safeRole,
          verification_status: ['pending','rejected'].includes(safeRole) ? safeRole : 'approved',
        }

        const { data: created, error: createError } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single()

        if (createError) {
          console.error('❌ Gabim në krijim të user-it:', createError.message)
          return res.status(500).json({ success: false, message: 'Gabim në autentifikim' })
        }

        dbUser = created
      } catch (clerkErr) {
        console.error('❌ Gabim Clerk:', clerkErr.message)
        return res.status(401).json({ success: false, message: 'Useri nuk u gjet' })
      }
    }

    if (!dbUser) {
      return res.status(401).json({ success: false, message: 'Useri nuk u gjet' })
    }

    req.user     = dbUser
    req.userId   = dbUser.id
    req.userRole = dbUser.role
    next()
  } catch (err) {
    console.error('❌ attachRole error:', err.message)
    return res.status(401).json({ success: false, message: 'Gabim në autentifikim' })
  }
}

const protect = [requireAuth, attachRole]

module.exports = { requireAuth, attachRole, protect }