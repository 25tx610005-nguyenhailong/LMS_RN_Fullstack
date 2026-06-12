import { GET_DB } from '~/config/prisma'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import { securityUtils } from '~/utils/security'

/**
 * Lấy danh sách giáo viên thuộc một trường học
 */
const getSchoolDashboardData = async (schoolId, userId, role) => {
  try {
    const isTeacher = role?.toUpperCase() === 'TEACHER'
    const isStudent = role?.toUpperCase() === 'STUDENT'

    // Lọc classes dựa trên Role
    let classWhere = { IdSchool: schoolId, Deleted: 0 }
    if (isTeacher) {
      classWhere.OR = [
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
    }
    if (isStudent) {
      classWhere.CourseStudent = { some: { IdAccountStudent: userId, Deleted: 0 } }
    }

    const teachersCount = await GET_DB().account.count({
      where: { Deleted: 0, AccountInRole: { some: { AccountRole: { Name: 'Teacher' } } } }
    })
    const classesCount = await GET_DB().course.count({
      where: classWhere
    })
    const studentsCount = await GET_DB().account.count({
      where: { Deleted: 0, AccountInRole: { some: { AccountRole: { Name: 'Student' } } } }
    })

    const teachers = await GET_DB().account.findMany({
      where: {
        Deleted: 0,
        SchoolTeacher: { some: { IdSchool: schoolId, Deleted: 0 } }
      },
      include: {
        AccountSalary: { where: { Deleted: 0 } },
        AccountCertificate: true,
        AccountWorkingTime: { where: { OR: [{ Deleted: 0 }, { Deleted: null }] } }
      }
    })

    const classes = await GET_DB().course.findMany({
      where: classWhere,
      include: { Level: true, _count: { select: { CourseStudent: true } } }
    })

    const paymentMethods = await GET_DB().paymentMethod.findMany({
      where: { Deleted: 0 }
    })

    const schoolInfo = await GET_DB().school.findUnique({
      where: { Id: parseInt(schoolId) }
    })

    if (schoolInfo) {
      const city = await GET_DB().city.findUnique({ where: { Id: schoolInfo.IdCity || 0 } })
      const district = await GET_DB().district.findUnique({ where: { Id: schoolInfo.IdDistrict || 0 } })
      schoolInfo.City = city || null
      schoolInfo.District = district || null
    }

    return {
      school: schoolInfo,
      statistics: { teachersCount, classesCount, studentsCount },
      teachers,
      classes,
      paymentMethods
    }
  } catch (error) { throw error }
}

const getSchools = async (userId, role) => {
  try {
    const isTeacher = role?.toUpperCase() === 'TEACHER'
    const isStudent = role?.toUpperCase() === 'STUDENT'

    let whereCondition = { Deleted: 0 }

    if (isTeacher) {
      whereCondition.SchoolTeacher = {
        some: {
          IdAccount: userId,
          Deleted: 0
        }
      }
    } else if (isStudent) {
      whereCondition.Course = {
        some: {
          Deleted: 0,
          CourseStudent: {
            some: {
              IdAccountStudent: userId,
              Deleted: 0
            }
          }
        }
      }
    }

    const schools = await GET_DB().school.findMany({
      where: whereCondition
    })

    // Lấy tất cả city và district để map thủ công (vì không có khóa ngoại trong DB)
    const cities = await GET_DB().city.findMany()
    const districts = await GET_DB().district.findMany()

    return schools.map(school => {
      const city = cities.find(c => c.Id === school.IdCity)
      const district = districts.find(d => d.Id === school.IdDistrict)
      return {
        ...school,
        City: city || null,
        District: district || null
      }
    })
  } catch (error) { throw error }
}

const createSchool = async (data) => {
  try {
    return await GET_DB().school.create({
      data: {
        Name: data.Name,
        Phone: data.Phone,
        Address: data.Address,
        IdCity: data.IdCity ? parseInt(data.IdCity) : null,
        IdDistrict: data.IdDistrict ? parseInt(data.IdDistrict) : null,
        Thumbnail: data.Thumbnail || null,
        Deleted: 0,
        Created_By: data.Created_By || 'System',
        Created_Date: new Date()
      }
    })
  } catch (error) { throw error }
}

const updateSchool = async (id, data) => {
  try {
    return await GET_DB().school.update({
      where: { Id: parseInt(id) },
      data: {
        Name: data.Name,
        Phone: data.Phone,
        Address: data.Address,
        IdCity: data.IdCity ? parseInt(data.IdCity) : null,
        IdDistrict: data.IdDistrict ? parseInt(data.IdDistrict) : null,
        Thumbnail: data.Thumbnail || null,
        Modified_By: data.Modified_By || 'System',
        Modified_Date: new Date()
      }
    })
  } catch (error) { throw error }
}

const getCities = async () => {
  try {
    return await GET_DB().city.findMany()
  } catch (error) { throw error }
}

const getDistricts = async (cityId) => {
  try {
    const where = cityId ? { IdCity: parseInt(cityId) } : {}
    return await GET_DB().district.findMany({ where })
  } catch (error) { throw error }
}

const deleteSchool = async (id) => {
  try {
    return await GET_DB().school.update({
      where: { Id: parseInt(id) },
      data: { Deleted: 1 }
    })
  } catch (error) { throw error }
}

const addTeachersToSchool = async (schoolId, teacherIds, creator) => {
  try {
    const existingLinks = await GET_DB().schoolTeacher.findMany({
      where: {
        IdSchool: parseInt(schoolId),
        IdAccount: { in: teacherIds }
      }
    })

    const existingIds = existingLinks.map(link => link.IdAccount)
    const newTeacherIds = teacherIds.filter(id => !existingIds.includes(id))

    if (newTeacherIds.length === 0) return { count: 0 }

    const data = newTeacherIds.map(id => ({
      IdSchool: parseInt(schoolId),
      IdAccount: id,
      Created_By: creator,
      Deleted: 0
    }))

    return await GET_DB().schoolTeacher.createMany({
      data
    })
  } catch (error) { throw error }
}

const getSchoolSettings = async (schoolId) => {
  try {
    const school = await GET_DB().school.findUnique({
      where: { Id: schoolId }
    })

    if (!school) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'School not found!')
    }

    const periods = await GET_DB().schoolPeriod.findMany({
      where: { IdSchool: schoolId, Deleted: 0 },
      orderBy: { Indexes: 'asc' }
    })

    // Check if any class in this school has active schedules created
    const hasSchedules = await GET_DB().courseSchedule.findFirst({
      where: {
        Course: {
          IdSchool: schoolId,
          Deleted: 0
        },
        Deleted: 0
      }
    })
    const isLocked = !!hasSchedules

    // Format FromTime and ToTime to "HH:MM" for the frontend if they exist
    const formattedPeriods = periods.map(p => {
      const formatTime = (dateObj) => {
        if (!dateObj) return ''
        try {
          const isoString = dateObj.toISOString() // "1970-01-01T08:00:00.000Z"
          return isoString.split('T')[1].substring(0, 5) // "08:00"
        } catch (e) {
          return ''
        }
      }
      return {
        ...p,
        FromTime: formatTime(p.FromTime),
        ToTime: formatTime(p.ToTime)
      }
    })

    return { school, periods: formattedPeriods, isLocked }
  } catch (error) { throw error }
}

