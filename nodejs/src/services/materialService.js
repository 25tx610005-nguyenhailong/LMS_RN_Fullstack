import { GET_DB } from '~/config/prisma'

const createMaterial = async (data) => {
  try {
    return await GET_DB().$transaction(async (tx) => {
      const material = await tx.material.create({
        data: {
          Name: data.Name,
          ImageUrl: data.ImageUrl,
          IdLevel: data.IdLevel,
          Deleted: 0,
          Created_By: data.Created_By || 'admin',
          Created_Date: new Date()
        }
      })
      // Tự động gán FolderName M{Id}
      return await tx.material.update({
        where: { Id: material.Id },
        data: { FolderName: `M${material.Id}` }
      })
    })
  } catch (error) { throw error }
}

const getMaterials = async () => {
  try {
    return await GET_DB().material.findMany({
      where: { Deleted: 0 },
      include: {
        MaterialTheme: {
          where: { Deleted: 0 },
          include: {
            MaterialLesson: {
              where: { Deleted: 0 },
              include: { MaterialTheme: true }, // Include parent theme for folder naming
              orderBy: { Priority: 'asc' }
            }
          },
          orderBy: { Priority: 'asc' }
        }
      }
    })
  } catch (error) { throw error }
}

const updateMaterial = async (id, data) => {
  try {
    return await GET_DB().material.update({
      where: { Id: parseInt(id) },
      data: {
        ...data,
        Modified_Date: new Date()
      }
    })
  } catch (error) { throw error }
}

const deleteMaterial = async (id) => {
  try {
    return await GET_DB().material.update({
      where: { Id: parseInt(id) },
      data: { Deleted: 1 }
    })
  } catch (error) { throw error }
}

// Themes
const createTheme = async (data) => {
  try {
    if (!data.Name?.trim()) {
      throw new Error('Tên chương là bắt buộc')
    }
    if (!data.Title?.trim()) {
      throw new Error('Tiêu đề chương là bắt buộc')
    }
    const parentMaterial = await GET_DB().material.findUnique({
      where: { Id: parseInt(data.IdMaterial) }
    })

    return await GET_DB().$transaction(async (tx) => {
      const theme = await tx.materialTheme.create({
        data: {
          ...data,
          IdLevel: parentMaterial?.IdLevel,
          Deleted: 0
        }
      })
      // Tự động gán FolderName T{Id}
      return await tx.materialTheme.update({
        where: { Id: theme.Id },
        data: { FolderName: `T${theme.Id}` }
      })
    })
  } catch (error) { throw error }
}

const createManyThemes = async (materialId, themeNames) => {
  try {
    const parentMaterial = await GET_DB().material.findUnique({
      where: { Id: parseInt(materialId) }
    })

    const lastTheme = await GET_DB().materialTheme.findFirst({
      where: { IdMaterial: parseInt(materialId), Deleted: 0 },
      orderBy: { Priority: 'desc' }
    })

    let currentPriority = (lastTheme?.Priority || 0) + 1

    // Vì SQL Server + Prisma createMany không trả về IDs, ta nên tạo từng cái trong vòng lặp hoặc transaction để lấy ID làm FolderName
    const results = []
    for (const item of themeNames) {
      let name, title, priority
      if (typeof item === 'string') {
        name = item.trim()
        title = ''
        priority = currentPriority++
      } else {
        name = item.Name?.trim() || ''
        title = item.Title?.trim() || ''
        priority = item.Priority !== undefined && !isNaN(parseInt(item.Priority))
          ? parseInt(item.Priority)
          : currentPriority++
      }

      if (!name) {
        throw new Error('Tên chương là bắt buộc')
      }
      if (!title) {
        throw new Error('Tiêu đề chương là bắt buộc')
      }

      const theme = await GET_DB().materialTheme.create({
        data: {
          IdMaterial: parseInt(materialId),
          Name: name,
          Title: title,
          IdLevel: parentMaterial?.IdLevel,
          Priority: priority,
          Deleted: 0
        }
      })
      const updated = await GET_DB().materialTheme.update({
        where: { Id: theme.Id },
        data: { FolderName: `T${theme.Id}` }
      })
      results.push(updated)
    }
    return results
  } catch (error) { throw error }
}

