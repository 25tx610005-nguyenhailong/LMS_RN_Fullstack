import express from 'express'
import { salaryController } from '~/controllers/salaryController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/schools/:schoolId')
  .get(authMiddleware.isAuthorized, salaryController.getSchoolSalaries)

export const salaryRoute = Router
