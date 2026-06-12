import { StatusCodes } from 'http-status-codes'
import { schoolService } from '~/services/schoolService'

const getSchoolDashboardData = async (req, res, next) => {
  try {
    const schoolId = parseInt(req.params.schoolId)
    const userId = req.jwtDecoded.id
    const role = req.jwtDecoded.role
    const dashboardData = await schoolService.getSchoolDashboardData(schoolId, userId, role)
    res.status(StatusCodes.OK).json(dashboardData)
  } catch (error) { next(error) }
}

const getSchools = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded.id
    const role = req.jwtDecoded.role
    const schools = await schoolService.getSchools(userId, role)
    res.status(StatusCodes.OK).json(schools)
  } catch (error) { next(error) }
}

const createSchool = async (req, res, next) => {
  try {
    const result = await schoolService.createSchool({
      ...req.body,
      Created_By: req.jwtDecoded?.username || 'admin'
    })
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) { next(error) }
}

const updateSchool = async (req, res, next) => {
  try {
    const result = await schoolService.updateSchool(req.params.schoolId, {
      ...req.body,
      Modified_By: req.jwtDecoded?.username || 'admin'
    })
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const getCities = async (req, res, next) => {
  try {
    const cities = await schoolService.getCities()
    res.status(StatusCodes.OK).json(cities)
  } catch (error) { next(error) }
}

const getDistricts = async (req, res, next) => {
  try {
    const districts = await schoolService.getDistricts(req.query.cityId)
    res.status(StatusCodes.OK).json(districts)
  } catch (error) { next(error) }
}

const deleteSchool = async (req, res, next) => {
  try {
    await schoolService.deleteSchool(req.params.schoolId)
    res.status(StatusCodes.OK).json({ message: 'School deleted successfully' })
  } catch (error) { next(error) }
}

const addTeachersToSchool = async (req, res, next) => {
  try {
    const schoolId = req.params.schoolId
    const { teacherIds } = req.body
    const creator = req.jwtDecoded?.username || 'admin'
    const result = await schoolService.addTeachersToSchool(schoolId, teacherIds, creator)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const getSchoolSettings = async (req, res, next) => {
  try {
    const schoolId = parseInt(req.params.schoolId)
    const settings = await schoolService.getSchoolSettings(schoolId)
    res.status(StatusCodes.OK).json(settings)
  } catch (error) { next(error) }
}

const updateSchoolSettings = async (req, res, next) => {
  try {
    const schoolId = parseInt(req.params.schoolId)
    const result = await schoolService.updateSchoolSettings(schoolId, {
      ...req.body,
      Modified_By: req.jwtDecoded?.username || 'admin'
    })
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const getAvailableTeachers = async (req, res, next) => {
  try {
    const schoolId = parseInt(req.params.schoolId)
    const { fromDate, toDate, dayOfWeek, fromTime, toTime, excludeCourseId } = req.query
    const result = await schoolService.getAvailableTeachers(
      schoolId,
      fromDate,
      toDate,
      dayOfWeek,
      fromTime,
      toTime,
      excludeCourseId
    )
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const getSchoolStudents = async (req, res, next) => {
  try {
    const schoolId = parseInt(req.params.schoolId)
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const search = req.query.search || ''
    const courseId = req.query.courseId || null
    const status = req.query.status || 'approved'
    const cityId = req.query.cityId || null
    const districtId = req.query.districtId || null

    const result = await schoolService.getSchoolStudents({
      schoolId,
      page,
      limit,
      search,
      courseId,
      status,
      cityId,
      districtId
    })
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const approveStudentEnrollment = async (req, res, next) => {
  try {
    const schoolId = parseInt(req.params.schoolId)
    const enrollmentId = parseInt(req.params.enrollmentId)
    const modifier = req.jwtDecoded?.username || 'admin'
    const result = await schoolService.approveStudentEnrollment(schoolId, enrollmentId, modifier)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const rejectStudentEnrollment = async (req, res, next) => {
  try {
    const schoolId = parseInt(req.params.schoolId)
    const enrollmentId = parseInt(req.params.enrollmentId)
    const modifier = req.jwtDecoded?.username || 'admin'
    const result = await schoolService.rejectStudentEnrollment(schoolId, enrollmentId, modifier)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const createSchoolStudent = async (req, res, next) => {
  try {
    const schoolId = parseInt(req.params.schoolId)
    const result = await schoolService.createSchoolStudent(schoolId, req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) { next(error) }
}

const updateSchoolStudent = async (req, res, next) => {
  try {
    const schoolId = parseInt(req.params.schoolId)
    const accountId = req.params.accountId
    const result = await schoolService.updateSchoolStudent(schoolId, accountId, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const deleteSchoolStudent = async (req, res, next) => {
  try {
    const schoolId = parseInt(req.params.schoolId)
    const accountId = req.params.accountId
    await schoolService.deleteSchoolStudent(schoolId, accountId)
    res.status(StatusCodes.OK).json({ message: 'Đã xóa thông tin học viên thành công' })
  } catch (error) { next(error) }
}

export const schoolController = {
  getSchoolDashboardData,
  getSchools,
  createSchool,
  updateSchool,
  deleteSchool,
  getCities,
  getDistricts,
  addTeachersToSchool,
  getSchoolSettings,
  updateSchoolSettings,
  getAvailableTeachers,
  getSchoolStudents,
  approveStudentEnrollment,
  rejectStudentEnrollment,
  createSchoolStudent,
  updateSchoolStudent,
  deleteSchoolStudent
}
