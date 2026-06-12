import express from 'express'
import { uploadController } from '~/controllers/uploadController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'

const Router = express.Router()

Router.route('/')
  .post(
    authMiddleware.isAuthorized,
    multerUploadMiddleware.upload.single('file'),
    uploadController.uploadFile
  )
  .delete(
    authMiddleware.isAuthorized,
    uploadController.deleteFile
  )

export const uploadRoute = Router
