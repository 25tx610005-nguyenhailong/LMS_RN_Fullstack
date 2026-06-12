import Joi from 'joi'
import { GET_DB } from '~/config/prisma'

const ASSIGNMENT_COLLECTION_SCHEMA = Joi.object({
  IdCourse: Joi.string().required().max(20),
  AssignmentTitle: Joi.string().required().max(500),
  AssignmentFile: Joi.string().allow(null, '').max(500),
  AssignmentDescription: Joi.string().allow(null, ''),
  StartDate: Joi.date().allow(null),
  CloseDate: Joi.date().allow(null),
  IdTheme: Joi.number().integer().allow(null),
  IdLesson: Joi.number().integer().allow(null),
  ExampleType: Joi.number().integer().allow(null),
  Deleted: Joi.number().integer().default(0),
  Created_By: Joi.string().allow(null, '').max(50),
  Created_Date: Joi.date().default(Date.now),
  Modified_By: Joi.string().allow(null, '').max(50),
  Modified_Date: Joi.date().allow(null)
})

const createNew = async (data) => {
  try {
    const validData = await ASSIGNMENT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
    return await GET_DB().courseAssignment.create({
      data: validData
    })
  } catch (error) { throw new Error(error) }
}

const findByCourse = async (courseId) => {
  try {
    return await GET_DB().courseAssignment.findMany({
      where: { IdCourse: courseId, Deleted: 0 },
      orderBy: { Created_Date: 'desc' }
    })
  } catch (error) { throw new Error(error) }
}

export const assignmentModel = {
  createNew,
  findByCourse
}
