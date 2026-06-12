import moment from 'moment'
import { scheduleModel } from '~/models/scheduleModel'
import { GET_DB } from '~/config/prisma'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { v4 as uuidv4 } from 'uuid'
import { securityUtils } from '~/utils/security'


const checkTeacherWorkingTimeAvailability = async (teacherId, date, fromTime, toTime, roleName = 'Giáo viên', prismaInstance = GET_DB()) => {
  const momentDate = moment.utc(date)
  const dayOfWeek = momentDate.day() === 0 ? 1 : momentDate.day() + 1

  const workingTimes = await prismaInstance.accountWorkingTime.findMany({
    where: {
      IdAccount: teacherId,
      DayOfWeek: dayOfWeek,
      Deleted: 0
    }
  })

  if (workingTimes.length === 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `${roleName} chưa đăng ký khung giờ làm việc vào thứ ${dayOfWeek === 1 ? 'Chủ Nhật' : dayOfWeek}!`
    )
  }

  const targetFrom = fromTime.getUTCHours() * 60 + fromTime.getUTCMinutes()
  const targetTo = toTime.getUTCHours() * 60 + toTime.getUTCMinutes()

  let isAvailable = false
  for (const wt of workingTimes) {
    if (wt.FromTime && wt.ToTime) {
      const wtFrom = new Date(wt.FromTime).getUTCHours() * 60 + new Date(wt.FromTime).getUTCMinutes()
      const wtTo = new Date(wt.ToTime).getUTCHours() * 60 + new Date(wt.ToTime).getUTCMinutes()

      if (wtFrom <= targetFrom && wtTo >= targetTo) {
        isAvailable = true
        break
      }
    }
  }

  if (!isAvailable) {
    const fromStr = moment(fromTime).utc().format('HH:mm')
    const toStr = moment(toTime).utc().format('HH:mm')
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Thời gian buổi dạy (${fromStr} - ${toStr}) nằm ngoài khung giờ làm việc đã đăng ký của ${roleName.toLowerCase()} vào thứ ${dayOfWeek === 1 ? 'Chủ Nhật' : dayOfWeek}!`
    )
  }
}

const checkTeacherWorkingTimeAvailabilityForWeekly = async (teacherId, daysOfWeek, fromTimeStr, toTimeStr, roleName = 'Giáo viên', prismaInstance = GET_DB()) => {
  const sFromParts = fromTimeStr.split(':')
  const targetFrom = parseInt(sFromParts[0]) * 60 + parseInt(sFromParts[1])
  const sToParts = toTimeStr.split(':')
  const targetTo = parseInt(sToParts[0]) * 60 + parseInt(sToParts[1])

  for (const dayOfWeek of daysOfWeek) {
    const dbDayOfWeek = dayOfWeek === 0 ? 1 : dayOfWeek

    const workingTimes = await prismaInstance.accountWorkingTime.findMany({
      where: {
        IdAccount: teacherId,
        DayOfWeek: dbDayOfWeek,
        Deleted: 0
      }
    })

    if (workingTimes.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `${roleName} chưa đăng ký khung giờ làm việc vào thứ ${dbDayOfWeek === 1 ? 'Chủ Nhật' : dbDayOfWeek}!`
      )
    }

    let isAvailable = false
    for (const wt of workingTimes) {
      if (wt.FromTime && wt.ToTime) {
        const wtFrom = new Date(wt.FromTime).getUTCHours() * 60 + new Date(wt.FromTime).getUTCMinutes()
        const wtTo = new Date(wt.ToTime).getUTCHours() * 60 + new Date(wt.ToTime).getUTCMinutes()

        if (wtFrom <= targetFrom && wtTo >= targetTo) {
          isAvailable = true
          break
        }
      }
    }

    if (!isAvailable) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Thời gian lịch học (${fromTimeStr} - ${toTimeStr}) nằm ngoài khung giờ làm việc đã đăng ký của ${roleName.toLowerCase()} vào thứ ${dbDayOfWeek === 1 ? 'Chủ Nhật' : dbDayOfWeek}!`
      )
    }
  }
}

const syncCourseStatus = async (courseId, prismaInstance = GET_DB()) => {
  const course = await prismaInstance.course.findUnique({
    where: { Id: courseId }
  })
  if (!course || course.Deleted === 1) return

  const today = moment.utc().startOf('day')
  if (course.EndDate && moment.utc(course.EndDate).startOf('day').isBefore(today)) {
    // Check if there are any unattended sessions left
    const unattendedCount = await prismaInstance.courseScheduleDetail.count({
      where: {
        IdCourse: courseId,
        Deleted: 0,
        Status: 0
      }
    })

    if (unattendedCount === 0) {
      if (course.Status !== 2) {
        await prismaInstance.course.update({
          where: { Id: courseId },
          data: { Status: 2 }
        })
      }
    } else if (course.Status !== 1) {
      await prismaInstance.course.update({
        where: { Id: courseId },
        data: { Status: 1 }
      })
    }
  } else if (course.Status !== 1) {
    await prismaInstance.course.update({
      where: { Id: courseId },
      data: { Status: 1 }
    })
  }
}

/**
 * Lấy chi tiết toàn bộ khóa học bao gồm nội dung bài học
 */
