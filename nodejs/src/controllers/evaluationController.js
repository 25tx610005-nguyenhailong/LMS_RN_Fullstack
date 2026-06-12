import { StatusCodes } from 'http-status-codes'
import { evaluationService } from '~/services/evaluationService'
import ApiError from '~/utils/ApiError'

const getCourseEvaluations = async (req, res, next) => {
  try {
    const { courseId } = req.params
    const studentId = req.jwtDecoded?.id || null
    const role = req.jwtDecoded?.role || null

    const result = await evaluationService.getCourseEvaluations(courseId, studentId, role)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const saveEvaluation = async (req, res, next) => {
  try {
    const role = req.jwtDecoded?.role?.toUpperCase()
    if (role !== 'TEACHER' && role !== 'ADMIN') {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền đánh giá học viên!')
    }

    const { courseId } = req.params
    const { studentId, attendanceScore, academicScore, behaviorScore, comment } = req.body

    if (!studentId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu thông tin học viên (studentId)!')
    }

    const creatorName = req.jwtDecoded?.username || 'admin'
    const result = await evaluationService.saveEvaluation(courseId, studentId, {
      attendanceScore,
      academicScore,
      behaviorScore,
      comment
    }, creatorName)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const evaluationController = {
  getCourseEvaluations,
  saveEvaluation
}
