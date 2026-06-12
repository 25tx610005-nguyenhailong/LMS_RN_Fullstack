import express from 'express'
import { schoolController } from '~/controllers/schoolController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, schoolController.getSchools)
  .post(authMiddleware.isAuthorized, schoolController.createSchool)

Router.route('/:schoolId')
  .put(authMiddleware.isAuthorized, schoolController.updateSchool)
  .delete(authMiddleware.isAuthorized, schoolController.deleteSchool)

Router.route('/:schoolId/settings')
  .get(authMiddleware.isAuthorized, schoolController.getSchoolSettings)
  .put(authMiddleware.isAuthorized, schoolController.updateSchoolSettings)

Router.route('/cities')
  .get(authMiddleware.isAuthorized, schoolController.getCities)

Router.route('/districts')
  .get(authMiddleware.isAuthorized, schoolController.getDistricts)

Router.route('/:schoolId/teachers')
  .post(authMiddleware.isAuthorized, schoolController.addTeachersToSchool)

Router.route('/:schoolId/teachers/availability')
  .get(authMiddleware.isAuthorized, schoolController.getAvailableTeachers)

Router.route('/:schoolId/dashboard')
  .get(authMiddleware.isAuthorized, schoolController.getSchoolDashboardData)

Router.route('/:schoolId/students')
  .get(authMiddleware.isAuthorized, schoolController.getSchoolStudents)
  .post(authMiddleware.isAuthorized, schoolController.createSchoolStudent)

Router.route('/:schoolId/students/:accountId')
  .put(authMiddleware.isAuthorized, schoolController.updateSchoolStudent)
  .delete(authMiddleware.isAuthorized, schoolController.deleteSchoolStudent)

Router.route('/:schoolId/students/:enrollmentId/approve')
  .put(authMiddleware.isAuthorized, schoolController.approveStudentEnrollment)

Router.route('/:schoolId/students/:enrollmentId/reject')
  .put(authMiddleware.isAuthorized, schoolController.rejectStudentEnrollment)

export const schoolRoute = Router