const updateSchoolSettings = async (schoolId, data) => {
  try {
    const { Name, Phone, Address, IdCity, IdDistrict, periods } = data

    return await GET_DB().$transaction(async (prisma) => {
      // Check if any class in this school has active schedules created
      const hasSchedules = await prisma.courseSchedule.findFirst({
        where: {
          Course: {
            IdSchool: schoolId,
            Deleted: 0
          },
          Deleted: 0
        }
      })

      if (hasSchedules) {
        // If locked, we do NOT allow updating periods (time & timeline settings),
        // but we STILL allow updating general school information.
        const updatedSchool = await prisma.school.update({
          where: { Id: schoolId },
          data: {
            Name,
            Phone,
            Address,
            IdCity: IdCity ? parseInt(IdCity) : null,
            IdDistrict: IdDistrict ? parseInt(IdDistrict) : null,
            Modified_By: data.Modified_By || 'System',
            Modified_Date: new Date()
          }
        })

        // Return unchanged periods
        const activePeriods = await prisma.schoolPeriod.findMany({
          where: { IdSchool: schoolId, Deleted: 0 },
          orderBy: { Indexes: 'asc' }
        })

        const formattedPeriods = activePeriods.map(p => {
          const formatTime = (dateObj) => {
            if (!dateObj) return ''
            try {
              const isoString = dateObj.toISOString()
              return isoString.split('T')[1].substring(0, 5)
            } catch (e) {
              return ''
            }
          }
          return {
            ...p,
            FromTime: formatTime(p.FromTime),
            ToTime: formatTime(p.ToTime)
          }
        })

        return {
          school: updatedSchool,
          periods: formattedPeriods,
          isLocked: true
        }
      }

      // If NOT locked, update everything: School Details and SchoolPeriods
      // 1. Update School basic details
      const updatedSchool = await prisma.school.update({
        where: { Id: schoolId },
        data: {
          Name,
          Phone,
          Address,
          IdCity: IdCity ? parseInt(IdCity) : null,
          IdDistrict: IdDistrict ? parseInt(IdDistrict) : null,
          Modified_By: data.Modified_By || 'System',
          Modified_Date: new Date()
        }
      })

      // 2. Soft delete existing periods
      await prisma.schoolPeriod.updateMany({
        where: { IdSchool: schoolId },
        data: {
          Deleted: 1,
          Modified_By: data.Modified_By || 'System',
          Modified_Date: new Date()
        }
      })

      // 3. Create new periods
      if (periods && periods.length > 0) {
        const periodsData = periods.map(p => ({
          IdSchool: schoolId,
          Time: p.Time ? parseInt(p.Time) : 45,
          FromTime: p.FromTime ? new Date(`1970-01-01T${p.FromTime}:00Z`) : null,
          ToTime: p.ToTime ? new Date(`1970-01-01T${p.ToTime}:00Z`) : null,
          Indexes: parseInt(p.Indexes),
          Deleted: 0,
          Created_By: data.Modified_By || 'System',
          Created_Date: new Date()
        }))

        await prisma.schoolPeriod.createMany({
          data: periodsData
        })
      }

      return {
        school: updatedSchool,
        periods: periods || [],
        isLocked: false
      }
    })
  } catch (error) { throw error }
}

