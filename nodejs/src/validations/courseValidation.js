import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'

const enrollStudent = async (req, res, next) => {
  const correctCondition = Joi.object({
    parentName: Joi.string().required().min(3).max(100).trim().strict(),
    phone: Joi.string().required().min(10).max(11).trim().strict(),
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE).trim().strict(),
    userName: Joi.string().required().min(3).max(50).pattern(/^[a-zA-Z0-9_.-]+$/).message('Tên đăng nhập chỉ chứa chữ cái, số, dấu gạch dưới, gạch ngang hoặc dấu chấm').trim().strict(),
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE),
    studentName: Joi.string().required().min(3).max(100).trim().strict(),
    studentBirthDay: Joi.date().required(),
    studentGender: Joi.number().integer().required(),
    courseId: Joi.string().required().trim().strict(),
    idCity: Joi.number().integer().allow(null, '').optional(),
    idDistrict: Joi.number().integer().allow(null, '').optional(),
    address: Joi.string().allow(null, '').max(500).optional().trim().strict()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const courseValidation = {
  enrollStudent
}
