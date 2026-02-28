const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node')
const { getUserRole } = require('../config/clerk')

const requireAuth = ClerkExpressRequireAuth()

const attachRole = async (req, res, next) => {
  try {
    if (!req.auth?.userId) return res.status(401).json({ success: false, message: 'Nuk jeni të autorizuar' })
    const { Clerk } = require('../config/clerk')
    const clerkUser = await Clerk.users.getUser(req.auth.userId)
    req.clerkUser = clerkUser
    req.userRole = getUserRole(clerkUser)
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token i pavlefshëm' })
  }
}

module.exports = { requireAuth, attachRole }