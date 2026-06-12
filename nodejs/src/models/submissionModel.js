import Joi from 'joi'
import { GET_DB } from '~/config/prisma'

const SUBMISSION_COLLECTION_SCHEMA = Joi.object({
  IdCourse: Joi.string().required().max(20),
  IdCourseAssignmentStudent: Joi.number().integer().required(),
  IdAccountStudent: Joi.string().required(), // UUID
  FileUrl: Joi.string().required().max(500),
  FileName: Joi.string().allow(null, '').max(250),
  IsLate: Joi.boolean().default(false),
  Deleted: Joi.number().integer().default(0),
  Created_By: Joi.string().allow(null, '').max(50),
  Created_Date: Joi.date().default(Date.now),
  Modified_By: Joi.string().allow(null, '').max(50),
  Modified_Date: Joi.date().allow(null)
})

const createNew = async (data) => {
  try {
    const validData = await SUBMISSION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
    return await GET_DB().courseAssignmentSubmission.create({
      data: validData
    })
  } catch (error) { throw new Error(error) }
}

const findByAssignmentAndStudent = async (assignmentStudentId, studentId) => {
  try {
    return await GET_DB().courseAssignmentSubmission.findFirst({
      where: {
        IdCourseAssignmentStudent: assignmentStudentId,
        IdAccountStudent: studentId,
        Deleted: 0
      }
    })
  } catch (error) { throw new Error(error) }
}

export const submissionModel = {
  createNew,
  findByAssignmentAndStudent
}
