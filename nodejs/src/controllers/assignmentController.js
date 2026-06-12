import { StatusCodes } from 'http-status-codes'
import { assignmentService } from '~/services/assignmentService'

const getCourseAssignments = async (req, res, next) => {
  try {
    const courseId = req.params.courseId
    const studentId = req.jwtDecoded.id // Lấy từ token sau khi qua authMiddleware
    const role = req.jwtDecoded.role // Lấy từ token sau khi qua authMiddleware
    const assignments = await assignmentService.getCourseAssignments(courseId, studentId, role)
    res.status(StatusCodes.OK).json(assignments)
  } catch (error) { next(error) }
}

const createAssignment = async (req, res, next) => {
  try {
    const creatorId = req.jwtDecoded.id
    const assignment = await assignmentService.createAssignment(req.body, creatorId)
    res.status(StatusCodes.CREATED).json(assignment)
  } catch (error) { next(error) }
}

const deleteAssignment = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded.id
    const result = await assignmentService.deleteAssignment(req.params.assignmentId, userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const updateAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params
    const userId = req.jwtDecoded.id
    const updated = await assignmentService.updateAssignment(assignmentId, req.body, userId)
    res.status(StatusCodes.OK).json(updated)
  } catch (error) { next(error) }
}

const gradeSubmission = async (req, res, next) => {
  try {
    const graderId = req.jwtDecoded.id
    const result = await assignmentService.gradeSubmission(req.body, graderId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const submitAssignment = async (req, res, next) => {
  try {
    const studentId = req.jwtDecoded.id
    const result = await assignmentService.submitAssignment({
      ...req.body,
      IdAccountStudent: studentId
    })
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) { next(error) }
}

export const assignmentController = {
  getCourseAssignments,
  createAssignment,
  deleteAssignment,
  updateAssignment,
  gradeSubmission,
  submitAssignment
}
