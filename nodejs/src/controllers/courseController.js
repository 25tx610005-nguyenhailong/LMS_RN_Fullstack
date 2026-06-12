import { StatusCodes } from 'http-status-codes'
import { courseService } from '~/services/courseService'
import { GET_DB } from '~/config/prisma'
import ApiError from '~/utils/ApiError'

const getFullCourseDetails = async (req, res, next) => {
  try {
    const courseId = req.params.id
    const course = await courseService.getFullCourseDetails(courseId)
    res.status(StatusCodes.OK).json(course)
  } catch (error) { next(error) }
}

const getListCourses = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded.id
    const role = req.jwtDecoded.role
    const courses = await courseService.getListCourses(userId, role)
    res.status(StatusCodes.OK).json(courses)
  } catch (error) { next(error) }
}

const updateCourse = async (req, res, next) => {
  try {
    const updatedCourse = await courseService.updateCourse(req.params.id, req.body)
    res.status(StatusCodes.OK).json(updatedCourse)
  } catch (error) { next(error) }
}

const deleteCourse = async (req, res, next) => {
  try {
    const result = await courseService.deleteCourse(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const getCourseStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    const search = req.query.search || ''
    const statusFilter = req.query.status || 'present' // 'present', 'left', 'all'
    const cityId = req.query.cityId
    const districtId = req.query.districtId

    const whereCondition = {
      IdCourse: req.params.id,
      Deleted: 0,
      IsApprove: 1
    }

    if (search || cityId || districtId) {
      whereCondition.Account = whereCondition.Account || {}
      if (search) {
        whereCondition.Account.OR = [
          { FullName: { contains: search } },
          { Email: { contains: search } },
          { Phone: { contains: search } }
        ]
      }
      if (cityId) {
        whereCondition.Account.IdCity = parseInt(cityId)
      }
      if (districtId) {
        whereCondition.Account.IdDistrict = parseInt(districtId)
      }
    }

    // Fetch all students under the course to accurately filter by status in JS
    const students = await GET_DB().courseStudent.findMany({
      where: whereCondition,
      include: {
        Account: true,
        CourseStudentStatus: {
          where: { Deleted: 0 },
          orderBy: { Created_Date: 'desc' },
          take: 1
        }
      },
      orderBy: { Created_Date: 'desc' }
    })

    // Map status from CourseStudentStatus
    const mappedStudents = students.map(s => {
      const latestStatus = s.CourseStudentStatus?.[0]
      const statusVal = latestStatus ? latestStatus.Status : 1 // Default is 1 (Có mặt)
      const note = latestStatus ? latestStatus.Note : ''
      return {
        ...s,
        StatusVal: statusVal,
        Note: note
      }
    })

    // Filter by status filter parameter
    const filteredStudents = mappedStudents.filter(s => {
      if (statusFilter === 'left') {
        return s.StatusVal === 0
      }
      if (statusFilter === 'present') {
        return s.StatusVal === 1
      }
      return true
    })

    const total = filteredStudents.length
    let paginatedStudents = filteredStudents

    if (page && limit) {
      const skip = (page - 1) * limit
      paginatedStudents = filteredStudents.slice(skip, skip + limit)
    }

    res.status(StatusCodes.OK).json({ students: paginatedStudents, total })
  } catch (error) { next(error) }
}

const getCourseSchedules = async (req, res, next) => {
  try {
    const schedules = await courseService.getCourseSchedules(req.params.id)
    res.status(StatusCodes.OK).json(schedules)
  } catch (error) { next(error) }
}

const createCourseScheduleDetail = async (req, res, next) => {
  try {
    const creator = req.jwtDecoded?.username || 'admin'
    const role = req.jwtDecoded?.role?.toUpperCase() || ''
    const result = await courseService.createCourseScheduleDetail({ ...req.body, Created_By: creator }, role)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) { next(error) }
}

const getLevels = async (req, res, next) => {
  try {
    const levels = await courseService.getLevels()
    res.status(StatusCodes.OK).json(levels)
  } catch (error) { next(error) }
}

const getMaterials = async (req, res, next) => {
  try {
    const materials = await courseService.getMaterials()
    res.status(StatusCodes.OK).json(materials)
  } catch (error) { next(error) }
}

const createCourse = async (req, res, next) => {
  try {
    const creator = req.jwtDecoded?.username || 'admin'
    const result = await courseService.createCourse({ ...req.body, Created_By: creator })
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) { next(error) }
}

const getPublicCourseDetails = async (req, res, next) => {
  try {
    const result = await courseService.getPublicCourseDetails(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const enrollStudent = async (req, res, next) => {
  try {
    const result = await courseService.enrollStudent(req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) { next(error) }
}

const updateCourseStudentStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body
    const courseStudentId = parseInt(req.params.courseStudentId)

    const courseStudent = await GET_DB().courseStudent.findUnique({
      where: { Id: courseStudentId }
    })
    if (!courseStudent || courseStudent.Deleted === 1) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Học viên không tồn tại trong lớp này!')
    }

    const newStatus = await GET_DB().courseStudentStatus.create({
      data: {
        IdCourseStudent: courseStudentId,
        Status: parseInt(status),
        Note: note || '',
        Deleted: 0,
        Created_By: req.jwtDecoded?.username || 'admin',
        Created_Date: new Date()
      }
    })

    res.status(StatusCodes.OK).json(newStatus)
  } catch (error) { next(error) }
}

const getAvailableStudents = async (req, res, next) => {
  try {
    const courseId = req.params.id
    const search = req.query.search || ''
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    const course = await GET_DB().course.findUnique({
      where: { Id: courseId }
    })
    if (!course) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Khóa học không tồn tại!')
    }

    const whereCondition = {
      Deleted: 0,
      AccountInRole: {
        some: {
          AccountRole: {
            Name: 'Student'
          }
        }
      },
      NOT: {
        CourseStudent: {
          some: {
            IdCourse: courseId,
            Deleted: 0
          }
        }
      }
    }

    if (search) {
      whereCondition.OR = [
        { FullName: { contains: search } },
        { Email: { contains: search } },
        { Phone: { contains: search } }
      ]
    }

    const total = await GET_DB().account.count({
      where: whereCondition
    })

    const students = await GET_DB().account.findMany({
      where: whereCondition,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        AccountStudent: {
          where: { Deleted: 0 }
        }
      }
    })

    const formatted = students.map(acc => {
      const studentProfile = acc.AccountStudent?.[0] || null
      return {
        Id: acc.Id,
        FullName: acc.FullName,
        Email: acc.Email,
        Phone: acc.Phone,
        StudentName: studentProfile?.Name || acc.FullName,
        Avatar: acc.LinkAvatar
      }
    })

    res.status(StatusCodes.OK).json({
      students: formatted,
      total
    })
  } catch (error) { next(error) }
}

