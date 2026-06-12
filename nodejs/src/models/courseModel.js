import Joi from 'joi'
import { GET_DB } from '~/config/prisma'

const COURSE_COLLECTION_SCHEMA = Joi.object({
  Id: Joi.string().required().max(20),
  Name: Joi.string().allow(null, '').max(200),
  IdSchool: Joi.number().integer().required(),
  IdLevel: Joi.number().integer().required(),
  LinkEnrol: Joi.string().allow(null, '').max(500),
  IsOnline: Joi.boolean().default(false),
  LinkOnline: Joi.string().allow(null, '').max(500),
  Thumbnail: Joi.string().allow(null, '').max(500),
  Deleted: Joi.number().integer().default(0),
  Created_By: Joi.string().allow(null, '').max(50),
  Created_Date: Joi.date().default(Date.now),
  Modified_By: Joi.string().allow(null, '').max(50),
  Modified_Date: Joi.date().allow(null)
})

const createNew = async (data) => {
  try {
    const validData = await COURSE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
    return await GET_DB().course.create({
      data: validData
    })
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    return await GET_DB().course.findUnique({
      where: { Id: id }
    })
  } catch (error) { throw new Error(error) }
}

const update = async (id, data) => {
  try {
    return await GET_DB().course.update({
      where: { Id: id },
      data: { ...data, Modified_Date: new Date() }
    })
  } catch (error) { throw new Error(error) }
}

const deleteCourse = async (id) => {
  try {
    return await GET_DB().course.update({
      where: { Id: id },
      data: { Deleted: 1, Modified_Date: new Date() }
    })
  } catch (error) { throw new Error(error) }
}

export const courseModel = {
  createNew,
  findOneById,
  update,
  deleteCourse
}
