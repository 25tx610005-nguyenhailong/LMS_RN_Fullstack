import express from 'express'
import { accountValidation } from '~/validations/accountValidation'
import { accountController } from '~/controllers/accountController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'

const Router = express.Router()

Router.route('/register')
  .post((req, res) => {
    return res.status(403).json({
      message: 'Tính năng đăng ký tài khoản mới đã bị vô hiệu hóa.'
    })
  })
Router.route('/verify')
  .put(accountValidation.verifyAccount, accountController.verifyAccount)
Router.route('/login')
  .post(accountValidation.login, accountController.login)
Router.route('/logout')
  .delete(accountController.logout)
Router.route('/refresh_token')
  .get(accountController.refreshToken)
Router.route('/update')
  .put(
    authMiddleware.isAuthorized,
    multerUploadMiddleware.upload.single('avatar'),
    accountValidation.update,
    accountController.update
  )

export const accountRoute = Router