import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { accountRoute } from './accountRoute'
import { courseRoute } from './courseRoute'
import { assignmentRoute } from './assignmentRoute'
import { scheduleRoute } from './scheduleRoute'
import { adminRoute } from './adminRoute'
import { schoolRoute } from './schoolRoute'
import { materialRoute } from './materialRoute'
import { uploadRoute } from './uploadRoute'
import { evaluationRoute } from './evaluationRoute'
import { salaryRoute } from './salaryRoute'

const Router = express.Router()

/** Check V1 Status */
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use.' })
})

/** Account APIs */
Router.use('/accounts', accountRoute)

/** Course APIs */
Router.use('/courses', courseRoute)

/** Assignment APIs */
Router.use('/assignments', assignmentRoute)

/** Schedule APIs */
Router.use('/schedules', scheduleRoute)

/** Admin APIs */
Router.use('/admin', adminRoute)

/** School APIs */
Router.use('/schools', schoolRoute)

/** Material APIs */
Router.use('/materials', materialRoute)

/** Upload APIs */
Router.use('/uploads', uploadRoute)

/** Evaluation APIs */
Router.use('/evaluations', evaluationRoute)

/** Salary APIs */
Router.use('/salaries', salaryRoute)

export const APIs_V1 = Router