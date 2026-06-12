import Joi from 'joi'
import { GET_DB } from '~/config/prisma'

const MATERIAL_THEME_COLLECTION_SCHEMA = Joi.object({
  IdMaterial: Joi.number().integer().allow(null),
  IdTheme: Joi.number().integer().allow(null),
  Name: Joi.string().required().max(100),
  Title: Joi.string().allow(null, '').max(100),
  IdLevel: Joi.number().integer().allow(null),
  Version: Joi.number().integer().allow(null),
  Priority: Joi.number().integer().allow(null),
  FolderName: Joi.string().allow(null, '').max(255),
  Deleted: Joi.number().integer().default(0),
  Created_By: Joi.string().allow(null, '').max(50),
  Created_Date: Joi.date().default(Date.now),
  Modified_By: Joi.string().allow(null, '').max(50),
  Modified_Date: Joi.date().allow(null)
})

const createNew = async (data) => {
  try {
    const validData = await MATERIAL_THEME_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
    return await GET_DB().materialTheme.create({
      data: validData
    })
  } catch (error) { throw new Error(error) }
}

const findByMaterial = async (materialId) => {
  try {
    return await GET_DB().materialTheme.findMany({
      where: { IdMaterial: materialId, Deleted: 0 },
      orderBy: { Priority: 'asc' }
    })
  } catch (error) { throw new Error(error) }
}

export const materialThemeModel = {
  createNew,
  findByMaterial
}