const getAvailableTeachers = async (schoolId, fromDateStr, toDateStr, dayOfWeekVal, fromTimeStr, toTimeStr, excludeCourseId) => {
  try {
    const teachers = await GET_DB().account.findMany({
      where: {
        Deleted: 0,
        SchoolTeacher: { some: { IdSchool: schoolId, Deleted: 0 } }
      },
      include: {
        AccountWorkingTime: { where: { Deleted: 0 } }
      }
    })

    if (!fromDateStr || !toDateStr || dayOfWeekVal === undefined || !fromTimeStr || !toTimeStr) {
      return teachers
    }

    const fromDate = new Date(fromDateStr)
    const toDate = new Date(toDateStr)
    const dayOfWeek = parseInt(dayOfWeekVal)
    const dbDayOfWeek = dayOfWeek === 0 ? 1 : dayOfWeek

    const sFromParts = fromTimeStr.split(':')
    const targetFrom = parseInt(sFromParts[0]) * 60 + parseInt(sFromParts[1])
    const sToParts = toTimeStr.split(':')
    const targetTo = parseInt(sToParts[0]) * 60 + parseInt(sToParts[1])

    const availableTeachers = []

    const candidateTeachers = teachers.filter(t => {
      const workingTimes = t.AccountWorkingTime.filter(wt => wt.DayOfWeek === dbDayOfWeek)
      if (workingTimes.length === 0) return false

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
      return isAvailable
    })

    if (candidateTeachers.length === 0) {
      return []
    }

    const candidateIds = candidateTeachers.map(t => t.Id)

    const conflicts = await GET_DB().courseScheduleDetail.findMany({
      where: {
        Deleted: 0,
        Status: { not: 2 },
        Date: { gte: fromDate, lte: toDate },
        IdAccountTeacher: { in: candidateIds },
        ...(excludeCourseId ? { IdCourse: { not: excludeCourseId } } : {})
      }
    })

    for (const t of candidateTeachers) {
      let hasConflict = false
      for (const c of conflicts) {
        if (c.IdAccountTeacher !== t.Id) continue

        const momentDay = moment.utc(c.Date).day()
        const confDayOfWeek = momentDay === 0 ? 0 : momentDay + 1
        if (confDayOfWeek !== dayOfWeek) continue

        const cFrom = c.FromTime ? new Date(c.FromTime).getUTCHours() * 60 + new Date(c.FromTime).getUTCMinutes() : 0
        const cTo = c.ToTime ? new Date(c.ToTime).getUTCHours() * 60 + new Date(c.ToTime).getUTCMinutes() : 0

        if (cFrom < targetTo && cTo > targetFrom) {
          hasConflict = true
          break
        }
      }

      if (!hasConflict) {
        availableTeachers.push(t)
      }
    }

    return availableTeachers
  } catch (error) { throw error }
}

