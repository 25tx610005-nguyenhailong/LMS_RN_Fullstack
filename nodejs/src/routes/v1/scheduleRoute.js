import express from 'express'
import { scheduleController } from '~/controllers/scheduleController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

// Lấy lịch học của 1 khóa học
Router.route('/course/:courseId')
  .get(authMiddleware.isAuthorized, scheduleController.getCourseSchedule)

// Lấy danh sách lịch học chi tiết dạng bảng (hỗ trợ phân trang, lọc)
Router.route('/details')
  .get(authMiddleware.isAuthorized, scheduleController.getScheduleDetailsList)

// Xác nhận hàng loạt lịch học
Router.route('/details/batch-confirm')
  .post(authMiddleware.isAuthorized, scheduleController.batchConfirmSchedules)

// Cập nhật lịch học chi tiết
Router.route('/detail/:detailId')
  .put(authMiddleware.isAuthorized, scheduleController.updateCourseScheduleDetail)

// Tham gia buổi học trực tuyến (Tự động điểm danh & lưu thông tin lương)
Router.route('/detail/:detailId/join')
  .post(authMiddleware.isAuthorized, scheduleController.joinOnlineClass)

export const scheduleRoute = Router
