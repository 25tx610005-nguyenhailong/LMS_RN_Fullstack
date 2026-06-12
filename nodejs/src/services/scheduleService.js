import { GET_DB } from '~/config/prisma'
import moment from 'moment'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

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

/**
 * Lấy danh sách buổi học của khóa học kèm trạng thái điểm danh của học sinh
 */
const getCourseScheduleWithAttendance = async (courseId, studentId) => {
  try {
    const sessions = await GET_DB().courseScheduleDetail.findMany({
      where: { IdCourse: courseId, Deleted: 0 },
      orderBy: { Date: 'asc' }
    })

    const attendanceRecords = await GET_DB().courseAttendanceStudent.findMany({
      where: { IdCourse: courseId, IdAccount: studentId, Deleted: 0 }
    })

    // Map điểm danh vào từng buổi học
    const fullSchedule = sessions.map(session => {
      const attendance = attendanceRecords.find(record =>
        moment.utc(record.StartDate).isSame(moment.utc(session.Date), 'day')
      )
      return {
        ...session,
        attendanceStatus: attendance ? attendance.Status : null
      }
    })

    return fullSchedule
  } catch (error) { throw error }
}

/**
 * Tự động tạo danh sách buổi học chi tiết từ một Schedule tổng quát
 * Hàm này thường dùng khi giáo viên hoặc admin thiết lập lịch cho khóa học
 */
const generateScheduleDetails = async (scheduleId) => {
  try {
    const mainSchedule = await GET_DB().courseSchedule.findUnique({
      where: { Id: scheduleId }
    })

    if (!mainSchedule) throw new Error('Main schedule not found')

    const { FromDate, ToDate, Schedule, IdCourse, IdAccountTeacher, FromTime, ToTime } = mainSchedule
    const sessions = []

    let currentDate = moment.utc(FromDate)
    const endDate = moment.utc(ToDate)

    // Chuyển chuỗi Schedule (ví dụ "246") thành mảng các số ngày trong tuần
    const daysToGenerate = Schedule.split('').map(d => parseInt(d))

    while (currentDate <= endDate) {
      // moment uses 1 for Monday, 2 for Tuesday, ..., 7 for Sunday
      // We map our "246" (assuming 2=Monday, 4=Wednesday, 6=Friday)
      const dayOfWeek = currentDate.isoWeekday() + 1 // Adjusting to match common Vietnamese notation if needed

      // For simplicity, let's assume mapping: 2=Mon, 3=Tue, ..., 8=Sun
      if (daysToGenerate.includes(dayOfWeek)) {
        sessions.push({
          IdCourseSchedule: scheduleId,
          IdCourse: IdCourse,
          IdAccountTeacher: IdAccountTeacher,
          Date: currentDate.toDate(),
          FromTime: FromTime,
          ToTime: ToTime,
          Status: 0
        })
      }
      currentDate.add(1, 'days')
    }

    // Lưu vào database
    return await GET_DB().courseScheduleDetail.createMany({
      data: sessions
    })
  } catch (error) { throw error }
}

