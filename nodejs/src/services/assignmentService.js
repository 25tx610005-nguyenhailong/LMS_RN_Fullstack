import { GET_DB } from '~/config/prisma'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

/**
 * Lấy danh sách bài tập của khóa học kèm trạng thái nộp bài và chấm điểm tương ứng với vai trò
 */
const getCourseAssignments = async (courseId, studentId, role) => {
  try {
    const isStudent = role?.toUpperCase() === 'STUDENT'
    const assignments = await GET_DB().courseAssignment.findMany({
      where: { IdCourse: courseId, Deleted: 0 },
      include: {
        CourseAssignmentStudent: {
          where: isStudent ? { IdAccountStudent: studentId, Deleted: 0 } : { Deleted: 0 },
          include: {
            CourseAssignmentSubmission: {
              where: { Deleted: 0 },
              orderBy: { Created_Date: 'desc' }
            },
            CourseAssignmentStudentEvaluation: {
              where: { Deleted: 0 }
            }
          }
        }
      },
      orderBy: { Created_Date: 'desc' }
    })

    // Fetch accounts in memory because CourseAssignmentStudent has no explicit relation to Account in schema.prisma
    const studentIds = [
      ...new Set(
        assignments.flatMap((a) =>
          a.CourseAssignmentStudent.map((cas) => cas.IdAccountStudent)
        )
      )
    ].filter(Boolean)

    if (studentIds.length > 0) {
      const accounts = await GET_DB().account.findMany({
        where: { Id: { in: studentIds } },
        select: {
          Id: true,
          FullName: true,
          UserName: true,
          Email: true,
          Phone: true,
          LinkAvatar: true
        }
      })
      const accountMap = new Map(accounts.map((acc) => [acc.Id, acc]))
      for (const assignment of assignments) {
        for (const cas of assignment.CourseAssignmentStudent) {
          cas.Account = accountMap.get(cas.IdAccountStudent) || null
        }
      }
    } else {
      for (const assignment of assignments) {
        for (const cas of assignment.CourseAssignmentStudent) {
          cas.Account = null
        }
      }
    }

    return assignments
  } catch (error) { throw error }
}

/**
 * Tạo bài tập mới và gán cho các học sinh được chọn (hoặc tất cả học sinh đang học trong lớp)
 */
const createAssignment = async (data, creatorId) => {
  try {
    const assignment = await GET_DB().courseAssignment.create({
      data: {
        IdCourse: data.IdCourse,
        AssignmentTitle: data.AssignmentTitle,
        AssignmentDescription: data.AssignmentDescription || '',
        AssignmentFile: data.AssignmentFile || null,
        StartDate: data.StartDate ? new Date(data.StartDate) : new Date(),
        CloseDate: data.CloseDate ? new Date(data.CloseDate) : null,
        IdTheme: data.IdTheme ? parseInt(data.IdTheme, 10) : null,
        IdLesson: data.IdLesson ? parseInt(data.IdLesson, 10) : null,
        ExampleType: data.ExampleType ? parseInt(data.ExampleType, 10) : 1, // 1: Homework, 2: Test, 3: Practice
        Deleted: 0,
        Created_By: creatorId,
        Created_Date: new Date()
      }
    })

    let studentIds = data.studentIds || []
    if (studentIds.length === 0) {
      // Nếu không chọn học sinh nào, mặc định giao cho tất cả học sinh đang học trong lớp
      const courseStudents = await GET_DB().courseStudent.findMany({
        where: {
          IdCourse: data.IdCourse,
          Deleted: 0,
          IsApprove: 1
        },
        include: {
          CourseStudentStatus: {
            where: { Deleted: 0 },
            orderBy: { Created_Date: 'desc' },
            take: 1
          }
        }
      })

      studentIds = courseStudents
        .filter(cs => {
          const latestStatus = cs.CourseStudentStatus?.[0]
          return latestStatus ? latestStatus.Status === 1 : true // Mặc định là 1 (Có mặt)
        })
        .map(cs => cs.IdAccountStudent)
    }

    if (studentIds.length > 0) {
      const assignmentStudentsData = studentIds.map(studentId => ({
        IdAssignment: assignment.Id,
        IdAccountStudent: studentId,
        IsAsign: 1,
        Deleted: 0,
        Created_By: creatorId,
        Created_Date: new Date()
      }))

      await GET_DB().courseAssignmentStudent.createMany({
        data: assignmentStudentsData
      })
    }

    return assignment
  } catch (error) { throw error }
}

