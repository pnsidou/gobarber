import { Router } from 'express'

import UserController from './app/controllers/UserController'
import SessionController from './app/controllers/SessionController'
import FileController from './app/controllers/FileController'
import ProviderController from './app/controllers/ProviderController'
import AppointmentController from './app/controllers/AppointmentController'

import authMiddleware from './app/middlewares/auth'
import multer from 'multer'
import multerConfig from './config/multer'

const routes = new Router()
const upload = multer(multerConfig)

routes.post('/users', UserController.store)
routes.post('/sessions', SessionController.store)

/*
  authMiddleware is used only for routes defined
  after this point
 */
routes.use(authMiddleware)
routes.put('/users', UserController.update)

routes.get('/providers', ProviderController.index)

routes.get('/appointments', AppointmentController.index)
routes.post('/appointments', AppointmentController.store)

routes.post('/files', upload.single('file'), FileController.store)

export default routes
