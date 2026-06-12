import Joi from 'joi'
import { GET_DB } from '~/config/prisma'

const MATERIAL_COLLECTION_SCHEMA = Joi.object({
  Name: Joi.string().required().max(100),
  IdLevel: Joi.number().integer().allow(null),
  IdTheme: Joi.number().integer().allow(null),
  IdLesson: Joi.number().integer().allow(null),
  Types: Joi.number().integer().allow(null),
  ImageUrl: Joi.string().allow(null, '').max(255),
  Deleted: Joi.number().integer().default(0),
  Created_By: Joi.string().allow(null, '').max(50),
  Created_Date: Joi.date().default(Date.now),
  Modified_By: Joi.string().allow(null, '').max(50),
  Modified_Date: Joi.date().allow(null)
})

const createNew = async (data) => {
  try {
    const validData = await MATERIAL_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
    return await GET_DB().material.create({
      data: validData
    })
  } catch (error) { throw new Error(error) }
}

const findByLevel = async (levelId) => {
  try {
    return await GET_DB().material.findMany({
      where: { IdLevel: levelId, Deleted: 0 }
    })
  } catch (error) { throw new Error(error) }
}

export const materialModel = {
  createNew,
  findByLevel
}
