import express from 'express'
import { materialController } from '~/controllers/materialController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'

const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, materialController.getMaterials)
  .post(authMiddleware.isAuthorized, materialController.createMaterial)

Router.route('/:id')
  .put(authMiddleware.isAuthorized, materialController.updateMaterial)
  .delete(authMiddleware.isAuthorized, materialController.deleteMaterial)

Router.route('/themes')
  .post(authMiddleware.isAuthorized, materialController.createTheme)

Router.route('/themes/bulk')
  .post(authMiddleware.isAuthorized, materialController.createManyThemes)

Router.route('/themes/:id')
  .put(authMiddleware.isAuthorized, materialController.updateTheme)
  .delete(authMiddleware.isAuthorized, materialController.deleteTheme)

Router.route('/lessons')
  .post(authMiddleware.isAuthorized, materialController.createLesson)

Router.route('/lessons/bulk')
  .post(authMiddleware.isAuthorized, materialController.createManyLessons)


Router.route('/lessons/:id')
  .put(authMiddleware.isAuthorized, materialController.updateLesson)
  .delete(authMiddleware.isAuthorized, materialController.deleteLesson)

Router.route('/lessons/:lessonId/resources')
  .post(
    authMiddleware.isAuthorized,
    multerUploadMiddleware.resourceUpload.array('files'),
    materialController.uploadLessonResource
  )
  .get(authMiddleware.isAuthorized, materialController.listLessonResources)

Router.route('/lessons/:lessonId/resources/:id')
  .put(authMiddleware.isAuthorized, materialController.updateLessonResource)
  .delete(authMiddleware.isAuthorized, materialController.deleteLessonResource)

export const materialRoute = Router