const updateCourseScheduleDetail = async (detailId, data, role) => {
  try {
    const updateData = {
      Modified_By: data.Modified_By || 'admin',
      Modified_Date: new Date()
    }

    if (data.IdAccountTeacher !== undefined) {
      updateData.IdAccountTeacher = data.IdAccountTeacher
    }
    if (data.Date !== undefined) {
      updateData.Date = data.Date ? new Date(data.Date) : null
    }
    if (data.FromPeriodIndexes !== undefined) {
      updateData.FromPeriodIndexes = data.FromPeriodIndexes ? parseInt(data.FromPeriodIndexes) : null
    }
    if (data.ToPeriodIndexes !== undefined) {
      updateData.ToPeriodIndexes = data.ToPeriodIndexes ? parseInt(data.ToPeriodIndexes) : null
    }
    if (data.Status !== undefined) {
      updateData.Status = data.Status !== null ? parseInt(data.Status) : 0
    }
    if (data.Note !== undefined) {
      updateData.Note = data.Note || null
    }
    if (data.IsOnline !== undefined) {
      updateData.IsOnline = (data.IsOnline === true || data.IsOnline === 1 || data.IsOnline === 'true')
    }
    if (data.LinkOnline !== undefined) {
      updateData.LinkOnline = data.LinkOnline || null
    }

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

    if (data.FromTime !== undefined) {
      updateData.FromTime = formatTimeToUTC1970(data.FromTime)
    }
    if (data.ToTime !== undefined) {
      updateData.ToTime = formatTimeToUTC1970(data.ToTime)
    }

    return await GET_DB().$transaction(async (prisma) => {
      const currentDetail = await prisma.courseScheduleDetail.findUnique({
        where: { Id: detailId }
      })
      if (!currentDetail) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Schedule detail not found')
      }

      // Kiểm tra trạng thái đã được xác nhận (Status = 3)
      if (currentDetail.Status === 3) {
        if (role !== 'ADMIN') {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Buổi học đã được xác nhận tính công, không thể thay đổi thông tin!')
        }
        // Nếu là ADMIN, kiểm tra xem có thay đổi bất kỳ trường lịch học nào khác ngoài Status hay không
        const isTeacherChanged = updateData.IdAccountTeacher !== undefined && updateData.IdAccountTeacher !== currentDetail.IdAccountTeacher
        const isDateChanged = updateData.Date !== undefined && (
          (!currentDetail.Date && updateData.Date) ||
          (currentDetail.Date && (!updateData.Date || new Date(updateData.Date).getTime() !== new Date(currentDetail.Date).getTime()))
        )
        const isFromPeriodChanged = updateData.FromPeriodIndexes !== undefined && updateData.FromPeriodIndexes !== currentDetail.FromPeriodIndexes
        const isToPeriodChanged = updateData.ToPeriodIndexes !== undefined && updateData.ToPeriodIndexes !== currentDetail.ToPeriodIndexes
        const isNoteChanged = updateData.Note !== undefined && updateData.Note !== currentDetail.Note
        const isOnlineChanged = updateData.IsOnline !== undefined && updateData.IsOnline !== currentDetail.IsOnline
        const isLinkOnlineChanged = updateData.LinkOnline !== undefined && updateData.LinkOnline !== currentDetail.LinkOnline

        const getMinutesOfDay = (t) => {
          if (!t) return -1
          const d = new Date(t)
          return d.getUTCHours() * 60 + d.getUTCMinutes()
        }
        const isFromTimeChanged = updateData.FromTime !== undefined && getMinutesOfDay(updateData.FromTime) !== getMinutesOfDay(currentDetail.FromTime)
        const isToTimeChanged = updateData.ToTime !== undefined && getMinutesOfDay(updateData.ToTime) !== getMinutesOfDay(currentDetail.ToTime)

        if (isTeacherChanged || isDateChanged || isFromPeriodChanged || isToPeriodChanged || isNoteChanged || isOnlineChanged || isLinkOnlineChanged || isFromTimeChanged || isToTimeChanged) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Buổi học đã được xác nhận tính công. Vui lòng chuyển trạng thái trước khi chỉnh sửa thông tin lịch học!')
        }
      }

      // Không cho phép chỉnh sửa các buổi học trong quá khứ
      const today = moment.utc().startOf('day')
      if (role !== 'ADMIN' && currentDetail.Date && moment.utc(currentDetail.Date).startOf('day').isBefore(today)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Không được phép chỉnh sửa buổi học đã diễn ra trong quá khứ!')
      }

      // Không cho phép chuyển lịch học sang ngày trong quá khứ
      if (role !== 'ADMIN' && updateData.Date && moment.utc(updateData.Date).startOf('day').isBefore(today)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Không được phép chuyển lịch học sang ngày trong quá khứ!')
      }

      const finalTeacher = updateData.IdAccountTeacher !== undefined ? updateData.IdAccountTeacher : currentDetail.IdAccountTeacher
      const finalDate = updateData.Date !== undefined ? updateData.Date : currentDetail.Date
      const finalFromTime = updateData.FromTime !== undefined ? updateData.FromTime : currentDetail.FromTime
      const finalToTime = updateData.ToTime !== undefined ? updateData.ToTime : currentDetail.ToTime
      const finalStatus = updateData.Status !== undefined ? updateData.Status : currentDetail.Status

      // Không cho phép đổi trạng thái lịch học tương lai thành Hoàn thành (1) hoặc Xác nhận (3)
      const isFuture = finalDate && moment.utc(finalDate).startOf('day').isAfter(today)
      if (isFuture && (finalStatus === 1 || finalStatus === 3)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Không được phép chuyển lịch học ở tương lai sang trạng thái Hoàn thành hoặc Xác nhận!')
      }

      if (finalStatus !== 2 && finalDate && finalFromTime && finalToTime) {
        // 1. Kiểm tra khung giờ làm việc đã đăng ký của giáo viên trong AccountWorkingTime
        if (finalTeacher) {
          await checkTeacherWorkingTimeAvailability(finalTeacher, finalDate, finalFromTime, finalToTime, 'Giáo viên', prisma)
        }

        // 2. Kiểm tra trùng lịch dạy của giáo viên/trợ giảng
        const conflicts = await prisma.courseScheduleDetail.findMany({
          where: {
            Deleted: 0,
            Id: { not: detailId },
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

      const updatedDetail = await prisma.courseScheduleDetail.update({
        where: { Id: detailId },
        data: updateData
      })

      // Cập nhật ngày kết thúc EndDate của lớp học dựa trên buổi học cuối cùng
      const lastSession = await prisma.courseScheduleDetail.findFirst({
        where: {
          IdCourse: updatedDetail.IdCourse,
          Deleted: 0
        },
        orderBy: {
          Date: 'desc'
        }
      })
      if (lastSession) {
        await prisma.course.update({
          where: { Id: updatedDetail.IdCourse },
          data: { EndDate: lastSession.Date }
        })
      }

      // Cập nhật trạng thái lớp học (Status) dựa trên ngày kết thúc và các buổi học chưa dạy
      const course = await prisma.course.findUnique({
        where: { Id: updatedDetail.IdCourse }
      })
      if (course && course.Deleted !== 1) {
        const today = moment.utc().startOf('day')
        const finalEndDate = lastSession ? lastSession.Date : course.EndDate
        if (finalEndDate && moment.utc(finalEndDate).startOf('day').isBefore(today)) {
          const unattendedCount = await prisma.courseScheduleDetail.count({
            where: {
              IdCourse: updatedDetail.IdCourse,
              Deleted: 0,
              Status: 0
            }
          })
          const nextStatus = unattendedCount === 0 ? 2 : 1
          if (course.Status !== nextStatus) {
            await prisma.course.update({
              where: { Id: updatedDetail.IdCourse },
              data: { Status: nextStatus }
            })
          }
        } else if (course.Status !== 1) {
          await prisma.course.update({
            where: { Id: updatedDetail.IdCourse },
            data: { Status: 1 }
          })
        }
      }

      const existingLesson = await prisma.courseScheduleDetailLesson.findFirst({
        where: { IdCourseScheduleDetail: detailId, Deleted: 0 }
      })

      if (data.IdLesson) {
        if (existingLesson) {
          await prisma.courseScheduleDetailLesson.update({
            where: { Id: existingLesson.Id },
            data: {
              IdMaterial: data.IdMaterial ? parseInt(data.IdMaterial) : null,
              IdTheme: data.IdTheme ? parseInt(data.IdTheme) : null,
              IdLesson: data.IdLesson ? parseInt(data.IdLesson) : null,
              Modified_By: data.Modified_By || 'admin',
              Modified_Date: new Date()
            }
          })
        } else {
          await prisma.courseScheduleDetailLesson.create({
            data: {
              IdCourseScheduleDetail: detailId,
              IdMaterial: data.IdMaterial ? parseInt(data.IdMaterial) : null,
              IdTheme: data.IdTheme ? parseInt(data.IdTheme) : null,
              IdLesson: data.IdLesson ? parseInt(data.IdLesson) : null,
              Deleted: 0,
              Created_By: data.Modified_By || 'admin',
              Created_Date: new Date()
            }
          })
        }
      } else if (existingLesson) {
        await prisma.courseScheduleDetailLesson.update({
          where: { Id: existingLesson.Id },
          data: {
            Deleted: 1,
            Modified_By: data.Modified_By || 'admin',
            Modified_Date: new Date()
          }
        })
      }

      return updatedDetail
    })
  } catch (error) {
    throw error
  }
}

const joinOnlineClass = async (detailId, userId, role, username) => {
  try {
    const detail = await GET_DB().courseScheduleDetail.findUnique({
      where: { Id: detailId },
      include: {
        CourseSchedule: {
          include: {
            Course: true
          }
        }
      }
    })

    if (!detail) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Schedule detail not found')
    }

    if (!detail.IsOnline || !detail.LinkOnline) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Buổi học này không được thiết lập trực tuyến hoặc thiếu Link Online!')
    }

    const parsedDate = moment.utc(detail.Date).startOf('day').toDate()

    if (role === 'STUDENT') {
      const existingAttendance = await GET_DB().courseAttendanceStudent.findFirst({
        where: {
          IdCourse: detail.IdCourse,
          StartDate: parsedDate,
          OR: [
            { IdAccountStudent: userId },
            { IdAccount: userId }
          ],
          Deleted: 0
        }
      })
      if (!existingAttendance) {
        const detailLesson = await GET_DB().courseScheduleDetailLesson.findFirst({
          where: { IdCourseScheduleDetail: detail.Id, Deleted: 0 }
        })
        await GET_DB().courseAttendanceStudent.create({
          data: {
            IdAccount: userId,
            IdAccountStudent: userId,
            IdCourse: detail.IdCourse,
            IdLevel: detail.CourseSchedule?.Course?.IdLevel || null,
            IdTheme: detailLesson?.IdTheme || null,
            IdLesson: detailLesson?.IdLesson || null,
            StartDate: parsedDate,
            Status: 1, // Present
            Deleted: 0,
            Created_By: username,
            Created_Date: new Date()
          }
        })
      }
    } else if (role === 'TEACHER') {
      const isMainTeacher = (userId === detail.IdAccountTeacher)
      if (!isMainTeacher) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không phải Giáo viên phụ trách của buổi học này!')
      }

      const existingTeacherAttendance = await GET_DB().courseAttendanceTeacher.findFirst({
        where: {
          IdCourse: detail.IdCourse,
          IdAccount: userId,
          StartDate: parsedDate,
          Deleted: 0
        }
      })
      if (!existingTeacherAttendance) {
        const detailLesson = await GET_DB().courseScheduleDetailLesson.findFirst({
          where: { IdCourseScheduleDetail: detail.Id, Deleted: 0 }
        })
        await GET_DB().courseAttendanceTeacher.create({
          data: {
            IdAccount: userId,
            IdCourse: detail.IdCourse,
            IdLevel: detail.CourseSchedule?.Course?.IdLevel || null,
            IdTheme: detailLesson?.IdTheme || null,
            IdLesson: detailLesson?.IdLesson || null,
            StartDate: parsedDate,
            Deleted: 0,
            Created_By: username,
            Created_Date: new Date()
          }
        })
      }

      // Record Salary details
      const teacherSalary = await GET_DB().accountSalary.findFirst({
        where: { IdAccount: userId, Deleted: 0 }
      })
      const exchangeRateRecord = teacherSalary ? await GET_DB().currencyExchange.findFirst({
        where: { Id: teacherSalary.IdMonetaryUnit, Deleted: 0 }
      }) : null
      const exchangeRate = exchangeRateRecord ? exchangeRateRecord.ExchangeRate : 1

      const roleOfSalary = isMainTeacher ? 1 : 2
      const existingSalaryRecord = await GET_DB().courseScheduleDetailSalary.findFirst({
        where: {
          IdCourseSchedule: detail.IdCourseSchedule,
          IdCourse: detail.IdCourse,
          IdAccount: userId,
          Date: parsedDate,
          RoleOfSalary: roleOfSalary,
          Deleted: 0
        }
      })

      if (!existingSalaryRecord) {
        let totalPeriods = 1
        if (detail.ToPeriodIndexes !== null && detail.FromPeriodIndexes !== null) {
          totalPeriods = detail.ToPeriodIndexes - detail.FromPeriodIndexes + 1
        }

        let totalMinutes = 0
        if (detail.FromTime && detail.ToTime) {
          const fromTime = new Date(detail.FromTime)
          const toTime = new Date(detail.ToTime)
          const diffMs = toTime.getTime() - fromTime.getTime()
          totalMinutes = Math.round(diffMs / 60000)
        }

        await GET_DB().courseScheduleDetailSalary.create({
          data: {
            IdSchool: detail.CourseSchedule?.Course?.IdSchool || null,
            IdCourseSchedule: detail.IdCourseSchedule,
            IdCourse: detail.IdCourse,
            IdAccount: userId,
            RoleOfSalary: roleOfSalary,
            Date: parsedDate,
            TotalPeriods: totalPeriods,
            TotalMinutes: totalMinutes,
            WarrantyHours: teacherSalary ? teacherSalary.WarrantyHours : null,
            TypeSalary: teacherSalary ? teacherSalary.TypeSalary : null,
            SalaryPerMonth: teacherSalary ? teacherSalary.SalaryPerMonth : null,
            SalaryPerHour: teacherSalary ? teacherSalary.SalaryPerHour : null,
            IdMonetaryUnit: teacherSalary ? teacherSalary.IdMonetaryUnit : null,
            ExchangeRate: exchangeRate,
            Deleted: 0,
            Created_By: username,
            Created_Date: new Date()
          }
        })
      }
    }

    return { LinkOnline: detail.LinkOnline }
  } catch (error) {
    throw error
  }
}

