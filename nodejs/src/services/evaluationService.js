import { GET_DB } from '~/config/prisma'

const getCourseEvaluations = async (courseId, studentId, role) => {
  try {
    const roleUpper = role?.toUpperCase()

    // 1. Fetch course students
    const studentQuery = {
      where: { IdCourse: courseId, Deleted: 0 },
      include: {
        Account: {
          select: {
            Id: true,
            UserName: true,
            FullName: true,
            LinkAvatar: true
          }
        }
      }
    }

    if (roleUpper === 'STUDENT') {
      studentQuery.where.IdAccountStudent = studentId
    }

    const courseStudents = await GET_DB().courseStudent.findMany(studentQuery)

    // 2. Fetch actual scheduled sessions that have already occurred (Date <= end of today)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const scheduledSessions = await GET_DB().courseScheduleDetail.findMany({
      where: {
        IdCourse: courseId,
        Deleted: 0,
        Date: { lte: todayEnd }
      },
      select: { Date: true }
    })

    const scheduledDates = new Set(
      scheduledSessions.map(s => {
        if (!s.Date) return ''
        return s.Date.toISOString().split('T')[0]
      }).filter(Boolean)
    )

    // 3. Fetch attendance records for the course
    const attendanceRecords = await GET_DB().courseAttendanceStudent.findMany({
      where: { IdCourse: courseId, Deleted: 0 }
    })

    // 4. Fetch homework assignment statuses
    const assignmentStudents = await GET_DB().courseAssignmentStudent.findMany({
      where: {
        Deleted: 0,
        CourseAssignment: { IdCourse: courseId, Deleted: 0 }
      },
      include: {
        CourseAssignmentSubmission: {
          where: { Deleted: 0 }
        },
        CourseAssignmentStudentEvaluation: {
          where: { Deleted: 0 }
        }
      }
    })

    // 5. Fetch evaluations stored in db
    const evalQuery = {
      where: { IdCourse: courseId, Deleted: 0 }
    }
    if (roleUpper === 'STUDENT') {
      evalQuery.where.IdAccountStudent = studentId
    }
    const dbEvaluations = await GET_DB().courseStudentEvaluation.findMany(evalQuery)

    // 6. Map statistics and evaluation data
    const result = courseStudents.map(cs => {
      const sId = cs.IdAccountStudent
      const studentInfo = cs.Account || { Id: sId, FullName: 'Học viên', UserName: '' }

      // Attendance calculation (only counting records that match scheduled dates)
      const studentAttendance = attendanceRecords.filter(a => {
        if (a.IdAccountStudent !== sId || !a.StartDate) return false
        const dateKey = a.StartDate.toISOString().split('T')[0]
        return scheduledDates.has(dateKey)
      })
      const totalAttendance = studentAttendance.length
      const presentAttendance = studentAttendance.filter(a => a.Status === 1).length
      const attendanceRate = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 0

      // Homework metrics calculation
      const studentAssignments = assignmentStudents.filter(sa => sa.IdAccountStudent === sId)
      const totalAssigned = studentAssignments.length
      const totalSubmitted = studentAssignments.filter(sa => sa.CourseAssignmentSubmission.length > 0).length
      const submissionRate = totalAssigned > 0 ? Math.round((totalSubmitted / totalAssigned) * 100) : 0

      const scores = studentAssignments
        .map(sa => sa.CourseAssignmentStudentEvaluation?.[0]?.Score)
        .filter(val => val !== undefined && val !== null)
      const averageScore = scores.length > 0 ? Number((scores.reduce((sum, v) => sum + v, 0) / scores.length).toFixed(1)) : 0

      // Retrieve db evaluation
      const evaluation = dbEvaluations.find(e => e.IdAccountStudent === sId) || null

      return {
        studentId: sId,
        fullName: studentInfo.FullName,
        userName: studentInfo.UserName,
        avatar: studentInfo.LinkAvatar,
        attendanceRate,
        submissionRate,
        averageScore,
        evaluation: evaluation ? {
          id: evaluation.Id,
          attendanceScore: evaluation.AttendanceScore,
          academicScore: evaluation.AcademicScore,
          behaviorScore: evaluation.BehaviorScore,
          comment: evaluation.Comment,
          updatedAt: evaluation.Modified_Date || evaluation.Created_Date,
          createdBy: evaluation.Created_By
        } : null
      }
    })

    return result
  } catch (error) {
    throw error
  }
}

const saveEvaluation = async (courseId, studentId, data, creatorName) => {
  try {
    const existing = await GET_DB().courseStudentEvaluation.findFirst({
      where: { IdCourse: courseId, IdAccountStudent: studentId, Deleted: 0 }
    })

    if (existing) {
      return await GET_DB().courseStudentEvaluation.update({
        where: { Id: existing.Id },
        data: {
          AttendanceScore: data.attendanceScore !== undefined ? parseFloat(data.attendanceScore) : undefined,
          AcademicScore: data.academicScore !== undefined ? parseFloat(data.academicScore) : undefined,
          BehaviorScore: data.behaviorScore !== undefined ? parseFloat(data.behaviorScore) : undefined,
          Comment: data.comment !== undefined ? data.comment : undefined,
          Modified_By: creatorName,
          Modified_Date: new Date()
        }
      })
    } else {
      return await GET_DB().courseStudentEvaluation.create({
        data: {
          IdCourse: courseId,
          IdAccountStudent: studentId,
          AttendanceScore: data.attendanceScore !== undefined ? parseFloat(data.attendanceScore) : null,
          AcademicScore: data.academicScore !== undefined ? parseFloat(data.academicScore) : null,
          BehaviorScore: data.behaviorScore !== undefined ? parseFloat(data.behaviorScore) : null,
          Comment: data.comment || '',
          Created_By: creatorName,
          Created_Date: new Date(),
          Deleted: 0
        }
      })
    }
  } catch (error) {
    throw error
  }
}

export const evaluationService = {
  getCourseEvaluations,
  saveEvaluation
}