const getFullCourseDetails = async (courseId) => {
  try {
    await syncCourseStatus(courseId)
    const course = await GET_DB().course.findUnique({
      where: { Id: courseId },
      include: {
        Level: true,
        School: true,
        CourseMaterial: {
          where: { Deleted: 0 },
          include: {
            Material: {
              include: {
                MaterialTheme: {
                  where: { Deleted: 0 },
                  include: {
                    MaterialLesson: {
                      where: { Deleted: 0 },
                      orderBy: { Priority: 'asc' }
                    }
                  },
                  orderBy: { Priority: 'asc' }
                }
              }
            }
          }
        },
        CourseSchedule: {
          where: { Deleted: 0 },
          include: {
            Account: {
              select: {
                Id: true,
                FullName: true,
                Email: true,
                Phone: true,
                Address: true,
                LinkAvatar: true,
                Gender: { select: { Name: true } },
                AccountCertificate: true
              }
            },
            CourseScheduleDetail: {
              where: { Deleted: 0 },
              include: {
                Account: {
                  select: {
                    Id: true,
                    FullName: true,
                    Email: true,
                    Phone: true,
                    LinkAvatar: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!course) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Course not found!')
    }

    // Auto-update LinkEnrol if missing
    if (!course.LinkEnrol || !course.LinkEnrol.startsWith('/enroll/')) {
      course.LinkEnrol = `/enroll/${course.Id}`
      await GET_DB().course.update({
        where: { Id: courseId },
        data: { LinkEnrol: course.LinkEnrol }
      })
    }
    course.LinkEnrol = `${WEBSITE_DOMAIN}${course.LinkEnrol}`

    // Map CourseSchedule to include FromPeriodIndexes and ToPeriodIndexes from their CourseScheduleDetail
    if (course.CourseSchedule && course.CourseSchedule.length > 0) {
      course.CourseSchedule = course.CourseSchedule.map(cs => {
        const firstDetail = cs.CourseScheduleDetail?.[0]
        return {
          ...cs,
          FromPeriodIndexes: firstDetail?.FromPeriodIndexes || null,
          ToPeriodIndexes: firstDetail?.ToPeriodIndexes || null
        }
      })
    }

    const completedOrCancelledDetails = await GET_DB().courseScheduleDetail.findFirst({
      where: {
        IdCourse: courseId,
        Deleted: 0,
        Status: { not: 0 }
      }
    })
    course.hasCompletedSessions = !!completedOrCancelledDetails

    return course
  } catch (error) { throw error }
}

const getListCourses = async (userId, role) => {
  try {
    const isTeacher = role?.toUpperCase() === 'TEACHER'
    const isStudent = role?.toUpperCase() === 'STUDENT'

    let whereCondition = { Deleted: 0 }

    if (isTeacher) {
      whereCondition.OR = [
        {
          CourseSchedule: {
            some: {
              IdAccountTeacher: userId,
              Deleted: 0
            }
          }
        },
        {
          CourseSchedule: {
            some: {
              Deleted: 0,
              CourseScheduleDetail: {
                some: {
                  IdAccountTeacher: userId,
                  Deleted: 0
                }
              }
            }
          }
        }
      ]
    } else if (isStudent) {
      whereCondition.CourseStudent = {
        some: {
          IdAccountStudent: userId,
          Deleted: 0
        }
      }
    }

    const courses = await GET_DB().course.findMany({
      where: whereCondition,
      include: {
        Level: true,
        School: true
      }
    })
    await Promise.all(courses.map(async (c) => {
      await syncCourseStatus(c.Id)
      if (!c.LinkEnrol || !c.LinkEnrol.startsWith('/enroll/')) {
        await GET_DB().course.update({
          where: { Id: c.Id },
          data: { LinkEnrol: `/enroll/${c.Id}` }
        })
      }
    }))
    const resultCourses = await GET_DB().course.findMany({
      where: whereCondition,
      include: {
        Level: true,
        School: true
      }
    })
    return resultCourses.map(c => ({
      ...c,
      LinkEnrol: c.LinkEnrol ? `${WEBSITE_DOMAIN}${c.LinkEnrol}` : `${WEBSITE_DOMAIN}/enroll/${c.Id}`
    }))
  } catch (error) { throw error }
}

const getCourseSchedules = async (courseId) => {
  try {
    await syncCourseStatus(courseId)
    const course = await GET_DB().course.findUnique({
      where: { Id: courseId },
      include: {
        CourseSchedule: {
          where: { Deleted: 0 },
          include: {
            Account: { select: { FullName: true, LinkAvatar: true } },
            CourseScheduleDetail: {
              where: { Deleted: 0 },
              orderBy: { Date: 'asc' },
              select: {
                Id: true,
                IdCourseSchedule: true,
                IdCourse: true,
                IdAccountTeacher: true,
                Date: true,
                FromTime: true,
                ToTime: true,
                FromPeriodIndexes: true,
                ToPeriodIndexes: true,
                Status: true,
                Note: true,
                Deleted: true,
                IsOnline: true,
                LinkOnline: true
              }
            }
          }
        }
      }
    })

    if (!course || !course.CourseSchedule) return course

    const detailIds = course.CourseSchedule.flatMap(cs =>
      cs.CourseScheduleDetail ? cs.CourseScheduleDetail.map(d => d.Id) : []
    )

    if (detailIds.length > 0) {
      const detailLessons = await GET_DB().courseScheduleDetailLesson.findMany({
        where: {
          IdCourseScheduleDetail: { in: detailIds },
          Deleted: 0
        }
      })

      const lessonIds = detailLessons.map(dl => dl.IdLesson).filter(Boolean)
      const lessons = await GET_DB().materialLesson.findMany({
        where: { Id: { in: lessonIds } },
        select: {
          Id: true,
          Name: true,
          Title: true,
          MaterialTheme: {
            select: {
              Id: true,
              Name: true,
              Title: true
            }
          }
        }
      })

      const detailLessonMap = new Map(detailLessons.map(dl => [dl.IdCourseScheduleDetail, dl]))
      const lessonMap = new Map(lessons.map(l => [l.Id, l]))

      course.CourseSchedule.forEach(cs => {
        if (cs.CourseScheduleDetail) {
          cs.CourseScheduleDetail.forEach(d => {
            const detailLesson = detailLessonMap.get(d.Id)
            if (detailLesson) {
              const lesson = lessonMap.get(detailLesson.IdLesson)
              d.CourseScheduleDetailLesson = {
                Id: detailLesson.Id,
                IdMaterial: detailLesson.IdMaterial,
                IdTheme: detailLesson.IdTheme,
                IdLesson: detailLesson.IdLesson
              }
              if (lesson) {
                d.MaterialLesson = {
                  Id: lesson.Id,
                  Name: lesson.Name,
                  Title: lesson.Title,
                  ThemeName: lesson.MaterialTheme?.Name || null,
                  ThemeTitle: lesson.MaterialTheme?.Title || null
                }
              } else {
                d.MaterialLesson = null
              }
            } else {
              d.CourseScheduleDetailLesson = null
              d.MaterialLesson = null
            }
          })
        }
      })
    }

    return course
  } catch (error) { throw error }
}

const createCourseScheduleDetail = async (data, role) => {
  try {
    const formatTimeToUTC1970 = (timeVal) => {
      if (!timeVal) return null
      if (typeof timeVal === 'string') {
        if (timeVal.includes('T') || timeVal.includes('-')) {
          const m = moment.utc(timeVal)
          return new Date(`1970-01-01T${m.format('HH:mm:ss')}Z`)
        }
        return new Date(`1970-01-01T${timeVal}:00Z`)
      }
      const m = moment.utc(timeVal)
      return new Date(`1970-01-01T${m.format('HH:mm:ss')}Z`)
    }

    let idCourseSchedule = data.IdCourseSchedule ? parseInt(data.IdCourseSchedule) : null
    if (!idCourseSchedule && data.IdCourse) {
      const activeSchedule = await GET_DB().courseSchedule.findFirst({
        where: { IdCourse: data.IdCourse, Deleted: 0 }
      })
      if (activeSchedule) {
        idCourseSchedule = activeSchedule.Id
      }
    }

    const course = data.IdCourse ? await GET_DB().course.findUnique({
      where: { Id: data.IdCourse }
    }) : null

    let isOnlineValue = false
    if (data.IsOnline !== undefined && data.IsOnline !== null) {
      isOnlineValue = (data.IsOnline === true || data.IsOnline === 1 || data.IsOnline === 'true')
    } else if (course) {
      isOnlineValue = (course.IsOnline === true || course.IsOnline === 1)
    }

    const linkOnlineValue = (data.LinkOnline !== undefined && data.LinkOnline !== null) ? data.LinkOnline : (course ? course.LinkOnline : null)

    const payload = {
      ...data,
      IdCourseSchedule: idCourseSchedule,
      Status: data.Status !== undefined ? parseInt(data.Status) : 0,
      IsOnline: isOnlineValue,
      LinkOnline: linkOnlineValue
    }

    if (payload.FromTime !== undefined) {
      payload.FromTime = formatTimeToUTC1970(payload.FromTime)
    }
    if (payload.ToTime !== undefined) {
      payload.ToTime = formatTimeToUTC1970(payload.ToTime)
    }

    // Không cho phép tạo lịch học trong quá khứ
    const today = moment.utc().startOf('day')
    if (role !== 'ADMIN' && payload.Date && moment.utc(payload.Date).startOf('day').isBefore(today)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Không được phép tạo buổi học trong quá khứ!')
    }

    // Kiểm tra trùng lịch dạy của giáo viên
    const finalTeacher = payload.IdAccountTeacher
    const finalDate = payload.Date ? new Date(payload.Date) : null
    const finalFromTime = payload.FromTime
    const finalToTime = payload.ToTime
    const finalStatus = payload.Status

    if (finalStatus !== 2 && finalDate && finalFromTime && finalToTime) {
      // 1. Kiểm tra khung giờ làm việc đã đăng ký của giáo viên trong AccountWorkingTime
      if (finalTeacher) {
        await checkTeacherWorkingTimeAvailability(finalTeacher, finalDate, finalFromTime, finalToTime, 'Giáo viên')
      }

      // 2. Kiểm tra trùng lịch dạy của giáo viên/trợ giảng
      const conflicts = await GET_DB().courseScheduleDetail.findMany({
        where: {
          Deleted: 0,
          Status: { not: 2 },
          Date: finalDate,
          IdAccountTeacher: finalTeacher || null
        },
        include: {
          Account: { select: { FullName: true } },
          CourseSchedule: {
            include: {
              Course: { select: { Name: true } }
            }
          }
        }
      })

      const targetFrom = finalFromTime.getUTCHours() * 60 + finalFromTime.getUTCMinutes()
      const targetTo = finalToTime.getUTCHours() * 60 + finalToTime.getUTCMinutes()

      for (const c of conflicts) {
        const cFrom = c.FromTime ? new Date(c.FromTime).getUTCHours() * 60 + new Date(c.FromTime).getUTCMinutes() : 0
        const cTo = c.ToTime ? new Date(c.ToTime).getUTCHours() * 60 + new Date(c.ToTime).getUTCMinutes() : 0

        if (cFrom < targetTo && cTo > targetFrom) {
          const confDate = moment.utc(c.Date).format('DD/MM/YYYY')
          const confFrom = moment(c.FromTime).utc().format('HH:mm')
          const confTo = moment(c.ToTime).utc().format('HH:mm')

          let conflictName = ''
          let conflictRole = ''
          if (finalTeacher && c.IdAccountTeacher === finalTeacher) {
            conflictName = c.Account?.FullName || 'Giáo viên'
            conflictRole = 'Giáo viên'
          }

          const conflictingCourseName = c.CourseSchedule?.Course?.Name || c.IdCourse || 'khác'

          throw new ApiError(
            StatusCodes.CONFLICT,
            `Trùng lịch dạy của ${conflictRole.toLowerCase()} ${conflictName} vào ngày ${confDate} (${confFrom} - ${confTo}) tại lớp học "${conflictingCourseName}"!`
          )
        }
      }
    }

    const newDetail = await scheduleModel.createDetail(payload)

    // Save to CourseScheduleDetailLesson if lesson is provided
    const targetLessonId = payload.IdLesson || payload.IdMaterialLesson
    if (targetLessonId) {
      await GET_DB().courseScheduleDetailLesson.create({
        data: {
          IdCourseScheduleDetail: newDetail.Id,
          IdMaterial: payload.IdMaterial ? parseInt(payload.IdMaterial) : null,
          IdTheme: payload.IdTheme ? parseInt(payload.IdTheme) : null,
          IdLesson: parseInt(targetLessonId),
          Deleted: 0,
          Created_By: payload.Created_By || 'admin',
          Created_Date: new Date()
        }
      })
    }

    // Update course EndDate if the new detail's date is after the current EndDate
    const latestCourse = course || (payload.IdCourse ? await GET_DB().course.findUnique({ where: { Id: payload.IdCourse } }) : null)
    if (latestCourse) {
      const detailDate = moment.utc(payload.Date).startOf('day')
      if (!latestCourse.EndDate || detailDate.isAfter(moment.utc(latestCourse.EndDate).startOf('day'))) {
        await GET_DB().course.update({
          where: { Id: payload.IdCourse },
          data: { EndDate: detailDate.toDate() }
        })
      }
    }

    await syncCourseStatus(payload.IdCourse)

    return newDetail
  } catch (error) { throw error }
}

const getLevels = async () => {
  try {
    return await GET_DB().level.findMany({ where: { Deleted: 0 } })
  } catch (error) { throw error }
}

const getMaterials = async () => {
  try {
    return await GET_DB().material.findMany({ where: { Deleted: 0 } })
  } catch (error) { throw error }
}

const createCourse = async (data) => {
  try {
    const {
      Id, Name, IdSchool, IdLevel, IsOnline, LinkOnline,
      Materials,
      Schedules
    } = data

    // Check for duplicate Id
    const existingCourse = await GET_DB().course.findUnique({ where: { Id } })
    if (existingCourse) {
      throw new ApiError(StatusCodes.CONFLICT, `Mã lớp học "${Id}" đã tồn tại! Vui lòng tạo mã khác.`)
    }

    // Ngày bắt đầu không được nhỏ hơn ngày hiện tại
    if (Schedules && Schedules.length > 0) {
      const today = moment.utc().startOf('day')
      for (const s of Schedules) {
        if (s.FromDate && moment.utc(s.FromDate).startOf('day').isBefore(today)) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Ngày bắt đầu khóa học không được nhỏ hơn ngày hiện tại!')
        }
      }
    }

    return await GET_DB().$transaction(async (prisma) => {
      // 1. Create Course
      const linkEnrol = `/enroll/${Id}`
      const newCourse = await prisma.course.create({
        data: {
          Id, Name, IdSchool: parseInt(IdSchool), IdLevel: parseInt(IdLevel),
          IsOnline: Boolean(IsOnline), LinkOnline,
          Thumbnail: data.Thumbnail,
          LinkEnrol: linkEnrol,
          Created_By: data.Created_By || 'admin',
          Created_Date: new Date(),
          Deleted: 0,
          Status: 1
        }
      })

      // 2. Create Materials
      if (Materials && Materials.length > 0) {
        await prisma.courseMaterial.createMany({
          data: Materials.map(id => ({
            IdCourse: newCourse.Id,
            IdMaterial: parseInt(id),
            Created_By: data.Created_By || 'admin',
            Created_Date: new Date(),
            Deleted: 0
          }))
        })
      }

      // 3. Create Schedules & Auto-generate Details
      if (Schedules && Schedules.length > 0) {
        // Group and merge schedules sharing the same teacher, assistant, and times
        const mergedSchedules = []
        const groups = {}
        for (const s of Schedules) {
          const key = `${s.IdAccountTeacher || ''}_${s.FromTime || ''}_${s.ToTime || ''}_${s.FromPeriodIndexes || ''}_${s.ToPeriodIndexes || ''}_${moment.utc(s.FromDate).format('YYYY-MM-DD')}_${moment.utc(s.ToDate).format('YYYY-MM-DD')}`
          if (!groups[key]) {
            groups[key] = { ...s, ScheduleArray: [] }
          }
          if (s.Schedule) {
            s.Schedule.split('').forEach(char => {
              if (!groups[key].ScheduleArray.includes(char)) {
                groups[key].ScheduleArray.push(char)
              }
            })
          }
        }

        for (const key in groups) {
          const g = groups[key]
          const order = { '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '0': 7 }
          g.ScheduleArray.sort((a, b) => order[a] - order[b])
          g.Schedule = g.ScheduleArray.join('')
          delete g.ScheduleArray
          mergedSchedules.push(g)
        }

        for (const s of mergedSchedules) {
          const fromDate = new Date(s.FromDate)
          const toDate = new Date(s.ToDate)

          const daysToInclude = s.Schedule.split('').map(Number)
          if (s.IdAccountTeacher) {
            await checkTeacherWorkingTimeAvailabilityForWeekly(s.IdAccountTeacher, daysToInclude, s.FromTime, s.ToTime, 'Giáo viên', prisma)
          }

          // 3.1. Check for conflicts first
          const conflicts = await prisma.courseScheduleDetail.findMany({
            where: {
              Deleted: 0,
              Status: { not: 2 },
              IdAccountTeacher: s.IdAccountTeacher || null,
              Date: {
                gte: fromDate,
                lte: toDate
              }
            },
            include: {
              Account: { select: { FullName: true } },
              CourseSchedule: {
                include: {
                  Course: { select: { Name: true } }
                }
              }
            }
          })

          const filteredConflicts = conflicts.filter(c => {
            const momentDay = moment.utc(c.Date).day()
            const confDayOfWeek = momentDay === 0 ? 0 : momentDay + 1
            if (!daysToInclude.includes(confDayOfWeek)) return false

            const cFrom = c.FromTime ? new Date(c.FromTime).getUTCHours() * 60 + new Date(c.FromTime).getUTCMinutes() : 0
            const cTo = c.ToTime ? new Date(c.ToTime).getUTCHours() * 60 + new Date(c.ToTime).getUTCMinutes() : 0

            const sFromParts = s.FromTime.split(':')
            const sFrom = parseInt(sFromParts[0]) * 60 + parseInt(sFromParts[1])
            const sToParts = s.ToTime.split(':')
            const sTo = parseInt(sToParts[0]) * 60 + parseInt(sToParts[1])

            return cFrom < sTo && cTo > sFrom
          })

          if (filteredConflicts.length > 0) {
            const firstConflict = filteredConflicts[0]
            const confDate = moment.utc(firstConflict.Date).format('DD/MM/YYYY')
            const confFrom = moment(firstConflict.FromTime).utc().format('HH:mm')
            const confTo = moment(firstConflict.ToTime).utc().format('HH:mm')

            let conflictName = ''
            let conflictRole = ''
            if (s.IdAccountTeacher && firstConflict.IdAccountTeacher === s.IdAccountTeacher) {
              conflictName = firstConflict.Account?.FullName || 'Giáo viên'
              conflictRole = 'Giáo viên'
            }

            const conflictingCourseName = firstConflict.CourseSchedule?.Course?.Name || firstConflict.IdCourse || 'khác'
            throw new ApiError(
              StatusCodes.CONFLICT,
              `Lịch dạy của ${conflictRole.toLowerCase()} ${conflictName} bị trùng vào ngày ${confDate} (${confFrom} - ${confTo}) tại lớp học "${conflictingCourseName}"!`
            )
          }

          const newSchedule = await prisma.courseSchedule.create({
            data: {
              IdCourse: newCourse.Id,
              IdAccountTeacher: s.IdAccountTeacher,
              FromDate: fromDate,
              ToDate: toDate,
              Schedule: s.Schedule,
              FromTime: s.FromTime ? new Date(`1970-01-01T${s.FromTime}:00Z`) : null,
              ToTime: s.ToTime ? new Date(`1970-01-01T${s.ToTime}:00Z`) : null,
              Created_By: data.Created_By || 'admin',
              Created_Date: new Date(),
              Deleted: 0
            }
          })

          // Generate Details based on Schedule string (e.g. "2")
          let current = moment.utc(fromDate)
          const end = moment.utc(toDate)
          const details = []

          while (current.isSameOrBefore(end)) {
            // Moment: 0=Sun, 1=Mon... -> Schema: 0=Sun, 2=Mon...
            const momentDay = current.day()
            const dayOfWeek = momentDay === 0 ? 0 : momentDay + 1
            if (daysToInclude.includes(dayOfWeek)) {
              details.push({
                IdCourseSchedule: newSchedule.Id,
                IdCourse: newCourse.Id,
                IdAccountTeacher: s.IdAccountTeacher,
                Date: current.toDate(),
                FromTime: s.FromTime ? new Date(`1970-01-01T${s.FromTime}:00Z`) : null,
                ToTime: s.ToTime ? new Date(`1970-01-01T${s.ToTime}:00Z`) : null,
                FromPeriodIndexes: s.FromPeriodIndexes ? parseInt(s.FromPeriodIndexes) : null,
                ToPeriodIndexes: s.ToPeriodIndexes ? parseInt(s.ToPeriodIndexes) : null,
                Created_By: data.Created_By || 'admin',
                Created_Date: new Date(),
                Deleted: 0,
                Status: 0,
                IsOnline: newCourse.IsOnline,
                LinkOnline: newCourse.LinkOnline
              })
            }
            current.add(1, 'day')
          }

          if (details.length > 0) {
            await prisma.courseScheduleDetail.createMany({ data: details })
          }
        }
      }

      // 4. Cập nhật StartDate và EndDate tự động của lớp học dựa trên buổi đầu và buổi cuối thực tế
      const firstSession = await prisma.courseScheduleDetail.findFirst({
        where: { IdCourse: newCourse.Id, Deleted: 0 },
        orderBy: { Date: 'asc' }
      })
      const lastSession = await prisma.courseScheduleDetail.findFirst({
        where: { IdCourse: newCourse.Id, Deleted: 0 },
        orderBy: { Date: 'desc' }
      })
      if (firstSession || lastSession) {
        await prisma.course.update({
          where: { Id: newCourse.Id },
          data: {
            StartDate: firstSession ? firstSession.Date : undefined,
            EndDate: lastSession ? lastSession.Date : undefined
          }
        })
      }

      await syncCourseStatus(newCourse.Id, prisma)

      return {
        ...newCourse,
        LinkEnrol: `${WEBSITE_DOMAIN}${newCourse.LinkEnrol}`
      }
    })
  } catch (error) { throw error }
}

const formatTimeToHHMM = (timeVal) => {
  if (!timeVal) return ''
  if (timeVal instanceof Date) {
    return moment.utc(timeVal).format('HH:mm')
  }
  if (typeof timeVal === 'string') {
    if (/^\d{2}:\d{2}$/.test(timeVal)) {
      return timeVal
    }
    if (timeVal.includes('T')) {
      return timeVal.split('T')[1].substring(0, 5)
    }
    const parsedDate = new Date(timeVal)
    if (!isNaN(parsedDate.getTime())) {
      return moment.utc(parsedDate).format('HH:mm')
    }
    return timeVal.substring(0, 5)
  }
  return ''
}

const areSchedulesFunctionallyEqual = (newScheds, oldScheds, dateRangeChanged) => {
  if (dateRangeChanged) return false
  if (newScheds.length !== oldScheds.length) return false

  const getFunctionalSortKey = (s) => {
    const schedule = s.Schedule || ''
    const fromTime = formatTimeToHHMM(s.FromTime)
    const toTime = formatTimeToHHMM(s.ToTime)
    const teacher = s.IdAccountTeacher || ''
    const fromPeriod = s.FromPeriodIndexes || ''
    const toPeriod = s.ToPeriodIndexes || ''
    return `${schedule}_${fromTime}_${toTime}_${teacher}_${fromPeriod}_${toPeriod}`
  }

  const sortedNew = [...newScheds].sort((a, b) => getFunctionalSortKey(a).localeCompare(getFunctionalSortKey(b)))
  const sortedOld = [...oldScheds].sort((a, b) => getFunctionalSortKey(a).localeCompare(getFunctionalSortKey(b)))

  for (let i = 0; i < sortedNew.length; i++) {
    if (getFunctionalSortKey(sortedNew[i]) !== getFunctionalSortKey(sortedOld[i])) {
      return false
    }
  }

  return true
}

const updateCourse = async (courseId, data) => {
  try {
    const {
      Name, IdLevel, IsOnline, LinkOnline,
      Materials,
      Schedules
    } = data

    return await GET_DB().$transaction(async (prisma) => {
      // Get the existing course to check if dates changed
      const oldCourse = await prisma.course.findUnique({
        where: { Id: courseId }
      })

      // 1. Update Course basic details
      const updatedCourse = await prisma.course.update({
        where: { Id: courseId },
        data: {
          Name,
          IdLevel: parseInt(IdLevel),
          IsOnline: Boolean(IsOnline),
          LinkOnline,
          Thumbnail: data.Thumbnail,
          Modified_By: data.Modified_By || 'admin',
          Modified_Date: new Date()
        }
      })

      // Update IsOnline and LinkOnline for all undeleted schedule details of this course from today onwards
      const today = moment.utc().startOf('day').toDate()
      await prisma.courseScheduleDetail.updateMany({
        where: {
          IdCourse: courseId,
          Deleted: 0,
          Status: 0,
          Date: { gte: today }
        },
        data: {
          IsOnline: updatedCourse.IsOnline,
          LinkOnline: updatedCourse.LinkOnline
        }
      })

      // 2. Update Materials: Xóa mềm các giáo trình cũ, thêm các giáo trình mới
      if (Materials !== undefined) {
        await prisma.courseMaterial.updateMany({
          where: { IdCourse: courseId },
          data: {
            Deleted: 1,
            Modified_By: data.Modified_By || 'admin',
            Modified_Date: new Date()
          }
        })

        if (Materials && Materials.length > 0) {
          await prisma.courseMaterial.createMany({
            data: Materials.map(id => ({
              IdCourse: courseId,
              IdMaterial: parseInt(id),
              Created_By: data.Modified_By || 'admin',
              Created_Date: new Date(),
              Deleted: 0
            }))
          })
        }
      }

      // 3. Update Schedules & Details:
      if (Schedules !== undefined) {
        // Cập nhật hoặc tạo các cấu hình lịch cố định mới
        const existingSchedules = await prisma.courseSchedule.findMany({
          where: { IdCourse: courseId, Deleted: 0 },
          orderBy: { Id: 'asc' }
        })

        const mergedSchedules = []
        if (Schedules && Schedules.length > 0) {
          const groups = {}
          for (const s of Schedules) {
            const key = `${s.IdAccountTeacher || ''}_${s.FromTime || ''}_${s.ToTime || ''}_${s.FromPeriodIndexes || ''}_${s.ToPeriodIndexes || ''}_${moment.utc(s.FromDate).format('YYYY-MM-DD')}_${moment.utc(s.ToDate).format('YYYY-MM-DD')}`
            if (!groups[key]) {
              groups[key] = { ...s, ScheduleArray: [] }
            }
            if (s.Schedule) {
              s.Schedule.split('').forEach(char => {
                if (!groups[key].ScheduleArray.includes(char)) {
                  groups[key].ScheduleArray.push(char)
                }
              })
            }
          }

          for (const key in groups) {
            const g = groups[key]
            const order = { '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '0': 7 }
            g.ScheduleArray.sort((a, b) => order[a] - order[b])
            g.Schedule = g.ScheduleArray.join('')
            delete g.ScheduleArray
            mergedSchedules.push(g)
          }
        }

        // Tính xem khoảng thời gian của khóa học có bị thay đổi không
        let dateRangeChanged = false
        if (Schedules && Schedules.length > 0) {
          const payloadMinFromDate = moment.utc(Math.min(...Schedules.map(s => moment.utc(s.FromDate).valueOf()))).startOf('day')
          const payloadMaxToDate = moment.utc(Math.max(...Schedules.map(s => moment.utc(s.ToDate).valueOf()))).startOf('day')

          const oldMinFromDate = oldCourse?.StartDate ? moment.utc(oldCourse.StartDate).startOf('day') : null
          const oldMaxToDate = oldCourse?.EndDate ? moment.utc(oldCourse.EndDate).startOf('day') : null

          if (!oldMinFromDate || !oldMaxToDate || !payloadMinFromDate.isSame(oldMinFromDate) || !payloadMaxToDate.isSame(oldMaxToDate)) {
            dateRangeChanged = true
          }
        }

        // Kiểm tra xem lịch học tuần có thay đổi gì không
        if (!areSchedulesFunctionallyEqual(mergedSchedules, existingSchedules, dateRangeChanged)) {
          // Tính toán tổng số buổi học trước khi thực hiện xóa
          const scheduleCount = await prisma.courseSchedule.count({
            where: { IdCourse: courseId, Deleted: 0 }
          })
          const totalSessions = scheduleCount > 0
            ? await prisma.courseScheduleDetail.count({ where: { IdCourse: courseId, Deleted: 0 } })
            : 0

          const isInitialGeneration = totalSessions === 0
          const applicationDate = Schedules && Schedules.length > 0
            ? moment.utc(Math.min(...Schedules.map(s => moment.utc(s.FromDate).valueOf()))).startOf('day').toDate()
            : moment.utc().startOf('day').toDate()

          // Xóa mềm các buổi dự kiến chưa học từ ngày áp dụng lịch mới trở đi
          await prisma.courseScheduleDetail.updateMany({
            where: {
              IdCourse: courseId,
              Status: 0,
              Date: { gte: applicationDate }
            },
            data: {
              Deleted: 1,
              Modified_By: data.Modified_By || 'admin',
              Modified_Date: new Date()
            }
          })

          // Tính số buổi đã học giữ lại (buổi đã học hoàn thành hoặc các buổi diễn ra trước ngày áp dụng)
          // Loại bỏ các buổi đã hủy (Status: 2) ra khỏi keptSessionsCount để sinh bù buổi mới
          const keptSessionsCount = await prisma.courseScheduleDetail.count({
            where: {
              IdCourse: courseId,
              Deleted: 0,
              Status: { not: 2 }
            }
          })

          const remainingSessions = Math.max(0, totalSessions - keptSessionsCount)

          const createdSchedules = []

          if (mergedSchedules.length > 0) {
            for (let idx = 0; idx < mergedSchedules.length; idx++) {
              const s = mergedSchedules[idx]
              const fromDate = new Date(s.FromDate)
              const toDate = new Date(s.ToDate)

              // Kiểm tra khung giờ làm việc đã đăng ký của giáo viên/trợ giảng trong AccountWorkingTime
              const daysToInclude = s.Schedule.split('').map(Number)
              if (s.IdAccountTeacher) {
                await checkTeacherWorkingTimeAvailabilityForWeekly(s.IdAccountTeacher, daysToInclude, s.FromTime, s.ToTime, 'Giáo viên', prisma)
              }

              if (idx < existingSchedules.length) {
                const existingConfig = existingSchedules[idx]
                const updatedConfig = await prisma.courseSchedule.update({
                  where: { Id: existingConfig.Id },
                  data: {
                    IdAccountTeacher: s.IdAccountTeacher,
                    FromDate: fromDate,
                    ToDate: toDate,
                    Schedule: s.Schedule,
                    FromTime: s.FromTime ? new Date(`1970-01-01T${s.FromTime}:00Z`) : null,
                    ToTime: s.ToTime ? new Date(`1970-01-01T${s.ToTime}:00Z`) : null,
                    Modified_By: data.Modified_By || 'admin',
                    Modified_Date: new Date()
                  }
                })
                createdSchedules.push({ ...s, id: updatedConfig.Id })
              } else {
                const newSchedule = await prisma.courseSchedule.create({
                  data: {
                    IdCourse: courseId,
                    IdAccountTeacher: s.IdAccountTeacher,
                    FromDate: fromDate,
                    ToDate: toDate,
                    Schedule: s.Schedule,
                    FromTime: s.FromTime ? new Date(`1970-01-01T${s.FromTime}:00Z`) : null,
                    ToTime: s.ToTime ? new Date(`1970-01-01T${s.ToTime}:00Z`) : null,
                    Created_By: data.Modified_By || 'admin',
                    Created_Date: new Date(),
                    Deleted: 0
                  }
                })
                createdSchedules.push({ ...s, id: newSchedule.Id })
              }
            }
          }

          // Xóa mềm các cấu hình lịch thừa
          if (existingSchedules.length > mergedSchedules.length) {
            const extraConfigs = existingSchedules.slice(mergedSchedules.length)
            const extraConfigIds = extraConfigs.map(c => c.Id)

            // Di chuyển các buổi học (chưa xóa) sang cấu hình lịch active đầu tiên
            if (createdSchedules.length > 0) {
              await prisma.courseScheduleDetail.updateMany({
                where: {
                  IdCourseSchedule: { in: extraConfigIds },
                  Deleted: 0
                },
                data: {
                  IdCourseSchedule: createdSchedules[0].id
                }
              })
            }

            await prisma.courseSchedule.updateMany({
              where: { Id: { in: extraConfigIds } },
              data: {
                Deleted: 1,
                Modified_By: data.Modified_By || 'admin',
                Modified_Date: new Date()
              }
            })
          }

          // Xếp các buổi học mới
          const details = []
          if (createdSchedules.length > 0) {
            if (isInitialGeneration) {
              // Trường hợp khởi tạo lịch học lần đầu (chưa có buổi học chi tiết nào)
              for (const s of createdSchedules) {
                let current = moment.utc(s.FromDate)
                const todayLimit = moment.utc().startOf('day')
                if (current.isBefore(todayLimit)) {
                  current = todayLimit.clone()
                }
                const end = moment.utc(s.ToDate)
                const daysToInclude = s.Schedule.split('').map(Number)

                while (current.isSameOrBefore(end)) {
                  const momentDay = current.day()
                  const dayOfWeek = momentDay === 0 ? 0 : momentDay + 1
                  if (daysToInclude.includes(dayOfWeek)) {
                    details.push({
                      IdCourseSchedule: s.id,
                      IdCourse: courseId,
                      IdAccountTeacher: s.IdAccountTeacher,
                      Date: current.toDate(),
                      FromTime: s.FromTime ? new Date(`1970-01-01T${s.FromTime}:00Z`) : null,
                      ToTime: s.ToTime ? new Date(`1970-01-01T${s.ToTime}:00Z`) : null,
                      FromPeriodIndexes: s.FromPeriodIndexes ? parseInt(s.FromPeriodIndexes) : null,
                      ToPeriodIndexes: s.ToPeriodIndexes ? parseInt(s.ToPeriodIndexes) : null,
                      Created_By: data.Modified_By || 'admin',
                      Created_Date: new Date(),
                      Deleted: 0,
                      Status: 0,
                      IsOnline: updatedCourse.IsOnline,
                      LinkOnline: updatedCourse.LinkOnline
                    })
                  }
                  current.add(1, 'day')
                }
              }
            } else {
              // Fetch undeleted details to avoid duplicate scheduling on same dates
              const existingDetails = await prisma.courseScheduleDetail.findMany({
                where: {
                  IdCourse: courseId,
                  Deleted: 0
                }
              })
              const existingDates = new Set(existingDetails.map(d => moment.utc(d.Date).format('YYYY-MM-DD')))

              // Xếp số buổi còn lại theo lịch mới bắt đầu từ ngày áp dụng
              let current = moment.utc(applicationDate)
              const todayLimit = moment.utc().startOf('day')
              if (current.isBefore(todayLimit)) {
                current = todayLimit.clone()
              }
              let generatedCount = 0
              let limitDays = 0
              const hasAnyDays = createdSchedules.some(s => s.Schedule && s.Schedule.length > 0)

              if (hasAnyDays && remainingSessions > 0) {
                while (generatedCount < remainingSessions && limitDays < 2000) {
                  const momentDay = current.day()
                  const dayOfWeek = momentDay === 0 ? 0 : momentDay + 1
                  const match = createdSchedules.find(s => {
                    const days = s.Schedule.split('').map(Number)
                    return days.includes(dayOfWeek)
                  })

                  if (match) {
                    const dateStr = current.format('YYYY-MM-DD')
                    if (!existingDates.has(dateStr)) {
                      details.push({
                        IdCourseSchedule: match.id,
                        IdCourse: courseId,
                        IdAccountTeacher: match.IdAccountTeacher,
                        Date: current.toDate(),
                        FromTime: match.FromTime ? new Date(`1970-01-01T${match.FromTime}:00Z`) : null,
                        ToTime: match.ToTime ? new Date(`1970-01-01T${match.ToTime}:00Z`) : null,
                        FromPeriodIndexes: match.FromPeriodIndexes ? parseInt(match.FromPeriodIndexes) : null,
                        ToPeriodIndexes: match.ToPeriodIndexes ? parseInt(match.ToPeriodIndexes) : null,
                        Created_By: data.Modified_By || 'admin',
                        Created_Date: new Date(),
                        Deleted: 0,
                        Status: 0,
                        IsOnline: updatedCourse.IsOnline,
                        LinkOnline: updatedCourse.LinkOnline
                      })
                      generatedCount++
                    }
                  }
                  current.add(1, 'day')
                  limitDays++
                }
              }
            }
          }

          // Kiểm tra trùng lịch của các buổi mới tạo
          if (details.length > 0) {
            const teacherIds = [...new Set(details.map(d => d.IdAccountTeacher).filter(Boolean))]
            const minDate = new Date(Math.min(...details.map(d => new Date(d.Date).getTime())))
            const maxDate = new Date(Math.max(...details.map(d => new Date(d.Date).getTime())))

            const conflicts = await prisma.courseScheduleDetail.findMany({
              where: {
                Deleted: 0,
                IdCourse: { not: courseId },
                Status: { not: 2 },
                Date: { gte: minDate, lte: maxDate },
                IdAccountTeacher: { in: teacherIds }
              },
              include: {
                Account: { select: { FullName: true } },
                CourseSchedule: {
                  include: {
                    Course: { select: { Name: true } }
                  }
                }
              }
            })

            for (const d of details) {
              const targetFrom = d.FromTime ? d.FromTime.getUTCHours() * 60 + d.FromTime.getUTCMinutes() : 0
              const targetTo = d.ToTime ? d.ToTime.getUTCHours() * 60 + d.ToTime.getUTCMinutes() : 0
              const dDateStr = moment.utc(d.Date).format('YYYY-MM-DD')

              for (const c of conflicts) {
                if (moment.utc(c.Date).format('YYYY-MM-DD') !== dDateStr) continue

                const hasTeacherConflict = d.IdAccountTeacher && c.IdAccountTeacher === d.IdAccountTeacher

                if (!hasTeacherConflict) continue

                const cFrom = c.FromTime ? new Date(c.FromTime).getUTCHours() * 60 + new Date(c.FromTime).getUTCMinutes() : 0
                const cTo = c.ToTime ? new Date(c.ToTime).getUTCHours() * 60 + new Date(c.ToTime).getUTCMinutes() : 0

                if (cFrom < targetTo && cTo > targetFrom) {
                  const confDate = moment.utc(c.Date).format('DD/MM/YYYY')
                  const confFrom = moment(c.FromTime).utc().format('HH:mm')
                  const confTo = moment(c.ToTime).utc().format('HH:mm')

                  let conflictName = ''
                  let conflictRole = ''
                  if (hasTeacherConflict) {
                    conflictName = c.Account?.FullName || 'Giáo viên'
                    conflictRole = 'Giáo viên'
                  }

                  const conflictingCourseName = c.CourseSchedule?.Course?.Name || c.IdCourse || 'khác'

                  throw new ApiError(
                    StatusCodes.CONFLICT,
                    `Lịch dạy của ${conflictRole.toLowerCase()} ${conflictName} bị trùng vào ngày ${confDate} (${confFrom} - ${confTo}) tại lớp học "${conflictingCourseName}"!`
                  )
                }
              }
            }
          }

          // Lưu các buổi học mới
          if (details.length > 0) {
            await prisma.courseScheduleDetail.createMany({ data: details })
          }
        }
      }

      // Cập nhật StartDate và EndDate của lớp học dựa trên buổi đầu và buổi cuối thực tế
      const firstSession = await prisma.courseScheduleDetail.findFirst({
        where: {
          IdCourse: courseId,
          Deleted: 0
        },
        orderBy: {
          Date: 'asc'
        }
      })
      const lastSession = await prisma.courseScheduleDetail.findFirst({
        where: {
          IdCourse: courseId,
          Deleted: 0
        },
        orderBy: {
          Date: 'desc'
        }
      })
      if (firstSession || lastSession) {
        await prisma.course.update({
          where: { Id: courseId },
          data: {
            StartDate: firstSession ? firstSession.Date : undefined,
            EndDate: lastSession ? lastSession.Date : undefined
          }
        })
      }

      await syncCourseStatus(courseId, prisma)

      return {
        ...updatedCourse,
        LinkEnrol: updatedCourse.LinkEnrol ? `${WEBSITE_DOMAIN}${updatedCourse.LinkEnrol}` : null
      }
    })
  } catch (error) { throw error }
}

const getPublicCourseDetails = async (courseId) => {
  try {
    const course = await GET_DB().course.findFirst({
      where: { Id: courseId, Deleted: 0 },
      include: {
        Level: true,
        School: true,
        CourseSchedule: {
          where: { Deleted: 0 }
        }
      }
    })
    if (!course) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Lớp học không tồn tại hoặc đã bị xóa!')
    }

    if (!course.LinkEnrol || !course.LinkEnrol.startsWith('/enroll/')) {
      course.LinkEnrol = `/enroll/${course.Id}`
      await GET_DB().course.update({
        where: { Id: courseId },
        data: { LinkEnrol: course.LinkEnrol }
      })
    }

    return {
      ...course,
      LinkEnrol: `${WEBSITE_DOMAIN}${course.LinkEnrol}`
    }
  } catch (error) { throw error }
}


const enrollStudent = async (data) => {
  try {
    const {
      parentName,
      phone,
      email,
      userName,
      password,
      studentName,
      studentBirthDay,
      studentGender,
      courseId,
      idCity,
      idDistrict,
      address
    } = data

    // 1. Check if course exists
    const course = await GET_DB().course.findFirst({
      where: { Id: courseId, Deleted: 0 }
    })
    if (!course) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Lớp học không tồn tại hoặc đã bị xóa!')
    }

    // 2. Check if email exists
    const existingUser = await GET_DB().account.findFirst({
      where: { Email: email, Deleted: 0 }
    })
    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email đã được đăng ký trong hệ thống!')
    }

    // 2.5 Check if userName exists
    const existingUserName = await GET_DB().account.findFirst({
      where: { UserName: userName, Deleted: 0 }
    })
    if (existingUserName) {
      throw new ApiError(StatusCodes.CONFLICT, 'Tên đăng nhập đã tồn tại trong hệ thống!')
    }

    const { password: hashedPassword, passwordSalt } = securityUtils.hashPassword(password)

    // 3. Execute transaction
    return await GET_DB().$transaction(async (prisma) => {
      // 3.1 Create Account (Parent/User)
      const newAccount = await prisma.account.create({
        data: {
          Id: uuidv4(),
          UserName: userName,
          Email: email,
          Password: hashedPassword,
          PasswordSalt: passwordSalt,
          FullName: studentName,
          Phone: phone,
          Address: address || null,
          IdCity: idCity ? parseInt(idCity) : null,
          IdDistrict: idDistrict ? parseInt(idDistrict) : null,
          Active: false, // Inactive until approved
          Deleted: 0,
          Created_By: 'Enrollment System',
          Created_Date: new Date()
        }
      })

      // 3.2 Assign Role 'Student'
      const role = await prisma.accountRole.findFirst({
        where: { Name: 'Student', Deleted: 0 }
      })
      if (role) {
        await prisma.accountInRole.create({
          data: {
            IdAccount: newAccount.Id,
            IdAccountRole: role.Id,
            Deleted: 0,
            Created_By: 'Enrollment System',
            Created_Date: new Date()
          }
        })
      }

      // 3.3 Create AccountStudent (Học viên)
      const newStudent = await prisma.accountStudent.create({
        data: {
          IdAccount: newAccount.Id,
          Name: studentName,
          BirthDay: studentBirthDay ? new Date(studentBirthDay) : null,
          Gender: studentGender ? parseInt(studentGender) : null,
          Deleted: 0,
          Created_By: 'Enrollment System',
          Created_Date: new Date()
        }
      })

      // 3.4 Create AccountStudentParent (Phụ huynh của học viên)
      await prisma.accountStudentParent.create({
        data: {
          IdAccountStudent: newStudent.Id, // Links to newStudent auto-increment ID
          Name: parentName,
          FullName: parentName,
          Phone: phone,
          Email: email,
          Address: address || null,
          IdCity: idCity ? parseInt(idCity) : null,
          IdDistrict: idDistrict ? parseInt(idDistrict) : null,
          Deleted: 0,
          Created_By: 'Enrollment System',
          Created_Date: new Date()
        }
      })

      // 3.5 Create CourseStudent (Enrollment)
      const newEnrollment = await prisma.courseStudent.create({
        data: {
          IdCourse: courseId,
          IdAccountStudent: newAccount.Id,
          IsApprove: 0, // Pending approval
          ApproveDate: null,
          Deleted: 0,
          Created_By: 'Enrollment System',
          Created_Date: new Date()
        }
      })

      return {
        account: newAccount,
        student: newStudent,
        enrollment: newEnrollment
      }
    })
  } catch (error) { throw error }
}

const getCourseAttendance = async (courseId, dateStr) => {
  try {
    const targetDate = dateStr ? moment.utc(dateStr) : moment.utc()
    const startOfWeek = targetDate.clone().startOf('isoWeek').startOf('day')
    const endOfWeek = targetDate.clone().endOf('isoWeek').endOf('day')

    // 1. Get all approved students in the course
    const students = await GET_DB().courseStudent.findMany({
      where: { IdCourse: courseId, Deleted: 0, IsApprove: 1 },
      include: {
        Account: {
          include: {
            AccountStudent: {
              where: { Deleted: 0 }
            }
          }
        }
      },
      orderBy: { Created_Date: 'desc' }
    })

    // 2. Get all scheduled sessions for the course in this week range
    const sessions = await GET_DB().courseScheduleDetail.findMany({
      where: {
        IdCourse: courseId,
        Date: {
          gte: startOfWeek.toDate(),
          lte: endOfWeek.toDate()
        },
        Deleted: 0
      },
      orderBy: { Date: 'asc' }
    })

    // 3. Get all attendance records for the course in this week range
    const attendanceRecords = await GET_DB().courseAttendanceStudent.findMany({
      where: {
        IdCourse: courseId,
        StartDate: {
          gte: startOfWeek.toDate(),
          lte: endOfWeek.toDate()
        },
        Deleted: 0
      }
    })

    return {
      students: students.map(s => {
        const studentProfile = s.Account?.AccountStudent?.[0] || null
        return {
          Id: s.Id,
          IdAccountStudent: s.IdAccountStudent, // Account.Id
          FullName: s.Account?.FullName || 'Chưa cập nhật',
          Email: s.Account?.Email || '',
          Phone: s.Account?.Phone || '',
          LinkAvatar: s.Account?.LinkAvatar || null,
          StudentProfile: studentProfile
        }
      }),
      sessions: sessions.map(sess => ({
        Id: sess.Id,
        Date: sess.Date,
        FromTime: sess.FromTime,
        ToTime: sess.ToTime
      })),
      attendance: attendanceRecords.map(r => ({
        Id: r.Id,
        IdAccountStudent: r.IdAccountStudent || r.IdAccount,
        StartDate: r.StartDate,
        Status: r.Status
      })),
      startOfWeek: startOfWeek.toDate(),
      endOfWeek: endOfWeek.toDate()
    }
  } catch (error) { throw error }
}

const updateCourseAttendance = async (courseId, attendanceData, modifier) => {
  try {
    const results = []

    await GET_DB().$transaction(async (prisma) => {
      for (const item of attendanceData) {
        const { idAccountStudent, date, status } = item
        const parsedDate = moment.utc(date).startOf('day').toDate()

        const existing = await prisma.courseAttendanceStudent.findFirst({
          where: {
            IdCourse: courseId,
            StartDate: parsedDate,
            OR: [
              { IdAccountStudent: idAccountStudent },
              { IdAccount: idAccountStudent }
            ]
          }
        })

        if (existing) {
          const updated = await prisma.courseAttendanceStudent.update({
            where: { Id: existing.Id },
            data: {
              Status: status,
              IdAccountStudent: idAccountStudent,
              IdAccount: idAccountStudent,
              Modified_By: modifier,
              Modified_Date: new Date()
            }
          })
          results.push(updated)
        } else {
          const created = await prisma.courseAttendanceStudent.create({
            data: {
              IdCourse: courseId,
              IdAccountStudent: idAccountStudent,
              IdAccount: idAccountStudent,
              StartDate: parsedDate,
              Status: status,
              Deleted: 0,
              Created_By: modifier,
              Created_Date: new Date()
            }
          })
          results.push(created)
        }
      }
    })

    return { success: true, count: results.length }
  } catch (error) { throw error }
}

const deleteCourse = async (courseId) => {
  try {
    return await GET_DB().$transaction(async (prisma) => {
      const deletedCourse = await prisma.course.update({
        where: { Id: courseId },
        data: { Deleted: 1, Modified_Date: new Date() }
      })

      await prisma.courseScheduleDetail.updateMany({
        where: { IdCourse: courseId },
        data: { Deleted: 1, Modified_Date: new Date() }
      })

      await prisma.courseSchedule.updateMany({
        where: { IdCourse: courseId },
        data: { Deleted: 1 }
      })

      await prisma.courseStudent.updateMany({
        where: { IdCourse: courseId },
        data: { Deleted: 1 }
      })

      await prisma.courseMaterial.updateMany({
        where: { IdCourse: courseId },
        data: { Deleted: 1 }
      })

      return deletedCourse
    })
  } catch (error) { throw error }
}

export const courseService = {
  getFullCourseDetails,
  getListCourses,
  getCourseSchedules,
  createCourseScheduleDetail,
  getLevels,
  getMaterials,
  createCourse,
  updateCourse,
  deleteCourse,
  getPublicCourseDetails,
  enrollStudent,
  getCourseAttendance,
  updateCourseAttendance
}
