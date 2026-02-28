const Clerk = require('@clerk/clerk-sdk-node')

const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN_USERS: 'admin_users',
  ADMIN_FINES: 'admin_fines',
  ADMIN_APPOINTMENTS: 'admin_appointments',
  USER: 'user',
  PENDING: 'pending',
  REJECTED: 'rejected',
}

const ADMIN_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN_USERS,
  ROLES.ADMIN_FINES,
  ROLES.ADMIN_APPOINTMENTS,
]

const getUserRole = (user) => {
  if (!user) return null
  return user.publicMetadata?.role || ROLES.PENDING
}

const isAdmin = (user) => ADMIN_ROLES.includes(getUserRole(user))
const isSuperAdmin = (user) => getUserRole(user) === ROLES.SUPER_ADMIN
const isApproved = (user) => {
  const role = getUserRole(user)
  return role === ROLES.USER || ADMIN_ROLES.includes(role)
}

const setUserRole = async (clerkUserId, role) => {
  await Clerk.users.updateUser(clerkUserId, {
    publicMetadata: { role },
  })
}

module.exports = { Clerk, ROLES, ADMIN_ROLES, getUserRole, isAdmin, isSuperAdmin, isApproved, setUserRole }