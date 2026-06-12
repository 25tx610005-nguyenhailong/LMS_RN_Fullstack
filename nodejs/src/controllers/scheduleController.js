import { StatusCodes } from 'http-status-codes'
import { scheduleService } from '~/services/scheduleService'

const getCourseSchedule = async (req, res, next) => {
  try {
    const courseId = req.params.courseId
    const studentId = req.jwtDecoded.id
    const schedule = await scheduleService.getCourseScheduleWithAttendance(courseId, studentId)
    res.status(StatusCodes.OK).json(schedule)
  } catch (error) { next(error) }
}

const updateCourseScheduleDetail = async (req, res, next) => {
  try {
    const detailId = parseInt(req.params.detailId)
    const modifier = req.jwtDecoded?.username || 'admin'
    const role = req.jwtDecoded?.role?.toUpperCase() || ''
    const result = await scheduleService.updateCourseScheduleDetail(detailId, { ...req.body, Modified_By: modifier }, role)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const joinOnlineClass = async (req, res, next) => {
  try {
    const detailId = parseInt(req.params.detailId)
    const userId = req.jwtDecoded?.id
    const role = req.jwtDecoded?.role?.toUpperCase() || ''
    const username = req.jwtDecoded?.username || 'admin'
    const result = await scheduleService.joinOnlineClass(detailId, userId, role, username)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const getScheduleDetailsList = async (req, res, next) => {
  try {
    const { page, limit, courseId, schoolId, status, fromDate, toDate } = req.query
    const role = req.jwtDecoded?.role?.toUpperCase() || ''
    const userId = req.jwtDecoded?.id
    const teacherId = role === 'TEACHER' ? userId : undefined
    const result = await scheduleService.getScheduleDetailsList({ page, limit, courseId, schoolId, status, fromDate, toDate, teacherId })
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const batchConfirmSchedules = async (req, res, next) => {
  try {
    const { ids } = req.body
    const role = req.jwtDecoded?.role?.toUpperCase() || ''
    const result = await scheduleService.batchConfirmSchedules(ids, role)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const scheduleController = {
  getCourseSchedule,
  updateCourseScheduleDetail,
  joinOnlineClass,
  getScheduleDetailsList,
  batchConfirmSchedules
}
