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

    // ✅ HAPI 1: Merr user nga Supabase
    let { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkUserId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Gabim në query:', error.message)
      return res.status(401).json({ success: false, message: 'Gabim në autentifikim' })
    }

    // ✅ HAPI 2: Nëse nuk u gjet në Supabase, provo të marrësh nga Clerk
    if (!dbUser) {
      console.warn(`⚠️ User ${clerkUserId} nuk ndodhet në Supabase, po përpiqu të marrë nga Clerk...`)

      try {
        const clerkUser = await Clerk.users.getUser(clerkUserId)
        console.log(`✅ Marrë user nga Clerk:`, clerkUser.emailAddresses[0]?.emailAddress)

        // ✅ HAPI 3: Krijo user në Supabase bazuar në Clerk data
        if (clerkUser) {
          const userRole = clerkUser.publicMetadata?.role || 'pending'
          const newUser = {
            clerk_id: clerkUserId,
            first_name: clerkUser.firstName || 'Unknown',
            last_name: clerkUser.lastName || 'User',
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            personal_id: clerkUser.publicMetadata?.personal_id || `TEMP-${clerkUserId.slice(0, 8)}`,
            role: userRole,
            verification_status: userRole === 'pending' ? 'pending' : 'approved',
            id_photo_url: null
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
          console.log(`✅ User u krijua në Supabase me role: ${userRole}`)
        }
      } catch (clerkErr) {
        console.error('❌ Gabim në komunikimin me Clerk:', clerkErr.message)
        return res.status(401).json({ success: false, message: 'Useri nuk u gjet në sistem' })
      }
    }

    if (!dbUser) {
      return res.status(401).json({ success: false, message: 'Useri nuk u gjet në database' })
    }

    // ✅ HAPI 4: Vendos user në request object
    req.user = dbUser
    req.userId = dbUser.id
    req.userRole = dbUser.role

    console.log(`✅ [attachRole] User authenticated: ${dbUser.email} (${dbUser.role})`)
    next()
  } catch (err) {
    console.error('❌ attachRole error:', err.message)
    return res.status(401).json({ success: false, message: 'Gabim në autentifikimin' })
  }
}

const protect = [requireAuth, attachRole]

module.exports = { requireAuth, attachRole, protect }