/**
 * Xóa bài tập (Soft delete)
 */
const deleteAssignment = async (assignmentId, userId) => {
  try {
    const id = parseInt(assignmentId, 10)

    // Kiểm tra xem bài tập có tồn tại hay không
    const assignment = await GET_DB().courseAssignment.findUnique({
      where: { Id: id }
    })
    if (!assignment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Assignment not found!')
    }

    // Soft delete assignment
    await GET_DB().courseAssignment.update({
      where: { Id: id },
      data: {
        Deleted: 1,
        Modified_By: userId,
        Modified_Date: new Date()
      }
    })

    // Soft delete assignments of student
    await GET_DB().courseAssignmentStudent.updateMany({
      where: { IdAssignment: id, Deleted: 0 },
      data: {
        Deleted: 1,
        Modified_By: userId,
        Modified_Date: new Date()
      }
    })

    return { message: 'Assignment deleted successfully' }
  } catch (error) { throw error }
}

/**
 * Chấm điểm bài làm của học sinh
 */
const gradeSubmission = async (data, graderId) => {
  try {
    const { IdCourseAssignmentStudent, Score, Remake } = data

    // Kiểm tra đánh giá cũ
    const existingEvaluation = await GET_DB().courseAssignmentStudentEvaluation.findFirst({
      where: {
        IdCourseAssignmentStudent: parseInt(IdCourseAssignmentStudent, 10),
        Deleted: 0
      }
    })

    let evaluation
    if (existingEvaluation) {
      // Cập nhật
      evaluation = await GET_DB().courseAssignmentStudentEvaluation.update({
        where: { Id: existingEvaluation.Id },
        data: {
          Score: Score !== undefined && Score !== null ? parseFloat(Score) : null,
          Remake: Remake || '',
          Modified_By: graderId,
          Modified_Date: new Date()
        }
      })
    } else {
      // Tạo mới
      const cas = await GET_DB().courseAssignmentStudent.findUnique({
        where: { Id: parseInt(IdCourseAssignmentStudent, 10) }
      })
      if (!cas) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Student assignment record not found!')
      }

      evaluation = await GET_DB().courseAssignmentStudentEvaluation.create({
        data: {
          IdCourseAssignmentStudent: parseInt(IdCourseAssignmentStudent, 10),
          IdAccountStudent: cas.IdAccountStudent,
          Score: Score !== undefined && Score !== null ? parseFloat(Score) : null,
          Remake: Remake || '',
          Deleted: 0,
          Created_By: graderId,
          Created_Date: new Date()
        }
      })
    }

    return evaluation
  } catch (error) { throw error }
}

/**
 * Nộp bài tập
 */
const submitAssignment = async (data) => {
  try {
    // Logic: Kiểm tra xem học sinh có được gán bài tập này không
    const assignmentStudent = await GET_DB().courseAssignmentStudent.findFirst({
      where: {
        IdAssignment: data.IdAssignment,
        IdAccountStudent: data.IdAccountStudent,
        Deleted: 0
      }
    })

    if (!assignmentStudent) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You are not assigned to this assignment!')
    }

    // Soft-delete toàn bộ bài nộp cũ của học sinh này đối với bài tập này
    await GET_DB().courseAssignmentSubmission.updateMany({
      where: {
        IdCourseAssignmentStudent: assignmentStudent.Id,
        Deleted: 0
      },
      data: {
        Deleted: 1,
        Modified_By: data.IdAccountStudent,
        Modified_Date: new Date()
      }
    })

    // Lấy bài tập để xem có bị nộp muộn (sau hạn nộp) hay không
    const assignment = await GET_DB().courseAssignment.findUnique({
      where: { Id: data.IdAssignment }
    })
    const isLate = assignment?.CloseDate ? new Date() > new Date(assignment.CloseDate) : false

    // Tạo bản ghi nộp bài mới
    const submission = await GET_DB().courseAssignmentSubmission.create({
      data: {
        IdCourse: data.IdCourse,
        IdCourseAssignmentStudent: assignmentStudent.Id,
        IdAccountStudent: data.IdAccountStudent,
        FileUrl: data.FileUrl,
        FileName: data.FileName,
        IsLate: isLate,
        Deleted: 0,
        Created_By: data.IdAccountStudent,
        Created_Date: new Date()
      }
    })

    return submission
  } catch (error) { throw error }
}

