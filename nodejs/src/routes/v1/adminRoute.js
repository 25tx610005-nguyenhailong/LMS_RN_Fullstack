import express from 'express'
import { adminController } from '~/controllers/adminController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

// Lấy thống kê người dùng
Router.route('/stats')
  .get(authMiddleware.isAuthorized, adminController.getUserStats)

Router.route('/reference-data')
  .get(authMiddleware.isAuthorized, adminController.getReferenceData)

// Lấy danh sách toàn bộ người dùng
Router.route('/users')
  .get(authMiddleware.isAuthorized, adminController.getAllUsers)
  .post(authMiddleware.isAuthorized, adminController.createUser)

Router.route('/users/:id')
  .get(authMiddleware.isAuthorized, adminController.getUserById)
  .put(authMiddleware.isAuthorized, adminController.updateUser)
  .delete(authMiddleware.isAuthorized, adminController.deleteUser)

// Quản lý giáo viên
Router.route('/teachers')
  .get(authMiddleware.isAuthorized, adminController.getTeachers)
  .post(authMiddleware.isAuthorized, adminController.createTeacher)

Router.route('/teachers/:id')
  .put(authMiddleware.isAuthorized, adminController.updateTeacher)
  .delete(authMiddleware.isAuthorized, adminController.deleteTeacher)

export const adminRoute = Router