const updateTheme = async (id, data) => {
  try {
    if (data.Name !== undefined && !data.Name?.trim()) {
      throw new Error('Tên chương không được để trống')
    }
    if (data.Title !== undefined && !data.Title?.trim()) {
      throw new Error('Tiêu đề chương không được để trống')
    }
    return await GET_DB().materialTheme.update({
      where: { Id: parseInt(id) },
      data: { ...data, Modified_Date: new Date() }
    })
  } catch (error) { throw error }
}

const deleteTheme = async (id) => {
  try {
    return await GET_DB().materialTheme.update({
      where: { Id: parseInt(id) },
      data: { Deleted: 1 }
    })
  } catch (error) { throw error }
}

// Lessons
const createLesson = async (data) => {
  try {
    if (!data.Name?.trim()) {
      throw new Error('Tên bài học là bắt buộc')
    }
    if (!data.Title?.trim()) {
      throw new Error('Tiêu đề bài học là bắt buộc')
    }
    return await GET_DB().$transaction(async (tx) => {
      const lesson = await tx.materialLesson.create({
        data: {
          IdTheme: data.IdMaterialTheme,
          Name: data.Name,
          Title: data.Title,
          Priority: data.Priority,
          FolderName: data.FolderName,
          FileName: data.FileName,
          Deleted: 0
        }
      })
      // Tự động gán FolderName L{Id} nếu chưa có
      if (!lesson.FolderName) {
        return await tx.materialLesson.update({
          where: { Id: lesson.Id },
          data: { FolderName: `L${lesson.Id}` }
        })
      }
      return lesson
    })
  } catch (error) { throw error }
}

const createManyLessons = async (themeId, lessons) => {
  try {
    const parentTheme = await GET_DB().materialTheme.findUnique({
      where: { Id: parseInt(themeId) }
    })
    if (!parentTheme) {
      throw new Error('Không tìm thấy chương học')
    }

    const lastLesson = await GET_DB().materialLesson.findFirst({
      where: { IdTheme: parseInt(themeId), Deleted: 0 },
      orderBy: { Priority: 'desc' }
    })

    let currentPriority = (lastLesson?.Priority || 0) + 1

    const results = []
    for (const item of lessons) {
      const name = item.Name?.trim() || ''
      const title = item.Title?.trim() || ''
      const fileName = item.FileName?.trim() || ''
      const priority = item.Priority !== undefined && !isNaN(parseInt(item.Priority))
        ? parseInt(item.Priority)
        : currentPriority++

      if (!name) {
        throw new Error('Tên bài học là bắt buộc')
      }
      if (!title) {
        throw new Error('Tiêu đề bài học là bắt buộc')
      }

      const lesson = await GET_DB().materialLesson.create({
        data: {
          IdTheme: parseInt(themeId),
          Name: name,
          Title: title,
          Priority: priority,
          FileName: fileName,
          Deleted: 0
        }
      })

      const updated = await GET_DB().materialLesson.update({
        where: { Id: lesson.Id },
        data: { FolderName: `L${lesson.Id}` }
      })
      results.push(updated)
    }
    return results
  } catch (error) { throw error }
}


const updateLesson = async (id, data) => {
  try {
    if (data.Name !== undefined && !data.Name?.trim()) {
      throw new Error('Tên bài học không được để trống')
    }
    if (data.Title !== undefined && !data.Title?.trim()) {
      throw new Error('Tiêu đề bài học không được để trống')
    }
    const updateData = { ...data }
    if (updateData.IdMaterialTheme) {
      updateData.IdTheme = updateData.IdMaterialTheme
      delete updateData.IdMaterialTheme
    }
    return await GET_DB().materialLesson.update({
      where: { Id: parseInt(id) },
      data: { ...updateData, Modified_Date: new Date() }
    })
  } catch (error) { throw error }
}

const deleteLesson = async (id) => {
  try {
    return await GET_DB().materialLesson.update({
      where: { Id: parseInt(id) },
      data: { Deleted: 1 }
    })
  } catch (error) { throw error }
}
// Lesson Resources
import { LocalUploadProvider } from '~/providers/LocalUploadProvider'