/**
 * Cập nhật bài tập và tự động tính toán lại trạng thái nộp trễ của học viên
 */
const updateAssignment = async (assignmentId, data, userId) => {
  try {
    const id = parseInt(assignmentId, 10)
    const existingAssignment = await GET_DB().courseAssignment.findUnique({
      where: { Id: id }
    })
    if (!existingAssignment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Assignment not found!')
    }

    const newCloseDate = data.CloseDate ? new Date(data.CloseDate) : null

    const updated = await GET_DB().$transaction(async (prisma) => {
      // 1. Cập nhật thông tin bài tập cơ bản
      const assignment = await prisma.courseAssignment.update({
        where: { Id: id },
        data: {
          AssignmentTitle: data.AssignmentTitle,
          AssignmentDescription: data.AssignmentDescription || '',
          AssignmentFile: data.AssignmentFile !== undefined ? data.AssignmentFile : existingAssignment.AssignmentFile,
          StartDate: data.StartDate ? new Date(data.StartDate) : existingAssignment.StartDate,
          CloseDate: newCloseDate,
          IdTheme: data.IdTheme ? parseInt(data.IdTheme, 10) : null,
          IdLesson: data.IdLesson ? parseInt(data.IdLesson, 10) : null,
          ExampleType: data.ExampleType ? parseInt(data.ExampleType, 10) : existingAssignment.ExampleType,
          Modified_By: userId,
          Modified_Date: new Date()
        }
      })

      // 2. Cập nhật danh sách học sinh nhận bài tập nếu được truyền lên
      if (data.studentIds) {
        const newStudentIds = data.studentIds.map(String)

        // Xóa mềm các học sinh không còn được chọn nhận bài
        await prisma.courseAssignmentStudent.updateMany({
          where: {
            IdAssignment: id,
            IdAccountStudent: { notIn: newStudentIds },
            Deleted: 0
          },
          data: {
            Deleted: 1,
            Modified_By: userId,
            Modified_Date: new Date()
          }
        })

        // Lấy danh sách học sinh hiện tại đang được giao bài để so sánh
        const existingCas = await prisma.courseAssignmentStudent.findMany({
          where: { IdAssignment: id, Deleted: 0 }
        })
        const existingStudentIds = existingCas.map(c => String(c.IdAccountStudent))
        const studentsToCreate = newStudentIds.filter(sId => !existingStudentIds.includes(sId))

        // Giao bài tập cho những học sinh mới
        if (studentsToCreate.length > 0) {
          await prisma.courseAssignmentStudent.createMany({
            data: studentsToCreate.map(sId => ({
              IdAssignment: id,
              IdAccountStudent: sId,
              IsAsign: 1,
              Deleted: 0,
              Created_By: userId,
              Created_Date: new Date()
            }))
          })
        }
      }

      // 3. Cập nhật trạng thái nộp muộn (IsLate) của học sinh dựa trên hạn nộp mới (CloseDate)
      const casRecords = await prisma.courseAssignmentStudent.findMany({
        where: { IdAssignment: id, Deleted: 0 }
      })
      const casIds = casRecords.map(r => r.Id)

      if (casIds.length > 0) {
        const submissions = await prisma.courseAssignmentSubmission.findMany({
          where: { IdCourseAssignmentStudent: { in: casIds }, Deleted: 0 }
        })

        for (const sub of submissions) {
          const isLate = newCloseDate ? new Date(sub.Created_Date) > newCloseDate : false
          if (sub.IsLate !== isLate) {
            await prisma.courseAssignmentSubmission.update({
              where: { Id: sub.Id },
              data: { IsLate: isLate }
            })
          }
        }
      }

      return assignment
    })

    return updated
  } catch (error) { throw error }
}

export const assignmentService = {
  getCourseAssignments,
  createAssignment,
  deleteAssignment,
  updateAssignment,
  gradeSubmission,
  submitAssignment
}
