import { StatusCodes } from 'http-status-codes'
import { materialService } from '~/services/materialService'
import ApiError from '~/utils/ApiError'

const checkAdmin = (req) => {
  const role = req.jwtDecoded?.role?.toUpperCase()
  if (role === 'TEACHER') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Quyền hạn của bạn (Giáo viên) không được thực hiện thao tác này.')
  }
}

const createMaterial = async (req, res, next) => {
  try {
    checkAdmin(req)
    const creator = req.jwtDecoded?.username || 'admin'
    const result = await materialService.createMaterial({ ...req.body, Created_By: creator })
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) { next(error) }
}

const getMaterials = async (req, res, next) => {
  try {
    const materials = await materialService.getMaterials()
    res.status(StatusCodes.OK).json(materials)
  } catch (error) { next(error) }
}

const updateMaterial = async (req, res, next) => {
  try {
    checkAdmin(req)
    const result = await materialService.updateMaterial(req.params.id, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const deleteMaterial = async (req, res, next) => {
  try {
    checkAdmin(req)
    const result = await materialService.deleteMaterial(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const createTheme = async (req, res, next) => {
  try {
    checkAdmin(req)
    const result = await materialService.createTheme(req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) { next(error) }
}

const createManyThemes = async (req, res, next) => {
  try {
    checkAdmin(req)
    const { materialId, themeNames } = req.body
    const result = await materialService.createManyThemes(materialId, themeNames)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) { next(error) }
}

const updateTheme = async (req, res, next) => {
  try {
    checkAdmin(req)
    const result = await materialService.updateTheme(req.params.id, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const deleteTheme = async (req, res, next) => {
  try {
    checkAdmin(req)
    const result = await materialService.deleteTheme(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const createLesson = async (req, res, next) => {
  try {
    checkAdmin(req)
    const result = await materialService.createLesson(req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) { next(error) }
}

const createManyLessons = async (req, res, next) => {
  try {
    checkAdmin(req)
    const { themeId, lessons } = req.body
    const result = await materialService.createManyLessons(themeId, lessons)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) { next(error) }
}


const updateLesson = async (req, res, next) => {
  try {
    const role = req.jwtDecoded?.role?.toUpperCase()
    if (role === 'TEACHER') {
      // Teachers can only edit file attachments, block name/title/priority modifications
      delete req.body.Name
      delete req.body.Title
      delete req.body.Priority
      delete req.body.IdMaterialTheme
    }
    const result = await materialService.updateLesson(req.params.id, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const deleteLesson = async (req, res, next) => {
  try {
    checkAdmin(req)
    const result = await materialService.deleteLesson(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

/* New functions for lesson resources */
const mapResourceToFrontend = (resource) => {
  if (!resource) return null
  return {
    id: resource.Id,
    lessonId: resource.IdMaterialLesson,
    resourceName: resource.ResourceName,
    resourceType: resource.ResourceType,
    filePath: resource.ResourceUrl,
    fileSize: resource.FileSize,
    uploadedAt: resource.Created_Date
  }
}

const uploadLessonResource = async (req, res, next) => {
  try {
    const lessonId = req.params.lessonId
    const accountId = req.jwtDecoded?.id || null
    const creator = req.jwtDecoded?.username || 'admin'
    const role = req.jwtDecoded?.role?.toUpperCase() || null
    const courseId = req.body.courseId || null

    if (role === 'TEACHER' && !courseId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Giáo viên bắt buộc phải chọn lớp học khi tải tài nguyên lên!')
    }

    if (req.files && req.files.length > 0) {
      const results = []
      for (const file of req.files) {
        const { buffer, originalname, mimetype, size } = file
        const result = await materialService.createLessonResource({
          lessonId,
          fileBuffer: buffer,
          originalName: originalname,
          mimeType: mimetype,
          fileSize: size,
          accountId,
          courseId,
          creator
        })
        results.push(mapResourceToFrontend(result))
      }
      res.status(StatusCodes.CREATED).json(results)
    } else if (req.file) {
      const { buffer, originalname, mimetype, size } = req.file
      const result = await materialService.createLessonResource({
        lessonId,
        fileBuffer: buffer,
        originalName: originalname,
        mimeType: mimetype,
        fileSize: size,
        accountId,
        courseId,
        creator
      })
      res.status(StatusCodes.CREATED).json(mapResourceToFrontend(result))
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'No file uploaded' })
    }
  } catch (error) { next(error) }
}

const listLessonResources = async (req, res, next) => {
  try {
    const lessonId = req.params.lessonId
    const accountId = req.jwtDecoded?.id || null
    const role = req.jwtDecoded?.role || null
    const courseId = req.query.courseId || null
    const resources = await materialService.getLessonResources(lessonId, accountId, role, courseId)
    res.status(StatusCodes.OK).json(resources.map(mapResourceToFrontend))
  } catch (error) { next(error) }
}

const updateLessonResource = async (req, res, next) => {
  try {
    const resourceId = req.params.id
    const result = await materialService.updateLessonResource(resourceId, req.body)
    res.status(StatusCodes.OK).json(mapResourceToFrontend(result))
  } catch (error) { next(error) }
}

const deleteLessonResource = async (req, res, next) => {
  try {
    const resourceId = req.params.id
    const result = await materialService.deleteLessonResource(resourceId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const materialController = {
  createMaterial,
  getMaterials,
  updateMaterial,
  deleteMaterial,
  createTheme,
  createManyThemes,
  updateTheme,
  deleteTheme,
  createLesson,
  createManyLessons,
  updateLesson,
  deleteLesson,
  uploadLessonResource,
  listLessonResources,
  updateLessonResource,
  deleteLessonResource
}
