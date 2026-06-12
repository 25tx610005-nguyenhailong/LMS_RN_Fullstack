import { StatusCodes } from 'http-status-codes'
import { GET_DB } from '~/config/prisma'
import { accountModel } from '~/models/accountModel'
import { accountService } from '~/services/accountService'

const getAllUsers = async (req, res, next) => {
  try {
    const result = await accountService.getAllUsers(req.query)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const createUser = async (req, res, next) => {
  try {
    const user = await accountService.createUser(req.body)
    res.status(StatusCodes.CREATED).json(user)
  } catch (error) { next(error) }
}

const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id
    const user = await accountService.getUserById(userId)
    res.status(StatusCodes.OK).json(user)
  } catch (error) { next(error) }
}

const createTeacher = async (req, res, next) => {
  try {
    const { schoolId, ...extraData } = req.body
    const teacher = await accountService.createTeacher(req.body, schoolId, extraData)
    res.status(StatusCodes.CREATED).json(teacher)
  } catch (error) { next(error) }
}

const updateTeacher = async (req, res, next) => {
  try {
    const teacherId = req.params.id
    const updated = await accountService.updateTeacher(teacherId, req.body)
    res.status(StatusCodes.OK).json(updated)
  } catch (error) { next(error) }
}

const deleteTeacher = async (req, res, next) => {
  try {
    const teacherId = req.params.id
    await accountService.deleteTeacher(teacherId)
    res.status(StatusCodes.OK).json({ message: 'Teacher deleted successfully' })
  } catch (error) { next(error) }
}

const getTeachers = async (req, res, next) => {
  try {
    const result = await accountService.getTeachers(req.query)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const getUserStats = async (req, res, next) => {
  try {
    const stats = await accountService.getUserStats()
    res.status(StatusCodes.OK).json(stats)
  } catch (error) { next(error) }
}

const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id
    const user = await accountService.updateUser(userId, req.body)
    res.status(StatusCodes.OK).json(user)
  } catch (error) { next(error) }
}

const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id
    await accountService.deleteUser(userId)
    res.status(StatusCodes.OK).json({ message: 'User deleted successfully' })
  } catch (error) { next(error) }
}

const getReferenceData = async (req, res, next) => {
  try {
    const [genders, paymentMethods, monetaryUnits] = await Promise.all([
      GET_DB().gender.findMany({
        where: { OR: [{ Deleted: 0 }, { Deleted: null }] }
      }),
      GET_DB().paymentMethod.findMany({
        where: { OR: [{ Deleted: 0 }, { Deleted: null }] }
      }),
      GET_DB().monetaryUnit.findMany({
        where: { OR: [{ Deleted: 0 }, { Deleted: null }] }
      })
    ])
    res.status(StatusCodes.OK).json({ genders, paymentMethods, monetaryUnits })
  } catch (error) { next(error) }
}

export const adminController = {
  getAllUsers,
  createUser,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeachers,
  getUserStats,
  updateUser,
  deleteUser,
  getReferenceData,
  getUserById
}