const createLessonResource = async ({ lessonId, fileBuffer, originalName, mimeType, fileSize, accountId, courseId, creator }) => {
  try {
    // Ensure lesson exists
    const lesson = await GET_DB().materialLesson.findUnique({
      where: { Id: parseInt(lessonId) },
      include: {
        MaterialTheme: {
          include: {
            Material: true
          }
        }
      }
    })
    if (!lesson) throw new Error('Lesson not found')

    const matFolder = lesson.MaterialTheme?.Material?.FolderName || `M${lesson.MaterialTheme?.IdMaterial || 0}`
    const themeFolder = lesson.MaterialTheme?.FolderName || `T${lesson.IdTheme || 0}`
    const lessonFolder = lesson.FolderName || `L${lesson.Id}`
    const folder = `materials/${matFolder}/${themeFolder}/${lessonFolder}`

    // Upload file to local storage, keeping original file name
    const upload = await LocalUploadProvider.uploadFile(fileBuffer, folder, originalName, true)

    const ext = originalName.split('.').pop().toLowerCase() || 'unknown'

    // Create DB record
    return await GET_DB().materialLessonResource.create({
      data: {
        IdMaterialLesson: parseInt(lessonId),
        IdAccount: accountId,
        IdCourse: courseId,
        ResourceName: originalName,
        ResourceType: ext.slice(0, 50),
        ResourceUrl: upload.secure_url,
        FileSize: fileSize,
        Created_By: creator || 'admin'
      }
    })
  } catch (error) { throw error }
}

const getLessonResources = async (lessonId, accountId = null, role = null, courseId = null) => {
  try {
    const roleUpper = role?.toUpperCase()
    const query = {
      where: { IdMaterialLesson: parseInt(lessonId), Deleted: 0 }
    }

    if (roleUpper === 'STUDENT') {
      // Học sinh load theo idCourse, không quan tâm IdAccount
      query.where.IdCourse = courseId || 'none'
    } else if (roleUpper === 'TEACHER') {
      // Giáo viên load tài liệu của họ và đúng lớp đó
      query.where.IdAccount = accountId
      if (courseId) {
        query.where.IdCourse = courseId
      }
    } else if (roleUpper === 'ADMIN') {
      // Admin xem tất cả, có thể lọc theo courseId để test
      if (courseId) {
        query.where.IdCourse = courseId
      }
    } else {
      // Fallback
      if (accountId) {
        query.where.IdAccount = accountId
      }
      if (courseId) {
        query.where.IdCourse = courseId
      }
    }

    return await GET_DB().materialLessonResource.findMany(query)
  } catch (error) { throw error }
}

const updateLessonResource = async (resourceId, data) => {
  try {
    const existing = await GET_DB().materialLessonResource.findUnique({
      where: { Id: parseInt(resourceId) }
    })
    if (!existing) throw new Error('Resource not found')

    let updateData = { ...data, Modified_Date: new Date() }

    // If resource name is modified, rename physical file accordingly
    if (data.ResourceName && data.ResourceName !== existing.ResourceName) {
      const newUrl = await LocalUploadProvider.renameFile(existing.ResourceUrl, data.ResourceName)
      updateData.ResourceUrl = newUrl
    }

    return await GET_DB().materialLessonResource.update({
      where: { Id: parseInt(resourceId) },
      data: updateData
    })
  } catch (error) { throw error }
}

const deleteLessonResource = async (resourceId) => {
  try {
    const existing = await GET_DB().materialLessonResource.findUnique({
      where: { Id: parseInt(resourceId) }
    })
    if (existing && existing.ResourceUrl) {
      await LocalUploadProvider.deleteFile(existing.ResourceUrl)
    }

    return await GET_DB().materialLessonResource.update({
      where: { Id: parseInt(resourceId) },
      data: { Deleted: 1 }
    })
  } catch (error) { throw error }
}

export const materialService = {
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
  createLessonResource,
  getLessonResources,
  updateLessonResource,
  deleteLessonResource
}