const getSchoolStudents = async ({ schoolId, page, limit, search, courseId, status = 'approved', cityId, districtId }) => {
  try {
    const pendingCount = await GET_DB().courseStudent.count({
      where: {
        Deleted: 0,
        IsApprove: 0,
        Course: {
          IdSchool: schoolId,
          Deleted: 0
        }
      }
    })

    if (status === 'pending') {
      const wherePending = {
        Deleted: 0,
        IsApprove: 0,
        Course: {
          IdSchool: schoolId,
          Deleted: 0
        }
      }

      if (courseId) {
        wherePending.IdCourse = courseId
      }

      if (cityId || districtId || search) {
        wherePending.Account = wherePending.Account || {}
        if (search) {
          wherePending.Account.OR = [
            { FullName: { contains: search } },
            { Email: { contains: search } },
            { Phone: { contains: search } },
            { UserName: { contains: search } }
          ]
        }
        if (cityId) {
          wherePending.Account.IdCity = parseInt(cityId)
        }
        if (districtId) {
          wherePending.Account.IdDistrict = parseInt(districtId)
        }
      }

      const [enrollments, total] = await Promise.all([
        GET_DB().courseStudent.findMany({
          where: wherePending,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {
            Created_Date: 'desc'
          },
          include: {
            Account: {
              include: {
                AccountStudent: {
                  where: { Deleted: 0 }
                }
              }
            },
            Course: true
          }
        }),
        GET_DB().courseStudent.count({ where: wherePending })
      ])

      const mappedEnrollments = enrollments.map(enroll => {
        const studentProfile = enroll.Account?.AccountStudent?.[0] || null
        return {
          Id: enroll.Id,
          Created_Date: enroll.Created_Date,
          IsApprove: enroll.IsApprove,
          IdCourse: enroll.IdCourse,
          Account: enroll.Account,
          Course: enroll.Course,
          StudentProfile: studentProfile
        }
      })

      return { students: mappedEnrollments, total, pendingCount }
    }

    // Default: status === 'approved'
    const where = {
      Deleted: 0,
      AccountInRole: {
        some: {
          AccountRole: {
            Name: 'Student'
          }
        }
      },
      CourseStudent: {
        some: {
          Deleted: 0,
          IsApprove: 1, // Only approved course student enrollment
          Course: {
            IdSchool: schoolId,
            Deleted: 0
          }
        }
      }
    }

    if (courseId) {
      where.CourseStudent = {
        some: {
          Deleted: 0,
          IsApprove: 1, // Only approved
          IdCourse: courseId,
          Course: {
            IdSchool: schoolId,
            Deleted: 0
          }
        }
      }
    }

    if (search) {
      where.OR = [
        { FullName: { contains: search } },
        { Email: { contains: search } },
        { Phone: { contains: search } },
        { UserName: { contains: search } }
      ]
    }

    if (cityId) {
      where.IdCity = parseInt(cityId)
    }

    if (districtId) {
      where.IdDistrict = parseInt(districtId)
    }

    const [students, total] = await Promise.all([
      GET_DB().account.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          AccountStudent: {
            where: { Deleted: 0 }
          },
          CourseStudent: {
            where: { Deleted: 0, IsApprove: 1 },
            include: { Course: true }
          }
        },
        orderBy: {
          Created_Date: 'desc'
        }
      }),
      GET_DB().account.count({ where })
    ])

    const mappedStudents = students.map(acc => {
      const studentProfile = acc.AccountStudent?.[0] || null
      return {
        Id: acc.Id,
        Created_Date: acc.Created_Date,
        Account: acc,
        StudentProfile: studentProfile,
        Courses: acc.CourseStudent.map(cs => cs.Course).filter(Boolean)
      }
    })

    return { students: mappedStudents, total, pendingCount }
  } catch (error) {
    throw error
  }
}

const approveStudentEnrollment = async (schoolId, enrollmentId, modifier) => {
  try {
    const enrollment = await GET_DB().courseStudent.findUnique({
      where: { Id: parseInt(enrollmentId) }
    })
    if (!enrollment || enrollment.Deleted === 1) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Ghi danh không tồn tại hoặc đã bị xóa!')
    }

    const course = await GET_DB().course.findFirst({
      where: { Id: enrollment.IdCourse, IdSchool: parseInt(schoolId), Deleted: 0 }
    })
    if (!course) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Khóa học này không thuộc về trường hiện tại!')
    }

    return await GET_DB().$transaction(async (prisma) => {
      const updatedEnrollment = await prisma.courseStudent.update({
        where: { Id: parseInt(enrollmentId) },
        data: {
          IsApprove: 1, // Approved
          ApproveDate: new Date(),
          Modified_By: modifier,
          Modified_Date: new Date()
        }
      })

      if (enrollment.IdAccountStudent) {
        await prisma.account.update({
          where: { Id: enrollment.IdAccountStudent },
          data: { Active: true }
        })
      }

      return updatedEnrollment
    })
  } catch (error) { throw error }
}

