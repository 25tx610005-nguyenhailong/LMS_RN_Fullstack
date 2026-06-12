import express from 'express'
import { courseController } from '~/controllers/courseController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { courseValidation } from '~/validations/courseValidation'

const Router = express.Router()

// Route lấy danh sách khóa học
Router.route('/')
  .get(authMiddleware.isAuthorized, courseController.getListCourses)
  .post(authMiddleware.isAuthorized, courseController.createCourse)

Router.route('/metadata/levels')
  .get(authMiddleware.isAuthorized, courseController.getLevels)

Router.route('/metadata/materials')
  .get(authMiddleware.isAuthorized, courseController.getMaterials)

Router.route('/public/:id')
  .get(courseController.getPublicCourseDetails)

Router.route('/public/enroll')
  .post(courseValidation.enrollStudent, courseController.enrollStudent)


// Route lấy chi tiết, cập nhật và xóa khóa học
Router.route('/:id')
  .get(authMiddleware.isAuthorized, courseController.getFullCourseDetails)
  .put(authMiddleware.isAuthorized, courseController.updateCourse)
  .delete(authMiddleware.isAuthorized, courseController.deleteCourse)

Router.route('/:id/students')
  .get(authMiddleware.isAuthorized, courseController.getCourseStudents)
  .post(authMiddleware.isAuthorized, courseController.addStudentToCourse)

Router.route('/:id/available-students')
  .get(authMiddleware.isAuthorized, courseController.getAvailableStudents)

Router.route('/:id/students/:courseStudentId/status')
  .post(authMiddleware.isAuthorized, courseController.updateCourseStudentStatus)

Router.route('/:id/attendance')
  .get(authMiddleware.isAuthorized, courseController.getCourseAttendance)
  .post(authMiddleware.isAuthorized, courseController.updateCourseAttendance)

Router.route('/:id/schedules')
  .get(authMiddleware.isAuthorized, courseController.getCourseSchedules)
  .post(authMiddleware.isAuthorized, courseController.createCourseScheduleDetail)

export const courseRoute = Router