const getScheduleDetailsList = async ({ page, limit, courseId, schoolId, status, fromDate, toDate, teacherId }) => {
  try {
    const pageNum = parseInt(page) || 1
    const limitNum = parseInt(limit) || 10
    const skip = (pageNum - 1) * limitNum

    const where = {
      Deleted: 0
    }
    if (teacherId) {
      where.IdAccountTeacher = teacherId
    }
    if (courseId) {
      where.IdCourse = courseId
    } else if (schoolId) {
      where.CourseSchedule = {
        Course: {
          IdSchool: parseInt(schoolId)
        }
      }
    }

    if (status !== undefined && status !== '') {
      where.Status = parseInt(status)
    }

    if (fromDate || toDate) {
      where.Date = {}
      if (fromDate) {
        where.Date.gte = moment.utc(fromDate).startOf('day').toDate()
      }
      if (toDate) {
        where.Date.lte = moment.utc(toDate).endOf('day').toDate()
      }
    }

    const [total, data] = await Promise.all([
      GET_DB().courseScheduleDetail.count({ where }),
      GET_DB().courseScheduleDetail.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [
          { Date: 'desc' },
          { FromTime: 'desc' }
        ],
        include: {
          Account: { select: { FullName: true } },
          CourseSchedule: {
            include: {
              Course: { select: { Name: true } }
            }
          }
        }
      })
    ])

    return {
      data,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    }
  } catch (error) {
    throw error
  }
}

const batchConfirmSchedules = async (ids, role) => {
  try {
    if (role !== 'ADMIN') {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Chỉ Admin mới có quyền xác nhận lịch học hàng loạt!')
    }
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Danh sách ID không hợp lệ!')
    }

    const today = moment.utc().startOf('day')
    const futureSchedules = await GET_DB().courseScheduleDetail.findMany({
      where: {
        Id: { in: ids.map(id => parseInt(id)) },
        Deleted: 0,
        Date: {
          gt: today.toDate()
        }
      }
    })

    if (futureSchedules.length > 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Không được phép xác nhận những buổi học trong tương lai!')
    }

    const result = await GET_DB().courseScheduleDetail.updateMany({
      where: {
        Id: { in: ids.map(id => parseInt(id)) },
        Deleted: 0
      },
      data: {
        Status: 3,
        Modified_Date: new Date(),
        Modified_By: 'admin'
      }
    })

    return result
  } catch (error) {
    throw error
  }
}

export const scheduleService = {
  getCourseScheduleWithAttendance,
  generateScheduleDetails,
  updateCourseScheduleDetail,
  joinOnlineClass,
  getScheduleDetailsList,
  batchConfirmSchedules
}
