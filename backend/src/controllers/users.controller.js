const usersService = require('../services/users.service')
const authService = require('../services/auth.service')
const { success, error } = require('../utils/apiResponse')

const getMe = async (req, res) => {
  try {
    return success(res, req.user)
  } catch (err) {
    return error(res, err.message, 500)
  }
}

const getPendingUsers = async (req, res) => {
  try {
    const users = await usersService.getPendingUsers()
    return success(res, users)
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

const getAllUsers = async (req, res) => {
  try {
    const users = await usersService.getAllUsers()
    return success(res, users)
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

const approveUser = async (req, res) => {
  try {
    const user = await authService.approveUser(req.params.id)
    return success(res, user, 'Useri u aprovua')
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

const rejectUser = async (req, res) => {
  try {
    const { reason } = req.body
    const user = await authService.rejectUser(req.params.id, reason)
    return success(res, user, 'Useri u refuzua')
  } catch (err) {
    return error(res, err.message, err.status || 500)
  }
}

module.exports = { getMe, getPendingUsers, getAllUsers, approveUser, rejectUser }