import Joi from 'joi'
import { GET_DB } from '~/config/prisma'

const EVALUATION_COLLECTION_SCHEMA = Joi.object({
  IdCourseAssignmentStudent: Joi.number().integer().required(),
  IdAccountStudent: Joi.string().required(), // UUID
  Score: Joi.number().allow(null),
  Remake: Joi.string().allow(null, ''), // Nhận xét
  Deleted: Joi.number().integer().default(0),
  Created_By: Joi.string().allow(null, '').max(50),
  Created_Date: Joi.date().default(Date.now),
  Modified_By: Joi.string().allow(null, '').max(50),
  Modified_Date: Joi.date().allow(null)
})

const createNewOrUpdate = async (data) => {
  try {
    const validData = await EVALUATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })

    // Upsert logic: Nếu đã có đánh giá thì cập nhật, chưa có thì tạo mới
    const existing = await GET_DB().courseAssignmentStudentEvaluation.findFirst({
      where: {
        IdCourseAssignmentStudent: validData.IdCourseAssignmentStudent,
        IdAccountStudent: validData.IdAccountStudent
      }
    })

    if (existing) {
      return await GET_DB().courseAssignmentStudentEvaluation.update({
        where: { Id: existing.Id },
        data: validData
      })
    }

    return await GET_DB().courseAssignmentStudentEvaluation.create({
      data: validData
    })
  } catch (error) { throw new Error(error) }
}

export const evaluationModel = {
  createNewOrUpdate
}
