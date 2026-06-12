/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/prisma'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import cookieParser from 'cookie-parser'
import { Server } from 'socket.io'
import http from 'http'
import path from 'path'

const START_SERVER = () => {
  const app = express()

  // Serve static files from 'uploads' directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

  // Fix vụ cache from disk của Express
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  // Cấu hình cookieParser
  app.use(cookieParser())

  // Xử lý cors
  app.use(cors(corsOptions))

  // Enable req.body json data
  app.use(express.json())

  app.use('/v1', APIs_V1)

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  // Tạo server Làm real-time với socket.io
  const server = http.createServer(app)
  const io = new Server(server, { cors: corsOptions })

  io.on('connection', (socket) => {
    // Socket logic base source (can be added here)
    // console.log('user connected: ', socket.id)
  })

  if (env.BUILD_MODE === 'production') {
    server.listen(process.env.PORT, () => {
      console.log(`Server's ${env.AUTHOR} running at port: ${ process.env.PORT }/`)
    })
  } else {
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(`Server's ${env.AUTHOR} running at http://${ env.LOCAL_DEV_APP_HOST }:${ env.LOCAL_DEV_APP_PORT }`)
    })
  }

  // Thực hiện tác vụ cleanup khi đóng server lại
  exitHook(() => {
    console.log('3. Disconnecting')
    CLOSE_DB()
  })
}

(async () => {
  try {
    console.log('1. Connecting to database...')
    await CONNECT_DB()
    console.log('2. Connected to database successfully')
    START_SERVER()
  } catch (error) {
    console.log('Error: ', error)
    process.exit(0)
  }
})()
