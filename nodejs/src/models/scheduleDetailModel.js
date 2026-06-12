import Joi from 'joi'
import { GET_DB } from '~/config/prisma'

const SCHEDULE_DETAIL_COLLECTION_SCHEMA = Joi.object({
  IdCourseSchedule: Joi.number().integer().required(),
  IdCourse: Joi.string().required().max(20),
  IdAccountTeacher: Joi.string().allow(null),
  Date: Joi.date().required(),
  FromTime: Joi.date().required(),
  ToTime: Joi.date().required(),
  Status: Joi.number().integer().default(1), // 1: Active, 0: Cancelled
  Deleted: Joi.number().integer().default(0),
  Created_By: Joi.string().allow(null, '').max(50),
  Created_Date: Joi.date().default(Date.now),
  Modified_By: Joi.string().allow(null, '').max(50),
  Modified_Date: Joi.date().allow(null)
})

const createNew = async (data) => {
  try {
    const validData = await SCHEDULE_DETAIL_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
    return await GET_DB().courseScheduleDetail.create({
      data: validData
    })
  } catch (error) { throw new Error(error) }
}

const findByCourse = async (courseId) => {
  try {
    return await GET_DB().courseScheduleDetail.findMany({
      where: { IdCourse: courseId, Deleted: 0 },
      orderBy: { Date: 'asc' }
    })
  } catch (error) { throw new Error(error) }
}

export const scheduleDetailModel = {
  createNew,
  findByCourse
}
