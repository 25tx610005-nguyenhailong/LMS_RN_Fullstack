import Joi from 'joi'
import { GET_DB } from '~/config/prisma'

const ATTENDANCE_STUDENT_COLLECTION_SCHEMA = Joi.object({
  IdAccount: Joi.string().required(), // UUID Student/Account
  IdCourse: Joi.string().required().max(20),
  StartDate: Joi.date().required(), // Ngày/giờ buổi học
  Status: Joi.number().integer().required(), // 1: Present, 2: Absent, 3: Late
  Deleted: Joi.number().integer().default(0),
  Created_By: Joi.string().allow(null, '').max(50),
  Created_Date: Joi.date().default(Date.now),
  Modified_By: Joi.string().allow(null, '').max(50),
  Modified_Date: Joi.date().allow(null)
})

const recordAttendance = async (data) => {
  try {
    const validData = await ATTENDANCE_STUDENT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })

    // Upsert logic: Nếu đã điểm danh thì cập nhật trạng thái
    const existing = await GET_DB().courseAttendanceStudent.findFirst({
      where: {
        IdAccount: validData.IdAccount,
        IdCourse: validData.IdCourse,
        StartDate: validData.StartDate
      }
    })

    if (existing) {
      return await GET_DB().courseAttendanceStudent.update({
        where: { Id: existing.Id },
        data: validData
      })
    }

    return await GET_DB().courseAttendanceStudent.create({
      data: validData
    })
  } catch (error) { throw new Error(error) }
}

const findByCourseAndStudent = async (courseId, studentId) => {
  try {
    return await GET_DB().courseAttendanceStudent.findMany({
      where: { IdCourse: courseId, IdAccount: studentId, Deleted: 0 },
      orderBy: { StartDate: 'asc' }
    })
  } catch (error) { throw new Error(error) }
}

export const attendanceModel = {
  recordAttendance,
  findByCourseAndStudent
}
