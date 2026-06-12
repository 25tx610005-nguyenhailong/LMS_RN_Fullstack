import { GET_DB } from '~/config/prisma'
import moment from 'moment'

const getSchoolSalaries = async (schoolId, userId, role, monthStr) => {
  try {
    const roleUpper = role?.toUpperCase()
    const targetMonth = monthStr ? moment.utc(monthStr, 'YYYY-MM') : moment.utc()
    const startOfMonth = targetMonth.clone().startOf('month').toDate()
    const endOfMonth = targetMonth.clone().endOf('month').toDate()

    // 1. Get list of teachers in the school
    const teacherQuery = {
      where: {
        Deleted: 0,
        SchoolTeacher: { some: { IdSchool: parseInt(schoolId), Deleted: 0 } }
      },
      include: {
        AccountSalary: { where: { Deleted: 0 } }
      }
    }

    // Access control: Teachers can only view their own salary
    if (roleUpper === 'TEACHER') {
      teacherQuery.where.Id = userId
    }

    const teachers = await GET_DB().account.findMany(teacherQuery)

    // 2. Fetch all salary session records for this school in the month
    const sessionSalaryWhere = {
      IdSchool: parseInt(schoolId),
      Deleted: 0,
      Date: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }

    if (roleUpper === 'TEACHER') {
      sessionSalaryWhere.IdAccount = userId
    }

    const sessionSalaries = await GET_DB().courseScheduleDetailSalary.findMany({
      where: sessionSalaryWhere
    })

    // Fetch Course names in-memory since Course relationship is not defined for CourseScheduleDetailSalary in schema.prisma
    const courseIds = [...new Set(sessionSalaries.map(s => s.IdCourse).filter(Boolean))]
    const courses = await GET_DB().course.findMany({
      where: {
        Id: { in: courseIds }
      },
      select: {
        Id: true,
        Name: true
      }
    })
    const courseMap = new Map(courses.map(c => [c.Id, c.Name]))

    const scheduleDetails = await GET_DB().courseScheduleDetail.findMany({
      where: {
        IdCourse: { in: courseIds },
        Date: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        Deleted: 0
      },
      select: {
        IdCourseSchedule: true,
        Date: true,
        FromTime: true,
        ToTime: true,
        Note: true
      }
    })

    const scheduleDetailMap = new Map()
    scheduleDetails.forEach(sd => {
      if (sd.Date) {
        const dateStr = moment(sd.Date).format('YYYY-MM-DD')
        const key = `${sd.IdCourseSchedule}_${dateStr}`
        scheduleDetailMap.set(key, sd)
      }
    })

    const paymentMethods = await GET_DB().paymentMethod.findMany({ where: { Deleted: 0 } })
    const currencyExchanges = await GET_DB().currencyExchange.findMany({ where: { Deleted: 0 } })
    const exchangeRateMap = new Map(currencyExchanges.map(c => [c.Id, Number(c.ExchangeRate || 1)]))

    // 3. Map salaries for each teacher
    const result = teachers.map(teacher => {
      const tId = teacher.Id
      const salaryConfig = teacher.AccountSalary?.[0] || null

      const teacherSessions = sessionSalaries.filter(s => s.IdAccount === tId)

      let totalMinutes = 0
      let totalPeriods = 0

      const sessionsBreakdown = teacherSessions.map(session => {
        totalMinutes += session.TotalMinutes || 0
        totalPeriods += session.TotalPeriods || 0

        const dateStr = session.Date ? moment(session.Date).format('YYYY-MM-DD') : ''
        const key = `${session.IdCourseSchedule}_${dateStr}`
        const sd = scheduleDetailMap.get(key)

        let timeStr = ''
        if (sd && sd.FromTime && sd.ToTime) {
          timeStr = `${moment(sd.FromTime).format('HH:mm')} - ${moment(sd.ToTime).format('HH:mm')}`
        }

        // Calculate session earnings
        let sessionEarnings = 0
        const typeSalary = session.TypeSalary || 1 // 1: Monthly, 2: Hourly

        if (typeSalary === 2) {
          // Hourly salary
          const hourlyRate = session.SalaryPerHour || 0
          const hours = (session.TotalMinutes || 0) / 60
          sessionEarnings = Number(hourlyRate) * hours
        } else if (typeSalary === 1) {
          // Monthly salary teacher: compute notional earnings for reporting/breakdown
          if (session.SalaryPerHour && Number(session.SalaryPerHour) > 0) {
            const hours = (session.TotalMinutes || 0) / 60
            sessionEarnings = Number(session.SalaryPerHour) * hours
          }
        }

        // Apply exchange rate (convert to VND if required, usually defaults to 1)
        const rate = Number(session.ExchangeRate || 1)
        const finalSessionEarnings = Math.round(sessionEarnings * rate)
        const sessionSalaryPerHour = Math.round(Number(session.SalaryPerHour || 0) * rate)

        return {
          id: session.Id,
          date: session.Date,
          courseName: courseMap.get(session.IdCourse) || 'Khóa học',
          courseCode: session.IdCourse || '',
          role: 'Giáo viên chính',
          duration: session.TotalMinutes || 0,
          periods: session.TotalPeriods || 0,
          typeSalary,
          salaryPerHour: sessionSalaryPerHour,
          earnings: finalSessionEarnings,
          classTime: timeStr,
          note: sd?.Note || ''
        }
      })

      // Calculate exchange rate for this teacher's contract
      const tExchangeRate = exchangeRateMap.get(salaryConfig?.IdMonetaryUnit) || 1

      // Calculate total final monthly salary
      let baseSalary = 0
      let overtimeEarnings = 0
      let sessionsSalarySum = 0
      let typeSalary = salaryConfig?.TypeSalary || 1 // Default to monthly if not configured

      if (typeSalary === 1) {
        // Monthly salary: Base salary is fixed per month, paid only if teacher has sessions in the queried month
        if (teacherSessions.length > 0) {
          baseSalary = Math.round(Number(salaryConfig?.SalaryPerMonth || 0) * tExchangeRate)

          // Calculate overtime hours (hours exceeding WarrantyHours)
          const totalMainHours = totalMinutes / 60
          const warrantyHours = Number(salaryConfig?.WarrantyHours || 0)

          if (totalMainHours > warrantyHours) {
            const overtimeHours = totalMainHours - warrantyHours
            const salaryPerHour = Number(salaryConfig?.SalaryPerHour || 0)
            overtimeEarnings = Math.round(overtimeHours * salaryPerHour * tExchangeRate)
          }
        }
      } else {
        // Hourly salary: Sum of session earnings
        sessionsSalarySum = sessionsBreakdown.reduce((sum, s) => sum + s.earnings, 0)
      }

      const totalEarnings = typeSalary === 1
        ? (baseSalary + overtimeEarnings)
        : sessionsSalarySum
      const method = paymentMethods.find(m => m.Id === salaryConfig?.IdPaymentMethod)

      return {
        teacherId: tId,
        fullName: teacher.FullName,
        userName: teacher.UserName,
        avatar: teacher.LinkAvatar,
        typeSalary, // 1: Monthly, 2: Hourly
        bankAccount: salaryConfig?.NumberAccountBank || null,
        paymentMethod: method ? method.Name : 'Chưa thiết lập',
        baseSalary,
        overtimeEarnings,
        taEarnings: 0,
        warrantyHours: Number(salaryConfig?.WarrantyHours || 0),
        salaryPerHour: Math.round(Number(salaryConfig?.SalaryPerHour || 0) * tExchangeRate),
        totalHours: Number((totalMinutes / 60).toFixed(1)),
        totalPeriods,
        mainTeacherCount: teacherSessions.length,
        taCount: 0,
        totalEarnings,
        sessions: sessionsBreakdown
      }
    })

    return result
  } catch (error) {
    throw error
  }
}

export const salaryService = {
  getSchoolSalaries
}
