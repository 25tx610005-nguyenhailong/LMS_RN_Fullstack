import Joi from 'joi'
import { GET_DB } from '~/config/prisma'

const MATERIAL_LESSON_COLLECTION_SCHEMA = Joi.object({
  IdMaterial: Joi.number().integer().allow(null),
  IdLesson: Joi.number().integer().allow(null),
  Name: Joi.string().required().max(100),
  IdLevel: Joi.number().integer().allow(null),
  IdTheme: Joi.number().integer().allow(null),
  FolderName: Joi.string().allow(null, '').max(50),
  Priority: Joi.number().integer().allow(null),
  Deleted: Joi.number().integer().default(0),
  Created_By: Joi.string().allow(null, '').max(50),
  Created_Date: Joi.date().default(Date.now),
  Modified_By: Joi.string().allow(null, '').max(50),
  Modified_Date: Joi.date().allow(null)
})

const createNew = async (data) => {
  try {
    const validData = await MATERIAL_LESSON_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
    return await GET_DB().materialLesson.create({
      data: validData
    })
  } catch (error) { throw new Error(error) }
}

const findByTheme = async (themeId) => {
  try {
    return await GET_DB().materialLesson.findMany({
      where: { IdTheme: themeId, Deleted: 0 },
      orderBy: { Priority: 'asc' }
    })
  } catch (error) { throw new Error(error) }
}

export const materialLessonModel = {
  createNew,
  findByTheme
}