const rejectStudentEnrollment = async (schoolId, enrollmentId, modifier) => {
  try {
    const enrollment = await GET_DB().courseStudent.findUnique({
      where: { Id: parseInt(enrollmentId) }
    })
    if (!enrollment || enrollment.Deleted === 1) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Ghi danh không tồn tại hoặc đã bị xóa!')
    }

    const course = await GET_DB().course.findFirst({
      where: { Id: enrollment.IdCourse, IdSchool: parseInt(schoolId), Deleted: 0 }
    })
    if (!course) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Khóa học này không thuộc về trường hiện tại!')
    }

    return await GET_DB().courseStudent.update({
      where: { Id: parseInt(enrollmentId) },
      data: {
        IsApprove: 2, // Rejected
        Modified_By: modifier,
        Modified_Date: new Date()
      }
    })
  } catch (error) { throw error }
}

const createSchoolStudent = async (schoolId, data) => {
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
      address
    } = data

    if (!parentName || !phone || !email || !userName || !studentName || !courseId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu thông tin bắt buộc để tạo học sinh!')
    }

    // Verify course belongs to school
    const course = await GET_DB().course.findFirst({
      where: { Id: courseId, IdSchool: parseInt(schoolId), Deleted: 0 }
    })
    if (!course) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Lớp học không thuộc trường này hoặc đã bị xóa!')
    }

    // Check email conflict
    const existingUser = await GET_DB().account.findFirst({
      where: { Email: email, Deleted: 0 }
    })
    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email phụ huynh đã tồn tại trong hệ thống!')
    }

    // Check userName conflict
    const existingUserName = await GET_DB().account.findFirst({
      where: { UserName: userName, Deleted: 0 }
    })
    if (existingUserName) {
      throw new ApiError(StatusCodes.CONFLICT, 'Tên đăng nhập đã tồn tại trong hệ thống!')
    }

    const { password: hashedPassword, passwordSalt } = securityUtils.hashPassword(password || 'student123')

    return await GET_DB().$transaction(async (prisma) => {
      // Create Account (Parent/User)
      const newAccount = await prisma.account.create({
        data: {
          Id: uuidv4(),
          UserName: userName,
          Email: email,
          Password: hashedPassword,
          PasswordSalt: passwordSalt,
          FullName: parentName,
          Phone: phone,
          Address: address || null,
          IdCity: data.idCity ? parseInt(data.idCity) : null,
          IdDistrict: data.idDistrict ? parseInt(data.idDistrict) : null,
          Active: true,
          Deleted: 0,
          Created_By: 'School Management',
          Created_Date: new Date()
        }
      })

      // Assign Role Student
      const role = await prisma.accountRole.findFirst({
        where: { Name: 'Student', Deleted: 0 }
      })
      if (role) {
        await prisma.accountInRole.create({
          data: {
            IdAccount: newAccount.Id,
            IdAccountRole: role.Id,
            Deleted: 0,
            Created_By: 'School Management',
            Created_Date: new Date()
          }
        })
      }

      // Create AccountStudent (child student)
      const newStudent = await prisma.accountStudent.create({
        data: {
          IdAccount: newAccount.Id,
          Name: studentName,
          BirthDay: studentBirthDay ? new Date(studentBirthDay) : null,
          Gender: studentGender ? parseInt(studentGender) : null,
          Deleted: 0,
          Created_By: 'School Management',
          Created_Date: new Date()
        }
      })

      // Create AccountStudentParent (Parent link info)
      await prisma.accountStudentParent.create({
        data: {
          IdAccountStudent: newStudent.Id,
          Name: parentName,
          FullName: parentName,
          Phone: phone,
          Email: email,
          Address: address || null,
          Deleted: 0,
          Created_By: 'School Management',
          Created_Date: new Date()
        }
      })

      // Enroll student directly as approved
      await prisma.courseStudent.create({
        data: {
          IdCourse: courseId,
          IdAccountStudent: newAccount.Id,
          IsApprove: 1, // Auto-approve
          ApproveDate: new Date(),
          Deleted: 0,
          Created_By: 'School Management',
          Created_Date: new Date()
        }
      })

      return newAccount
    })
  } catch (error) { throw error }
}