const addStudentToCourse = async (req, res, next) => {
  try {
    const courseId = req.params.id
    const { accountId, accountIds } = req.body

    if (!accountId && (!accountIds || accountIds.length === 0)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu accountId hoặc accountIds của học viên!')
    }

    const course = await GET_DB().course.findUnique({
      where: { Id: courseId }
    })
    if (!course) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Khóa học không tồn tại!')
    }

    const idsToAdd = accountIds ? accountIds : [accountId]

    const result = await GET_DB().$transaction(async (prisma) => {
      const addedEnrollments = []
      for (const id of idsToAdd) {
        const existing = await prisma.courseStudent.findFirst({
          where: {
            IdCourse: courseId,
            IdAccountStudent: id,
            Deleted: 0
          }
        })
        if (existing) {
          continue
        }

        const enrollment = await prisma.courseStudent.create({
          data: {
            IdCourse: courseId,
            IdAccountStudent: id,
            IsApprove: 1,
            ApproveDate: new Date(),
            Deleted: 0,
            Created_By: req.jwtDecoded?.username || 'admin',
            Created_Date: new Date()
          }
        })

        await prisma.courseStudentStatus.create({
          data: {
            IdCourseStudent: enrollment.Id,
            Status: 1,
            Note: 'Được thêm trực tiếp vào lớp',
            Deleted: 0,
            Created_By: req.jwtDecoded?.username || 'admin',
            Created_Date: new Date()
          }
        })

        addedEnrollments.push(enrollment)
      }
      return addedEnrollments
    })

    res.status(StatusCodes.CREATED).json(result)
  } catch (error) { next(error) }
}

const getCourseAttendance = async (req, res, next) => {
  try {
    const courseId = req.params.id
    const date = req.query.date || null
    const result = await courseService.getCourseAttendance(courseId, date)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const updateCourseAttendance = async (req, res, next) => {
  try {
    const courseId = req.params.id
    const modifier = req.jwtDecoded?.username || 'admin'
    const result = await courseService.updateCourseAttendance(courseId, req.body, modifier)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const courseController = {
  getFullCourseDetails,
  getListCourses,
  updateCourse,
  deleteCourse,
  getCourseStudents,
  getCourseSchedules,
  createCourseScheduleDetail,
  getLevels,
  getMaterials,
  createCourse,
  getPublicCourseDetails,
  enrollStudent,
  updateCourseStudentStatus,
  getAvailableStudents,
  addStudentToCourse,
  getCourseAttendance,
  updateCourseAttendance
}
