import express from 'express'
import { assignmentController } from '~/controllers/assignmentController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

// Lấy danh sách bài tập của 1 khóa học
Router.route('/course/:courseId')
  .get(authMiddleware.isAuthorized, assignmentController.getCourseAssignments)

// Tạo bài tập mới
Router.route('/')
  .post(authMiddleware.isAuthorized, assignmentController.createAssignment)

// Xóa và cập nhật bài tập
Router.route('/:assignmentId')
  .delete(authMiddleware.isAuthorized, assignmentController.deleteAssignment)
  .put(authMiddleware.isAuthorized, assignmentController.updateAssignment)

// Nộp bài tập
Router.route('/submit')
  .post(authMiddleware.isAuthorized, assignmentController.submitAssignment)

// Chấm điểm bài làm
Router.route('/grade')
  .post(authMiddleware.isAuthorized, assignmentController.gradeSubmission)

export const assignmentRoute = Router
