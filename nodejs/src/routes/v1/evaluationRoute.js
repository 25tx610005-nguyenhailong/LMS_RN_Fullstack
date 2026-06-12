import express from 'express'
import { evaluationController } from '~/controllers/evaluationController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/courses/:courseId')
  .get(authMiddleware.isAuthorized, evaluationController.getCourseEvaluations)
  .post(authMiddleware.isAuthorized, evaluationController.saveEvaluation)

export const evaluationRoute = Router
