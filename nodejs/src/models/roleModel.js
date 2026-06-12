import Joi from 'joi'
import { GET_DB } from '~/config/prisma'

const ROLE_COLLECTION_SCHEMA = Joi.object({
  Name: Joi.string().allow(null, '').max(100),
  Deleted: Joi.number().integer().default(0),
  Created_By: Joi.string().allow(null, '').max(50),
  Created_Date: Joi.date().default(Date.now),
  Modified_By: Joi.string().allow(null, '').max(50),
  Modified_Date: Joi.date().allow(null)
})

const createNew = async (data) => {
  try {
    const validData = await ROLE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
    return await GET_DB().accountRole.create({
      data: validData
    })
  } catch (error) { throw new Error(error) }
}

const getAll = async () => {
  try {
    return await GET_DB().accountRole.findMany({
      where: { Deleted: 0 }
    })
  } catch (error) { throw new Error(error) }
}

export const roleModel = {
  createNew,
  getAll
}
