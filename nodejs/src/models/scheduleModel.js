import Joi from 'joi'
import { GET_DB } from '~/config/prisma'

const SCHEDULE_COLLECTION_SCHEMA = Joi.object({
  IdCourse: Joi.string().required().max(20),
  IdAccountTeacher: Joi.string().allow(null), // UUID
  FromDate: Joi.date().required(),
  ToDate: Joi.date().required(),
  Schedule: Joi.string().required().max(7), // Ví dụ: "246" cho Thứ 2, 4, 6
  FromTime: Joi.date().required(), // Dùng kiểu DateTime nhưng chỉ lấy phần Time
  ToTime: Joi.date().required(),
  Deleted: Joi.number().integer().default(0),
  Created_By: Joi.string().allow(null, '').max(50),
  Created_Date: Joi.date().default(() => new Date()),
  Modified_By: Joi.string().allow(null, '').max(50),
  Modified_Date: Joi.date().allow(null)
})

const SCHEDULE_DETAIL_SCHEMA = Joi.object({
  IdCourseSchedule: Joi.number().integer().allow(null),
  IdCourse: Joi.string().required().max(20),
  IdAccountTeacher: Joi.string().required(),
  IdMaterialLesson: Joi.number().integer().allow(null),
  IdMaterial: Joi.number().integer().allow(null),
  IdTheme: Joi.number().integer().allow(null),
  IdLesson: Joi.number().integer().allow(null),
  Date: Joi.date().required(),
  FromTime: Joi.date().required(),
  ToTime: Joi.date().required(),
  FromPeriodIndexes: Joi.number().integer().allow(null),
  ToPeriodIndexes: Joi.number().integer().allow(null),
  IsOnline: Joi.boolean().allow(null),
  LinkOnline: Joi.string().allow(null, '').max(500),
  Status: Joi.number().integer().default(0),
  Note: Joi.string().allow(null, '').max(500),
  Deleted: Joi.number().integer().default(0),
  Created_By: Joi.string().allow(null, '').max(50),
  Created_Date: Joi.date().default(() => new Date())
})

const createNew = async (data) => {
  try {
    const validData = await SCHEDULE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
    return await GET_DB().courseSchedule.create({
      data: validData
    })
  } catch (error) { throw new Error(error) }
}

const createDetail = async (data) => {
  try {
    const validData = await SCHEDULE_DETAIL_SCHEMA.validateAsync(data, { abortEarly: false })
    // eslint-disable-next-line no-unused-vars
    const { IdMaterialLesson, IdMaterial, IdTheme, IdLesson, ...dbData } = validData
    return await GET_DB().courseScheduleDetail.create({
      data: dbData
    })
  } catch (error) { throw new Error(error) }
}

const findByCourse = async (courseId) => {
  try {
    return await GET_DB().courseSchedule.findMany({
      where: { IdCourse: courseId, Deleted: 0 }
    })
  } catch (error) { throw new Error(error) }
}

export const scheduleModel = {
  createNew,
  createDetail,
  findByCourse
}
