const { ROLES, ADMIN_ROLES } = require('../config/clerk')

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.userRole) return res.status(401).json({ success: false, message: 'Nuk jeni të autorizuar' })
  if (!allowedRoles.includes(req.userRole)) return res.status(403).json({ success: false, message: 'Nuk keni leje' })
  next()
}

const requireAdmin = requireRole(...ADMIN_ROLES)
const requireSuperAdmin = requireRole(ROLES.SUPER_ADMIN)
const requireApproved = requireRole(ROLES.USER, ...ADMIN_ROLES)

module.exports = { requireRole, requireAdmin, requireSuperAdmin, requireApproved }