const updateSchoolStudent = async (schoolId, accountId, data) => {
  try {
    const {
      parentName,
      phone,
      email,
      studentName,
      studentBirthDay,
      studentGender,
      address,
      password,
      idCity,
      idDistrict
    } = data

    // Verify student exists
    const account = await GET_DB().account.findUnique({
      where: { Id: accountId }
    })
    if (!account || account.Deleted === 1) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Tài khoản học viên không tồn tại!')
    }

    // Check email conflict if changed
    if (email && email !== account.Email) {
      const existingUser = await GET_DB().account.findFirst({
        where: { Email: email, Deleted: 0 }
      })
      if (existingUser) {
        throw new ApiError(StatusCodes.CONFLICT, 'Email phụ huynh đã tồn tại trong hệ thống!')
      }
    }

    return await GET_DB().$transaction(async (prisma) => {
      // Prepare update object for Account
      const accountUpdateData = {
        FullName: parentName,
        Phone: phone,
        Email: email,
        Address: address || null,
        IdCity: idCity ? parseInt(idCity) : null,
        IdDistrict: idDistrict ? parseInt(idDistrict) : null,
        Modified_By: 'School Management',
        Modified_Date: new Date()
      }

      // Hash password if provided
      if (password) {
        const { password: hashedPassword, passwordSalt } = securityUtils.hashPassword(password)
        accountUpdateData.Password = hashedPassword
        accountUpdateData.PasswordSalt = passwordSalt
      }

      // 1. Update Account
      const updatedAccount = await prisma.account.update({
        where: { Id: accountId },
        data: accountUpdateData
      })

      // 2. Update AccountStudent (profile of child)
      const studentProfile = await prisma.accountStudent.findFirst({
        where: { IdAccount: accountId, Deleted: 0 }
      })
      if (studentProfile) {
        await prisma.accountStudent.update({
          where: { Id: studentProfile.Id },
          data: {
            Name: studentName,
            BirthDay: studentBirthDay ? new Date(studentBirthDay) : null,
            Gender: studentGender ? parseInt(studentGender) : null,
            Modified_By: 'School Management',
            Modified_Date: new Date()
          }
        })

        // 3. Update AccountStudentParent (Parent link info)
        const parentLink = await prisma.accountStudentParent.findFirst({
          where: { IdAccountStudent: studentProfile.Id, Deleted: 0 }
        })
        if (parentLink) {
          await prisma.accountStudentParent.update({
            where: { Id: parentLink.Id },
            data: {
              FullName: parentName,
              Name: parentName,
              Phone: phone,
              Email: email,
              Address: address || null,
              Modified_By: 'School Management',
              Modified_Date: new Date()
            }
          })
        }
      }

      return updatedAccount
    })
  } catch (error) { throw error }
}

const deleteSchoolStudent = async (schoolId, accountId) => {
  try {
    const account = await GET_DB().account.findUnique({
      where: { Id: accountId }
    })
    if (!account || account.Deleted === 1) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Tài khoản học viên không tồn tại!')
    }

    return await GET_DB().$transaction(async (prisma) => {
      // 1. Soft delete Account
      await prisma.account.update({
        where: { Id: accountId },
        data: { Deleted: 1 }
      })

      // 2. Soft delete AccountStudent
      const studentProfile = await prisma.accountStudent.findFirst({
        where: { IdAccount: accountId, Deleted: 0 }
      })
      if (studentProfile) {
        await prisma.accountStudent.update({
          where: { Id: studentProfile.Id },
          data: { Deleted: 1 }
        })

        // 3. Soft delete AccountStudentParent
        const parentLink = await prisma.accountStudentParent.findFirst({
          where: { IdAccountStudent: studentProfile.Id, Deleted: 0 }
        })
        if (parentLink) {
          await prisma.accountStudentParent.update({
            where: { Id: parentLink.Id },
            data: { Deleted: 1 }
          })
        }
      }

      // 4. Soft delete CourseStudent (enrollments) under this school
      await prisma.courseStudent.updateMany({
        where: {
          IdAccountStudent: accountId,
          Course: {
            IdSchool: parseInt(schoolId)
          },
          Deleted: 0
        },
        data: {
          Deleted: 1
        }
      })

      return { success: true }
    })
  } catch (error) { throw error }
}

export const schoolService = {
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
