import { StatusCodes } from 'http-status-codes'
import { salaryService } from '~/services/salaryService'
import ApiError from '~/utils/ApiError'

const getSchoolSalaries = async (req, res, next) => {
  try {
    const role = req.jwtDecoded?.role?.toUpperCase()
    if (role !== 'ADMIN' && role !== 'TEACHER') {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập thông tin lương!')
    }

    const { schoolId } = req.params
    const { month } = req.query // Format: YYYY-MM
    const userId = req.jwtDecoded?.id || null

    const result = await salaryService.getSchoolSalaries(schoolId, userId, role, month)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const salaryController = {
  getSchoolSalaries
}
