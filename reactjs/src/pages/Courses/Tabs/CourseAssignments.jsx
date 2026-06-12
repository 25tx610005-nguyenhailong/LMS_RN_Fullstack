import { useEffect, useState, useCallback, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  IconButton,
  Avatar,
  Checkbox,
  CircularProgress,
  Tooltip,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  InputAdornment,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  InputLabel,
  FormControl,
  Select,
  MenuItem
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import SearchIcon from '@mui/icons-material/Search'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AssignmentIcon from '@mui/icons-material/Assignment'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import GradeIcon from '@mui/icons-material/Grade'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import EditIcon from '@mui/icons-material/Edit'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DescriptionIcon from '@mui/icons-material/Description'
import TableChartIcon from '@mui/icons-material/TableChart'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import ImageIcon from '@mui/icons-material/Image'

import {
  fetchAssignmentsAPI,
  createAssignmentAPI,
  deleteAssignmentAPI,
  submitAssignmentAPI,
  gradeSubmissionAPI,
  updateAssignmentAPI
} from '~/apis/assignmentApi'
import { fetchClassStudentsAPI } from '~/apis/schoolApi'
import { uploadFileAPI, deleteFileAPI } from '~/apis/commonApi'
import { resolveFileUrl } from '~/utils/formatters'
import { toast } from 'react-toastify'
import moment from 'moment'

const GRADIENTS = {
  primary: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  info: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
  glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.5) 100%)'
}

const getFileTypeInfo = (fileName) => {
  const ext = fileName?.split('.').pop()?.toLowerCase()
  switch (ext) {
  case 'pdf':
    return { label: 'PDF', color: '#ef4444', icon: <PictureAsPdfIcon sx={{ fontSize: 16 }} />, bg: alpha('#ef4444', 0.08) }
  case 'doc':
  case 'docx':
    return { label: 'Word', color: '#3b82f6', icon: <DescriptionIcon sx={{ fontSize: 16 }} />, bg: alpha('#3b82f6', 0.08) }
  case 'xls':
  case 'xlsx':
    return { label: 'Excel', color: '#10b981', icon: <TableChartIcon sx={{ fontSize: 16 }} />, bg: alpha('#10b981', 0.08) }
  case 'mp3':
  case 'wav':
  case 'ogg':
  case 'm4a':
    return { label: 'Audio', color: '#ec4899', icon: <AudiotrackIcon sx={{ fontSize: 16 }} />, bg: alpha('#ec4899', 0.08) }
  case 'mp4':
  case 'mov':
  case 'webm':
    return { label: 'Video', color: '#06b6d4', icon: <PlayCircleOutlineIcon sx={{ fontSize: 16 }} />, bg: alpha('#06b6d4', 0.08) }
  case 'png':
  case 'jpg':
  case 'jpeg':
  case 'gif':
    return { label: 'Image', color: '#8b5cf6', icon: <ImageIcon sx={{ fontSize: 16 }} />, bg: alpha('#8b5cf6', 0.08) }
  default:
    return { label: 'File', color: '#64748b', icon: <AttachFileIcon sx={{ fontSize: 16 }} />, bg: alpha('#64748b', 0.08) }
  }
}

function CourseAssignments() {
  const { course } = useOutletContext()
  const courseId = course?.Id
  const currentUser = useSelector(selectCurrentUser)
  const role = currentUser?.role?.toUpperCase() // ADMIN, TEACHER, STUDENT
  const isTeacher = role === 'TEACHER' || role === 'ADMIN'

  // Common State
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'create'
  const [selectedAssignment, setSelectedAssignment] = useState(null) // Detail view for selected assignment

  // Search and Filter States for the list view
  const [listSearch, setListSearch] = useState('')
  const [listTypeFilter, setListTypeFilter] = useState('all') // 'all', 1, 2, 3
  const [listThemeFilter, setListThemeFilter] = useState('all') // 'all' or themeId
  const [submissionFilter, setSubmissionFilter] = useState('all') // 'all', 'unsubmitted', 'ungraded', 'graded'
  const [listDateFilter, setListDateFilter] = useState('') // 'YYYY-MM-DD'

  // State for Teachers - Create Assignment Form
  const [assignmentType, setAssignmentType] = useState(1) // 1: Homework, 2: Test, 3: Practice
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState(moment().format('YYYY-MM-DD'))
  const [dueDate, setDueDate] = useState(moment().add(2, 'days').format('YYYY-MM-DD'))
  const [selectedTheme, setSelectedTheme] = useState('')
  const [selectedLesson, setSelectedLesson] = useState('')

  // Attachment states
  const [uploadingAttachment, setUploadingAttachment] = useState(false)
  const [attachments, setAttachments] = useState([]) // array of { url, name }
  const fileInputRef = useRef(null)

  // Students list for checkbox selection
  const [courseStudents, setCourseStudents] = useState([])
  const [studentSearch, setStudentSearch] = useState('')
  const [selectedStudentIds, setSelectedStudentIds] = useState([]) // list of AccountStudent IDs

  // State for Students - Submission
  const [uploadingSubmission, setUploadingSubmission] = useState(false)
  const [submissionFileUrl, setSubmissionFileUrl] = useState('')
  const [submissionFileName, setSubmissionFileName] = useState('')
  const [submissionNote, setSubmissionNote] = useState('')
  const studentFileInputRef = useRef(null)

  // State for Teachers - Grading Modal
  const [openGradeDialog, setOpenGradeDialog] = useState(false)
  const [gradingCas, setGradingCas] = useState(null) // Selected student record to grade
  const [gradingScore, setGradingScore] = useState('')
  const [gradingFeedback, setGradingFeedback] = useState('')
  const [submittingGrade, setSubmittingGrade] = useState(false)

  // Load Assignments
  const loadAssignments = useCallback(async () => {
    if (!courseId) return
    setLoading(true)
    try {
      const res = await fetchAssignmentsAPI(courseId)
      setAssignments(res || [])
    } catch (error) {
      toast.error('Không thể tải danh sách bài tập')
    } finally {
      setLoading(false)
    }
  }, [courseId])

  // Load students for selection (Teachers only)
  const loadCourseStudents = useCallback(async () => {
    if (!courseId || !isTeacher) return
    try {
      const res = await fetchClassStudentsAPI(courseId, 1, 1000, '', 'present')
      const studentsList = res?.students || res || []
      setCourseStudents(studentsList)
      // Default: select all active students
      setSelectedStudentIds(studentsList.map(s => s.IdAccountStudent || s.Account?.Id))
    } catch {
      // Silently handle student list load failure
    }
  }, [courseId, isTeacher])

  useEffect(() => {
    loadAssignments()
    loadCourseStudents()
  }, [loadAssignments, loadCourseStudents])

  // Curriculum dropdown structures
  const material = course?.CourseMaterial?.[0]?.Material
  const themes = material?.MaterialTheme || []
  const currentLessons = selectedTheme
    ? themes.find(t => t.Id == selectedTheme)?.MaterialLesson || []
    : []

  const getThemeName = (themeId) => {
    if (!themeId) return null
    const theme = themes.find(t => t.Id == themeId)
    return theme ? `${theme.Name}${theme.Title ? ` - ${theme.Title}` : ''}` : null
  }

  const getLessonName = (themeId, lessonId) => {
    if (!lessonId) return null
    const theme = themes.find(t => t.Id == themeId)
    const lesson = theme?.MaterialLesson?.find(l => l.Id == lessonId)
    return lesson ? `${lesson.Name}${lesson.Title ? ` - ${lesson.Title}` : ''}` : null
  }

  const filteredAssignments = assignments.filter(item => {
    const matchesSearch = item.AssignmentTitle?.toLowerCase().includes(listSearch.toLowerCase()) ||
      item.AssignmentDescription?.toLowerCase().includes(listSearch.toLowerCase())
    const matchesType = listTypeFilter === 'all' || item.ExampleType == listTypeFilter
    const matchesTheme = listThemeFilter === 'all' || item.IdTheme == listThemeFilter
    const matchesDate = !listDateFilter || (item.StartDate && moment(item.StartDate).format('YYYY-MM-DD') === listDateFilter)
    return matchesSearch && matchesType && matchesTheme && matchesDate
  })

  // Clean form fields
  const resetForm = () => {
    setAssignmentType(1)
    setTitle('')
    setDescription('')
    setStartDate(moment().format('YYYY-MM-DD'))
    setDueDate(moment().add(2, 'days').format('YYYY-MM-DD'))
    setSelectedTheme('')
    setSelectedLesson('')
    setAttachments([])
    // Default: select all active students
    setSelectedStudentIds(courseStudents.map(s => s.IdAccountStudent || s.Account?.Id))
  }

  // Handle file uploads (Teachers creating assignment)
  const handleAttachmentChange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    setUploadingAttachment(true)
    let uploadSuccessCount = 0
    const newAttachments = [...attachments]

    for (const file of files) {
      try {
        const res = await uploadFileAPI(file, 'assignments')
        newAttachments.push({ url: res.url, name: file.name })
        uploadSuccessCount++
      } catch (error) {
        toast.error(`Tải file ${file.name} thất bại`)
      }
    }

    setAttachments(newAttachments)
    if (uploadSuccessCount > 0) {
      toast.success(`Đã tải lên thành công ${uploadSuccessCount} file!`)
    }
    setUploadingAttachment(false)
    e.target.value = ''
  }

  const handleDeleteAttachment = async (indexToDelete) => {
    const target = attachments[indexToDelete]
    try {
      await deleteFileAPI(target.url)
      setAttachments(prev => prev.filter((_, idx) => idx !== indexToDelete))
      toast.success('Đã xóa tài liệu đính kèm')
    } catch (error) {
      toast.error('Không thể xóa tài liệu')
    }
  }

  // Validate and submit assignment (Teachers only)
  const handleCreateAssignment = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài tập!')
      return
    }
    if (selectedStudentIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một học viên nhận bài!')
      return
    }

    try {
      const data = {
        IdCourse: courseId,
        AssignmentTitle: title,
        AssignmentDescription: description,
        AssignmentFile: attachments.length > 0 ? JSON.stringify(attachments) : null,
        StartDate: new Date(startDate),
        CloseDate: dueDate ? new Date(dueDate + 'T23:59:59') : null,
        IdTheme: selectedTheme || null,
        IdLesson: selectedLesson || null,
        ExampleType: assignmentType,
        studentIds: selectedStudentIds
      }

      await createAssignmentAPI(data)
      toast.success('Đã xác nhận giao bài tập thành công!')
      resetForm()
      setViewMode('list')
      loadAssignments()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tạo bài tập')
    }
  }

  // Soft-delete assignment
  const handleDeleteAssignment = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài tập này không? Học sinh sẽ không thể thấy hoặc nộp bài này nữa.')) return
    try {
      await deleteAssignmentAPI(id)
      toast.success('Đã xóa bài tập thành công')
      if (selectedAssignment?.Id === id) {
        setSelectedAssignment(null)
      }
      loadAssignments()
    } catch (error) {
      toast.error('Không thể xóa bài tập')
    }
  }

  // Bắt đầu chỉnh sửa bài tập đã giao
  const handleStartEditAssignment = (item, e) => {
    e.stopPropagation()
    setSelectedAssignment(item)

    setAssignmentType(item.ExampleType || 1)
    setTitle(item.AssignmentTitle || '')
    setDescription(item.AssignmentDescription || '')
    setStartDate(item.StartDate ? moment(item.StartDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'))
    setDueDate(item.CloseDate ? moment(item.CloseDate).format('YYYY-MM-DD') : '')
    setSelectedTheme(item.IdTheme || '')
    setSelectedLesson(item.IdLesson || '')

    let parsedFiles = []
    if (item.AssignmentFile) {
      if (item.AssignmentFile.startsWith('[')) {
        try {
          parsedFiles = JSON.parse(item.AssignmentFile)
        } catch (err) {
          parsedFiles = [{ url: item.AssignmentFile, name: item.AssignmentFile.split('/').pop() }]
        }
      } else {
        parsedFiles = [{ url: item.AssignmentFile, name: item.AssignmentFile.split('/').pop() }]
      }
    }
    setAttachments(parsedFiles)

    const assignedStudentIds = item.CourseAssignmentStudent?.map(s => s.IdAccountStudent) || []
    setSelectedStudentIds(assignedStudentIds)

    setViewMode('edit')
  }

  // Cập nhật bài tập đã giao
  const handleUpdateAssignment = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài tập!')
      return
    }
    if (selectedStudentIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một học viên nhận bài!')
      return
    }

    try {
      const data = {
        AssignmentTitle: title,
        AssignmentDescription: description,
        AssignmentFile: attachments.length > 0 ? JSON.stringify(attachments) : null,
        StartDate: new Date(startDate),
        CloseDate: dueDate ? new Date(dueDate + 'T23:59:59') : null,
        IdTheme: selectedTheme || null,
        IdLesson: selectedLesson || null,
        ExampleType: assignmentType,
        studentIds: selectedStudentIds
      }

      await updateAssignmentAPI(selectedAssignment.Id, data)
      toast.success('Đã cập nhật bài tập thành công!')
      resetForm()
      setViewMode('list')
      setSelectedAssignment(null)
      loadAssignments()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật bài tập')
    }
  }

  // Handle file uploads (Students submitting homework)
  const handleSubmissionFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingSubmission(true)
    try {
      const res = await uploadFileAPI(file, 'submissions')
      setSubmissionFileUrl(res.url)
      setSubmissionFileName(file.name)
      toast.success('Tải bài làm lên thành công!')
    } catch (error) {
      toast.error('Tải bài làm lên thất bại')
    } finally {
      setUploadingSubmission(false)
    }
  }

  const handleDeleteSubmissionFile = async () => {
    if (!submissionFileUrl) return
    try {
      await deleteFileAPI(submissionFileUrl)
      setSubmissionFileUrl('')
      setSubmissionFileName('')
      toast.success('Đã xóa file bài làm')
    } catch (error) {
      toast.error('Không thể xóa file')
    }
  }

  // Submit homework
  const handleSubmitAssignment = async (assignmentId) => {
    if (!submissionFileUrl) {
      toast.error('Vui lòng tải lên file bài làm!')
      return
    }

    try {
      const data = {
        IdCourse: courseId,
        IdAssignment: assignmentId,
        FileUrl: submissionFileUrl,
        FileName: submissionFileName,
        Note: submissionNote
      }
      await submitAssignmentAPI(data)
      toast.success('Nộp bài thành công!')
      setSubmissionFileUrl('')
      setSubmissionFileName('')
      setSubmissionNote('')
      loadAssignments()
      // Update selected assignment state to reflect new submission
      const updatedRes = await fetchAssignmentsAPI(courseId)
      setAssignments(updatedRes || [])
      const freshSelect = updatedRes.find(a => a.Id === assignmentId)
      setSelectedAssignment(freshSelect)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể nộp bài')
    }
  }

  // Grade dialog
  const handleOpenGrade = (cas) => {
    setGradingCas(cas)
    const existingEvaluation = cas.CourseAssignmentStudentEvaluation?.[0]
    setGradingScore(existingEvaluation ? existingEvaluation.Score : '')
    setGradingFeedback(existingEvaluation ? existingEvaluation.Remake : '')
    setOpenGradeDialog(true)
  }

  const handleSaveGrade = async () => {
    if (gradingScore === '') {
      toast.error('Vui lòng nhập điểm số!')
      return
    }
    const scoreVal = parseFloat(gradingScore)
    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 10) {
      toast.error('Điểm số phải nằm trong khoảng từ 0 đến 10!')
      return
    }

    setSubmittingGrade(true)
    try {
      await gradeSubmissionAPI({
        IdCourseAssignmentStudent: gradingCas.Id,
        Score: scoreVal,
        Remake: gradingFeedback
      })
      toast.success('Đã chấm điểm thành công!')
      setOpenGradeDialog(false)
      loadAssignments()

      // Update selected assignment list to display graded score
      const updatedRes = await fetchAssignmentsAPI(courseId)
      setAssignments(updatedRes || [])
      if (selectedAssignment) {
        const freshSelect = updatedRes.find(a => a.Id === selectedAssignment.Id)
        setSelectedAssignment(freshSelect)
      }
    } catch (error) {
      toast.error('Không thể lưu điểm chấm')
    } finally {
      setSubmittingGrade(false)
    }
  }

  // Filter students by search in Right Column
  const filteredStudents = courseStudents.filter(s => {
    const name = s.Account?.FullName || ''
    const email = s.Account?.Email || ''
    return name.toLowerCase().includes(studentSearch.toLowerCase()) || email.toLowerCase().includes(studentSearch.toLowerCase())
  })

  // Select/deselect single student
  const handleToggleStudent = (studentId) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    )
  }

  // Select/deselect all filtered students
  const handleToggleAllStudents = () => {
    const filteredIds = filteredStudents.map(s => s.IdAccountStudent || s.Account?.Id)
    const allSelected = filteredIds.every(id => selectedStudentIds.includes(id))

    if (allSelected) {
      // Remove all filtered ids
      setSelectedStudentIds(prev => prev.filter(id => !filteredIds.includes(id)))
    } else {
      // Add missing filtered ids
      setSelectedStudentIds(prev => {
        const toAdd = filteredIds.filter(id => !prev.includes(id))
        return [...prev, ...toAdd]
      })
    }
  }

  return (
    <Box sx={{ p: 1, height: '100%', animation: 'fadeIn 0.3s ease' }}>
      {/* HEADER SECTION */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AssignmentIcon color="primary" sx={{ fontSize: 30 }} />
            {isTeacher ? 'Quản lý Bài tập lớp học' : 'Bài tập & Điểm số'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isTeacher
              ? 'Giao bài tập, theo dõi tiến độ nộp bài và chấm điểm học viên lớp học'
              : 'Xem danh sách bài tập được giao, thực hiện nộp bài làm và xem điểm đánh giá'}
          </Typography>
        </Box>

        {isTeacher && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {viewMode === 'list' ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => { setViewMode('create'); setSelectedAssignment(null) }}
                sx={{
                  borderRadius: '16px',
                  px: 3,
                  py: 1.2,
                  fontWeight: 700,
                  textTransform: 'none',
                  background: GRADIENTS.primary,
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd6 0%, #4338ca 100%)',
                    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)'
                  }
                }}
              >
                Giao bài tập mới
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => { setViewMode('list'); resetForm() }}
                sx={{
                  borderRadius: '16px',
                  px: 3,
                  py: 1.2,
                  fontWeight: 700,
                  textTransform: 'none',
                  color: '#475569',
                  borderColor: '#cbd5e1',
                  '&:hover': {
                    borderColor: '#94a3b8',
                    bgcolor: 'rgba(0,0,0,0.02)'
                  }
                }}
              >
                Danh sách bài tập
              </Button>
            )}
          </Box>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 15, gap: 2 }}>
          <CircularProgress size={40} thickness={4} />
          <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>Đang tải bài tập...</Typography>
        </Box>
      ) : (
        <>
          {/* TEACHER - CREATE/EDIT ASSIGNMENT FORM (3-COLUMN LAYOUT) */}
          {(viewMode === 'create' || viewMode === 'edit') && isTeacher && (
            <Grid container spacing={3}>
              {/* TOP ACTIONS PANEL */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: 'white'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: alpha('#6366f1', 0.08), color: '#6366f1' }}>
                      <AssignmentIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {viewMode === 'edit' ? 'Chỉnh sửa bài tập đã giao' : course?.Name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {viewMode === 'edit' ? `Bài tập: ${selectedAssignment?.AssignmentTitle}` : `MÃ LỚP: ${course?.Id} • SĨ SỐ LỚP: ${courseStudents.length} học viên`}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={viewMode === 'edit' ? handleUpdateAssignment : handleCreateAssignment}
                    sx={{
                      borderRadius: '16px',
                      px: 4,
                      py: 1.2,
                      fontWeight: 800,
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                        boxShadow: '0 6px 20px rgba(124, 58, 237, 0.4)'
                      }
                    }}
                  >
                    {viewMode === 'edit' ? 'Cập nhật bài tập' : 'Xác nhận giao bài'}
                  </Button>
                </Paper>
              </Grid>

              {/* COLUMN 1: DETAILED CONTENT */}
              <Grid item xs={12} md={4.5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '24px',
                    border: '1px solid #e2e8f0',
                    bgcolor: 'white',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', borderBottom: '1px solid #f1f5f9', pb: 1.5 }}>
                    {viewMode === 'edit' ? '📝 CHỈNH SỬA BÀI TẬP' : '📝 NỘI DUNG CHI TIẾT'}
                  </Typography>

                  {/* Kiểu bài tập */}
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 1 }}>
                      KIỂU BÀI TẬP
                    </Typography>
                    <Grid container spacing={1}>
                      {[
                        { type: 1, label: 'HOMEWORK', color: '#6366f1' },
                        { type: 2, label: 'TEST', color: '#f59e0b' },
                        { type: 3, label: 'PRACTICE', color: '#10b981' }
                      ].map(item => (
                        <Grid item xs={4} key={item.type}>
                          <Button
                            fullWidth
                            variant={assignmentType === item.type ? 'contained' : 'outlined'}
                            onClick={() => setAssignmentType(item.type)}
                            sx={{
                              borderRadius: '12px',
                              py: 1.2,
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              textTransform: 'none',
                              color: assignmentType === item.type ? 'white' : '#64748b',
                              borderColor: assignmentType === item.type ? item.color : '#e2e8f0',
                              bgcolor: assignmentType === item.type ? item.color : 'white',
                              '&:hover': {
                                bgcolor: assignmentType === item.type ? item.color : alpha(item.color, 0.04),
                                borderColor: item.color
                              }
                            }}
                          >
                            {item.label}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  {/* Tiêu đề */}
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 1 }}>
                      TIÊU ĐỀ BÀI TẬP
                    </Typography>
                    <TextField
                      placeholder="Ví dụ: Writing Task 1 - Line Graph Analysis..."
                      fullWidth
                      size="medium"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          bgcolor: '#f8fafc',
                          '& fieldset': { borderColor: '#e2e8f0' },
                          '&:hover fieldset': { borderColor: '#cbd5e1' },
                          '&.Mui-focused fieldset': { borderColor: '#6366f1' }
                        }
                      }}
                    />
                  </Box>

                  {/* Mô tả */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 1 }}>
                      MÔ TẢ CHI TIẾT BÀI HỌC
                    </Typography>
                    <TextField
                      placeholder="Bắt đầu nhập nội dung bài tập tại đây..."
                      multiline
                      rows={12}
                      fullWidth
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '16px',
                          bgcolor: '#f8fafc',
                          alignItems: 'flex-start',
                          '& fieldset': { borderColor: '#e2e8f0' },
                          '&:hover fieldset': { borderColor: '#cbd5e1' },
                          '&.Mui-focused fieldset': { borderColor: '#6366f1' }
                        }
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* COLUMN 2: ASSIGN CONFIGURATION */}
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '24px',
                    border: '1px solid #e2e8f0',
                    bgcolor: 'white',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', borderBottom: '1px solid #f1f5f9', pb: 1.5 }}>
                    ⚙️ CẤU HÌNH GIAO BÀI
                  </Typography>

                  {/* File đính kèm */}
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 1 }}>
                      TÀI LIỆU ĐÍNH KÈM
                    </Typography>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.mp3,.wav,.ogg,.m4a,.webm,.mp4,.mov"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleAttachmentChange}
                    />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {attachments.map((file, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            p: 1.5,
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            bgcolor: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden', mr: 2 }}>
                            <AttachFileIcon sx={{ color: '#6366f1', fontSize: 18 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1e293b', fontSize: '0.8rem' }}>
                              {file.name}
                            </Typography>
                          </Box>
                          <IconButton size="small" onClick={() => handleDeleteAttachment(idx)} sx={{ color: '#ef4444' }}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}

                      <Box
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                          border: '2px dashed #cbd5e1',
                          borderRadius: '16px',
                          p: 3,
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          bgcolor: '#f8fafc',
                          '&:hover': {
                            borderColor: '#6366f1',
                            bgcolor: 'rgba(99,102,241,0.02)'
                          }
                        }}
                      >
                        {uploadingAttachment ? (
                          <CircularProgress size={24} sx={{ mb: 1 }} />
                        ) : (
                          <CloudUploadIcon sx={{ fontSize: 30, color: '#94a3b8', mb: 0.5 }} />
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.8rem' }}>
                          {uploadingAttachment ? 'ĐANG TẢI LÊN...' : 'BẤM ĐỂ TẢI LÊN FILE'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Hỗ trợ tải lên nhiều file PDF, Word, Excel, Hình ảnh, Audio, Video...
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Ngày bắt đầu */}
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 1 }}>
                      NGÀY BẮT ĐẦU
                    </Typography>
                    <TextField
                      type="date"
                      fullWidth
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonthIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: '12px', bgcolor: '#f8fafc' }
                      }}
                    />
                  </Box>

                  {/* Hạn nộp bài */}
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 1 }}>
                      HẠN NỘP BÀI
                    </Typography>
                    <TextField
                      type="date"
                      fullWidth
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonthIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: '12px', bgcolor: '#f8fafc' }
                      }}
                    />
                  </Box>

                  {/* Chương trình đào tạo: Themes/Lessons */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: -1 }}>
                      CHƯƠNG TRÌNH ĐÀO TẠO
                    </Typography>

                    <FormControl fullWidth size="small">
                      <InputLabel id="select-theme-label">Chọn Theme</InputLabel>
                      <Select
                        labelId="select-theme-label"
                        value={selectedTheme}
                        label="Chọn Theme"
                        onChange={(e) => { setSelectedTheme(e.target.value); setSelectedLesson('') }}
                        sx={{ borderRadius: '12px', bgcolor: '#f8fafc' }}
                      >
                        <MenuItem value="">-- Không chọn --</MenuItem>
                        {themes.map(t => (
                          <MenuItem key={t.Id} value={t.Id}>
                            {t.Name}{t.Title ? ` - ${t.Title}` : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small" disabled={!selectedTheme}>
                      <InputLabel id="select-lesson-label">Chọn Lesson</InputLabel>
                      <Select
                        labelId="select-lesson-label"
                        value={selectedLesson}
                        label="Chọn Lesson"
                        onChange={(e) => setSelectedLesson(e.target.value)}
                        sx={{ borderRadius: '12px', bgcolor: '#f8fafc' }}
                      >
                        <MenuItem value="">-- Không chọn --</MenuItem>
                        {currentLessons.map(l => (
                          <MenuItem key={l.Id} value={l.Id}>
                            {l.Name}{l.Title ? ` - ${l.Title}` : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Paper>
              </Grid>

              {/* COLUMN 3: STUDENT LIST CHECKBOXES */}
              <Grid item xs={12} md={3.5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '24px',
                    border: '1px solid #e2e8f0',
                    bgcolor: 'white',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '630px'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', pb: 1.5, mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b' }}>
                      👥 HỌC VIÊN
                    </Typography>
                    <Button
                      size="small"
                      onClick={handleToggleAllStudents}
                      sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8rem' }}
                    >
                      TẤT CẢ
                    </Button>
                  </Box>

                  {/* Student Search */}
                  <TextField
                    placeholder="Tìm kiếm học viên..."
                    size="small"
                    fullWidth
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '12px', mb: 2, bgcolor: '#f8fafc' }
                    }}
                  />

                  {/* Student Items List */}
                  <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1, pr: 0.5 }}>
                    {filteredStudents.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                        Không có học viên nào khớp
                      </Typography>
                    ) : (
                      filteredStudents.map(item => {
                        const acc = item.Account || {}
                        const studentId = item.IdAccountStudent || acc.Id
                        const isSelected = selectedStudentIds.includes(studentId)
                        const avatarUrl = acc.LinkAvatar || ''
                        const fullName = acc.FullName || 'Chưa cập nhật'
                        const serialChar = fullName.charAt(0).toUpperCase()

                        return (
                          <Box
                            key={item.Id}
                            onClick={() => handleToggleStudent(studentId)}
                            sx={{
                              p: 1.5,
                              borderRadius: '16px',
                              border: isSelected ? '1px solid #6366f1' : '1px solid #e2e8f0',
                              bgcolor: isSelected ? alpha('#6366f1', 0.02) : 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: '#6366f1',
                                bgcolor: alpha('#6366f1', 0.01)
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                              <Avatar
                                src={avatarUrl}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: isSelected ? '#6366f1' : '#cbd5e1',
                                  fontSize: '0.8rem',
                                  fontWeight: 800
                                }}
                              >
                                {serialChar}
                              </Avatar>
                              <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {fullName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  @{acc.UserName || 'student'}
                                </Typography>
                              </Box>
                            </Box>

                            <Checkbox
                              checked={isSelected}
                              checkedIcon={<CheckCircleIcon sx={{ color: '#6366f1' }} />}
                              sx={{ p: 0.5 }}
                            />
                          </Box>
                        )
                      })
                    )}
                  </Box>

                  {/* Summary Footer */}
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: '#f1f5f9',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#475569' }}>
                      ĐÃ CHỌN
                    </Typography>
                    <Chip
                      label={selectedStudentIds.length}
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 800, px: 1, bgcolor: '#6366f1' }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* LIST VIEW (TEACHERS AND STUDENTS COMMON) */}
          {viewMode === 'list' && (
            <Grid container spacing={3}>
              {/* ASSIGNMENTS LIST SIDE (LEFT/FULL CONTAINER) */}
              <Grid item xs={12} md={selectedAssignment ? 5 : 12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '24px',
                    border: '1px solid #e2e8f0',
                    bgcolor: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    minHeight: '400px'
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                    📋 Danh sách bài tập ({filteredAssignments.length})
                  </Typography>

                  {/* FILTER BAR */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, my: 1, p: 2, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <TextField
                      placeholder="Tìm kiếm bài tập..."
                      size="small"
                      value={listSearch}
                      onChange={(e) => setListSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        flex: '1 1 180px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                          bgcolor: 'white',
                          fontSize: '0.8rem',
                          '& fieldset': { borderColor: '#cbd5e1' }
                        }
                      }}
                    />

                    <TextField
                      type="date"
                      label="Ngày giao"
                      size="small"
                      value={listDateFilter}
                      onChange={(e) => setListDateFilter(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        endAdornment: listDateFilter && (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setListDateFilter('')} edge="end" sx={{ mr: 1 }}>
                              <CloseIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: { borderRadius: '10px', bgcolor: 'white', fontSize: '0.8rem', height: '37px' }
                      }}
                      sx={{
                        flex: '1 1 120px',
                        minWidth: 140,
                        '& .MuiInputLabel-root': { fontSize: '0.8rem' }
                      }}
                    />

                    <FormControl size="small" sx={{ minWidth: 110, flex: '1 1 90px' }}>
                      <InputLabel id="type-filter-label" sx={{ fontSize: '0.8rem' }}>Loại bài</InputLabel>
                      <Select
                        labelId="type-filter-label"
                        label="Loại bài"
                        value={listTypeFilter}
                        onChange={(e) => setListTypeFilter(e.target.value)}
                        sx={{ borderRadius: '10px', bgcolor: 'white', fontSize: '0.8rem' }}
                      >
                        <MenuItem value="all">-- tất cả --</MenuItem>
                        <MenuItem value={1}>HOMEWORK</MenuItem>
                        <MenuItem value={2}>TEST</MenuItem>
                        <MenuItem value={3}>PRACTICE</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150, flex: '1 1 120px' }}>
                      <InputLabel id="theme-filter-label" sx={{ fontSize: '0.8rem' }}>Theo chủ đề</InputLabel>
                      <Select
                        labelId="theme-filter-label"
                        label="Theo chủ đề"
                        value={listThemeFilter}
                        onChange={(e) => setListThemeFilter(e.target.value)}
                        sx={{ borderRadius: '10px', bgcolor: 'white', fontSize: '0.8rem' }}
                      >
                        <MenuItem value="all">-- tất cả --</MenuItem>
                        {themes.map(theme => (
                          <MenuItem key={theme.Id} value={theme.Id}>
                            {theme.Name}{theme.Title ? ` - ${theme.Title}` : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {filteredAssignments.length === 0 ? (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                      <AssignmentIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#64748b' }}>
                        Không tìm thấy bài tập nào
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm.
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {filteredAssignments.map(item => {
                        const isSelected = selectedAssignment?.Id === item.Id
                        // Type details
                        const typeInfo =
                          item.ExampleType === 2
                            ? { label: 'TEST', color: '#f59e0b', bg: alpha('#f59e0b', 0.08) }
                            : item.ExampleType === 3
                              ? { label: 'PRACTICE', color: '#10b981', bg: alpha('#10b981', 0.08) }
                              : { label: 'HOMEWORK', color: '#6366f1', bg: alpha('#6366f1', 0.08) }

                        // Calculations for progress (Teachers only)
                        const totalAssigned = item.CourseAssignmentStudent?.length || 0
                        const submittedCount = item.CourseAssignmentStudent?.filter(s => s.CourseAssignmentSubmission?.length > 0).length || 0
                        const gradedCount = item.CourseAssignmentStudent?.filter(s => s.CourseAssignmentStudentEvaluation?.length > 0).length || 0

                        // Student specific details
                        const casRecord = item.CourseAssignmentStudent?.[0]
                        const isSubmitted = casRecord?.CourseAssignmentSubmission?.length > 0
                        const submissionRecord = casRecord?.CourseAssignmentSubmission?.[0]
                        const isGraded = casRecord?.CourseAssignmentStudentEvaluation?.length > 0
                        const score = casRecord?.CourseAssignmentStudentEvaluation?.[0]?.Score

                        let studentStatusBadge = (
                          <Chip label="Chưa nộp" size="small" sx={{ fontWeight: 700, bgcolor: alpha('#f59e0b', 0.1), color: '#d97706' }} />
                        )
                        if (isGraded) {
                          studentStatusBadge = (
                            <Chip label={`Đã chấm: ${score}đ`} size="small" sx={{ fontWeight: 700, bgcolor: alpha('#10b981', 0.1), color: '#059669' }} />
                          )
                        } else if (isSubmitted) {
                          if (submissionRecord?.IsLate) {
                            studentStatusBadge = (
                              <Chip label="Nộp muộn" size="small" sx={{ fontWeight: 700, bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' }} />
                            )
                          } else {
                            studentStatusBadge = (
                              <Chip label="Đã nộp bài" size="small" sx={{ fontWeight: 700, bgcolor: alpha('#0ea5e9', 0.1), color: '#0284c7' }} />
                            )
                          }
                        } else {
                          const isOverdue = item.CloseDate ? new Date() > new Date(item.CloseDate) : false
                          if (isOverdue) {
                            studentStatusBadge = (
                              <Chip label="Quá hạn" size="small" sx={{ fontWeight: 700, bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' }} />
                            )
                          }
                        }

                        return (
                          <Box
                            key={item.Id}
                            onClick={() => setSelectedAssignment(item)}
                            sx={{
                              p: 2.5,
                              borderRadius: '16px',
                              border: '1px solid',
                              borderLeft: `6px solid ${typeInfo.color}`,
                              borderColor: isSelected ? '#6366f1' : '#cbd5e1',
                              bgcolor: isSelected ? 'rgba(99, 102, 241, 0.01)' : 'white',
                              cursor: 'pointer',
                              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              boxShadow: isSelected
                                ? '0 10px 20px -5px rgba(99, 102, 241, 0.12)'
                                : '0 2px 6px rgba(0,0,0,0.02)',
                              '&:hover': {
                                borderColor: '#6366f1',
                                transform: 'translateY(-3px)',
                                boxShadow: '0 12px 24px -8px rgba(99, 102, 241, 0.18)'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflow: 'hidden', mr: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Chip
                                  label={typeInfo.label}
                                  size="small"
                                  sx={{
                                    fontWeight: 800,
                                    fontSize: '0.65rem',
                                    color: typeInfo.color,
                                    bgcolor: typeInfo.bg,
                                    border: `1px solid ${alpha(typeInfo.color, 0.2)}`
                                  }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                  <span>Ngày giao: {item.StartDate ? moment(item.StartDate).format('DD/MM/YYYY') : '--'}</span>
                                  <span style={{ color: '#cbd5e1' }}>|</span>
                                  <span>Hạn nộp: {item.CloseDate ? moment(item.CloseDate).format('DD/MM/YYYY') : 'Không giới hạn'}</span>
                                </Typography>
                              </Box>

                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                {item.AssignmentTitle}
                              </Typography>

                              {(item.IdTheme || item.IdLesson) && (
                                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                                  {item.IdTheme && (
                                    <Chip
                                      label={`Chủ đề: ${getThemeName(item.IdTheme)}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        fontSize: '0.65rem',
                                        height: '20px',
                                        color: '#1e40af',
                                        borderColor: alpha('#3b82f6', 0.2),
                                        bgcolor: alpha('#3b82f6', 0.05),
                                        fontWeight: 600
                                      }}
                                    />
                                  )}
                                  {item.IdLesson && (
                                    <Chip
                                      label={`Bài học: ${getLessonName(item.IdTheme, item.IdLesson)}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        fontSize: '0.65rem',
                                        height: '20px',
                                        color: '#6d28d9',
                                        borderColor: alpha('#8b5cf6', 0.2),
                                        bgcolor: alpha('#8b5cf6', 0.05),
                                        fontWeight: 600
                                      }}
                                    />
                                  )}
                                </Box>
                              )}

                              {isTeacher ? (
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                  Tiến độ nộp bài: <span style={{ color: '#6366f1' }}>{submittedCount}/{totalAssigned}</span> học sinh
                                  {gradedCount > 0 && ` (Đã chấm ${gradedCount})`}
                                </Typography>
                              ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {studentStatusBadge}
                                </Box>
                              )}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {isTeacher && (
                                <>
                                  <Tooltip title="Chỉnh sửa bài tập">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => handleStartEditAssignment(item, e)}
                                      sx={{
                                        color: '#3b82f6',
                                        bgcolor: alpha('#3b82f6', 0.05),
                                        '&:hover': { bgcolor: alpha('#3b82f6', 0.15) }
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Xóa bài tập">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => handleDeleteAssignment(item.Id, e)}
                                      sx={{
                                        color: '#ef4444',
                                        bgcolor: alpha('#ef4444', 0.05),
                                        '&:hover': { bgcolor: alpha('#ef4444', 0.15) }
                                      }}
                                    >
                                      <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                              <IconButton size="small">
                                <ArrowBackIcon sx={{ transform: 'rotate(180deg)', color: '#94a3b8' }} />
                              </IconButton>
                            </Box>
                          </Box>
                        )
                      })}
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* DETAILS SIDE (RIGHT CONTAINER - DISPLAYED ONLY WHEN AN ASSIGNMENT IS SELECTED) */}
              {selectedAssignment && (
                <Grid item xs={12} md={7}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3.5,
                      borderRadius: '24px',
                      border: '1px solid #e2e8f0',
                      bgcolor: 'white',
                      minHeight: '400px',
                      position: 'relative'
                    }}
                  >
                    {/* CLOSE DETAIL VIEW */}
                    <IconButton
                      onClick={() => setSelectedAssignment(null)}
                      sx={{ position: 'absolute', top: 16, right: 16, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>

                    {/* ASSIGNMENT INFO SUMMARY */}
                    <Box sx={{ mb: 4, pr: 5 }}>
                      <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                        CHI TIẾT BÀI TẬP
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.5, mb: 1.5 }}>
                        {selectedAssignment.AssignmentTitle}
                      </Typography>

                      {(selectedAssignment.IdTheme || selectedAssignment.IdLesson) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
                          {selectedAssignment.IdTheme && (
                            <Chip
                              label={`Chủ đề: ${getThemeName(selectedAssignment.IdTheme)}`}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                bgcolor: alpha('#3b82f6', 0.08),
                                color: '#1e40af',
                                border: `1px solid ${alpha('#3b82f6', 0.2)}`,
                                fontSize: '0.75rem'
                              }}
                            />
                          )}
                          {selectedAssignment.IdLesson && (
                            <Chip
                              label={`Bài học: ${getLessonName(selectedAssignment.IdTheme, selectedAssignment.IdLesson)}`}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                bgcolor: alpha('#8b5cf6', 0.08),
                                color: '#6d28d9',
                                border: `1px solid ${alpha('#8b5cf6', 0.2)}`,
                                fontSize: '0.75rem'
                              }}
                            />
                          )}
                        </Box>
                      )}

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 3,
                          mb: 2.5,
                          p: 2,
                          bgcolor: '#f8fafc',
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarMonthIcon sx={{ fontSize: 18, color: '#6366f1' }} />
                          <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                            <strong>Ngày giao:</strong> {selectedAssignment.StartDate ? moment(selectedAssignment.StartDate).format('DD/MM/YYYY') : '--'}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarMonthIcon sx={{ fontSize: 18, color: '#ef4444' }} />
                          <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                            <strong>Hạn nộp:</strong> {selectedAssignment.CloseDate ? moment(selectedAssignment.CloseDate).format('DD/MM/YYYY') : 'Không giới hạn'}
                          </Typography>
                        </Box>
                      </Box>

                      {(() => {
                        if (!selectedAssignment.AssignmentFile) return null
                        let filesList = []
                        if (selectedAssignment.AssignmentFile.startsWith('[')) {
                          try {
                            filesList = JSON.parse(selectedAssignment.AssignmentFile)
                          } catch (e) {
                            filesList = [{ url: selectedAssignment.AssignmentFile, name: selectedAssignment.AssignmentFile.split('/').pop() }]
                          }
                        } else {
                          filesList = [{ url: selectedAssignment.AssignmentFile, name: selectedAssignment.AssignmentFile.split('/').pop() }]
                        }

                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}>
                              <AttachFileIcon sx={{ fontSize: 16, color: '#64748b' }} />
                              ĐÍNH KÈM ({filesList.length}):
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {filesList.map((file, fIdx) => {
                                const fileInfo = getFileTypeInfo(file.name)
                                return (
                                  <Chip
                                    key={fIdx}
                                    icon={fileInfo.icon}
                                    label={file.name}
                                    onClick={() => window.open(resolveFileUrl(file.url), '_blank')}
                                    variant="outlined"
                                    clickable
                                    sx={{
                                      height: '26px',
                                      borderRadius: '6px',
                                      fontWeight: 700,
                                      fontSize: '0.7rem',
                                      color: fileInfo.color,
                                      borderColor: alpha(fileInfo.color, 0.3),
                                      bgcolor: fileInfo.bg,
                                      transition: 'all 0.15s ease-in-out',
                                      maxWidth: '180px',
                                      '& .MuiChip-label': {
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        px: 1
                                      },
                                      '& .MuiChip-icon': {
                                        color: 'inherit',
                                        fontSize: '14px',
                                        ml: 0.8
                                      },
                                      '&:hover': {
                                        bgcolor: alpha(fileInfo.color, 0.12),
                                        borderColor: fileInfo.color,
                                        transform: 'translateY(-1px)',
                                        boxShadow: `0 2px 5px ${alpha(fileInfo.color, 0.08)}`
                                      }
                                    }}
                                    title={file.name}
                                  />
                                )
                              })}
                            </Box>
                          </Box>
                        )
                      })()}

                      {selectedAssignment.AssignmentDescription && (
                        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700 }}>
                            NỘI DUNG MÔ TẢ
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {selectedAssignment.AssignmentDescription}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* TEACHER SUBMISSIONS AND GRADING LIST */}
                    {isTeacher ? (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1.5 }}>
                          📋 Tình trạng nộp bài và chấm điểm của lớp
                        </Typography>

                        {/* Pill filters */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip
                            label="Tất cả"
                            onClick={() => setSubmissionFilter('all')}
                            color={submissionFilter === 'all' ? 'primary' : 'default'}
                            variant={submissionFilter === 'all' ? 'filled' : 'outlined'}
                            size="small"
                            sx={{ borderRadius: '20px', fontWeight: 700 }}
                          />
                          <Chip
                            label="Chưa nộp"
                            onClick={() => setSubmissionFilter('unsubmitted')}
                            color={submissionFilter === 'unsubmitted' ? 'warning' : 'default'}
                            variant={submissionFilter === 'unsubmitted' ? 'filled' : 'outlined'}
                            size="small"
                            sx={{ borderRadius: '20px', fontWeight: 700 }}
                          />
                          <Chip
                            label="Chưa chấm điểm"
                            onClick={() => setSubmissionFilter('ungraded')}
                            color={submissionFilter === 'ungraded' ? 'info' : 'default'}
                            variant={submissionFilter === 'ungraded' ? 'filled' : 'outlined'}
                            size="small"
                            sx={{ borderRadius: '20px', fontWeight: 700 }}
                          />
                          <Chip
                            label="Đã chấm điểm"
                            onClick={() => setSubmissionFilter('graded')}
                            color={submissionFilter === 'graded' ? 'success' : 'default'}
                            variant={submissionFilter === 'graded' ? 'filled' : 'outlined'}
                            size="small"
                            sx={{ borderRadius: '20px', fontWeight: 700 }}
                          />
                        </Box>

                        <TableContainer
                          sx={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '16px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            '&::-webkit-scrollbar': {
                              width: '6px',
                              height: '6px'
                            },
                            '&::-webkit-scrollbar-thumb': {
                              bgcolor: '#cbd5e1',
                              borderRadius: '4px'
                            },
                            '&::-webkit-scrollbar-track': {
                              bgcolor: '#f1f5f9'
                            }
                          }}
                        >
                          <Table
                            size="small"
                            stickyHeader
                            sx={{
                              '& .MuiTableCell-root': {
                                borderRight: '1px solid #e2e8f0',
                                borderBottom: '1px solid #e2e8f0'
                              },
                              '& .MuiTableCell-root:last-child': {
                                borderRight: 'none'
                              }
                            }}
                          >
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 800, color: '#475569', bgcolor: '#f8fafc' }}>Học viên</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#475569', bgcolor: '#f8fafc' }}>Trạng thái</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', bgcolor: '#f8fafc' }}>Điểm</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', bgcolor: '#f8fafc' }}>Thao tác</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(() => {
                                const list = selectedAssignment.CourseAssignmentStudent || []
                                const filteredStudents = list.filter(cas => {
                                  const submission = cas.CourseAssignmentSubmission?.[0]
                                  const evaluation = cas.CourseAssignmentStudentEvaluation?.[0]
                                  const isSub = !!submission
                                  const isGraded = !!evaluation

                                  if (submissionFilter === 'unsubmitted') return !isSub
                                  if (submissionFilter === 'ungraded') return isSub && !isGraded
                                  if (submissionFilter === 'graded') return isGraded
                                  return true
                                })

                                if (filteredStudents.length === 0) {
                                  return (
                                    <TableRow>
                                      <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                        Không có học sinh nào ở trạng thái này.
                                      </TableCell>
                                    </TableRow>
                                  )
                                }

                                return filteredStudents.map(cas => {
                                  const acc = cas.Account || {}
                                  const submission = cas.CourseAssignmentSubmission?.[0]
                                  const evaluation = cas.CourseAssignmentStudentEvaluation?.[0]
                                  const isSub = !!submission
                                  const isGraded = !!evaluation
                                  const fullName = acc.FullName || 'Chưa cập nhật'

                                  return (
                                    <TableRow key={cas.Id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                                      <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                          <Avatar
                                            src={acc.LinkAvatar}
                                            sx={{ width: 28, height: 28, fontSize: '0.75rem', fontWeight: 800, bgcolor: '#6366f1' }}
                                          >
                                            {fullName.charAt(0).toUpperCase()}
                                          </Avatar>
                                          <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                              {fullName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -0.2 }}>
                                              @{acc.UserName || 'student'}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </TableCell>
                                      <TableCell>
                                        {isGraded ? (
                                          <Chip label="Đã chấm điểm" size="small" sx={{ fontWeight: 700, bgcolor: alpha('#10b981', 0.08), color: '#10b981' }} />
                                        ) : isSub ? (
                                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                                            <Chip label="Đã nộp bài" size="small" sx={{ fontWeight: 700, bgcolor: alpha('#0ea5e9', 0.08), color: '#0ea5e9', width: 'fit-content' }} />
                                            {submission.IsLate && (
                                              <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600, display: 'block' }}>
                                                Nộp muộn!
                                              </Typography>
                                            )}
                                          </Box>
                                        ) : (
                                          <Chip label="Chưa nộp" size="small" sx={{ fontWeight: 700, bgcolor: alpha('#ef4444', 0.05), color: '#ef4444' }} />
                                        )}
                                      </TableCell>
                                      <TableCell align="center" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                        {isGraded ? `${evaluation.Score}đ` : '--'}
                                      </TableCell>
                                      <TableCell align="center">
                                        {isSub ? (
                                          <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => handleOpenGrade(cas)}
                                            startIcon={<GradeIcon />}
                                            sx={{
                                              textTransform: 'none',
                                              fontWeight: 700,
                                              borderRadius: '8px',
                                              bgcolor: '#6366f1',
                                              boxShadow: 'none',
                                              '&:hover': { bgcolor: '#4f46e5', boxShadow: 'none' }
                                            }}
                                          >
                                            Chấm điểm
                                          </Button>
                                        ) : (
                                          <Button
                                            variant="outlined"
                                            size="small"
                                            disabled
                                            sx={{ textTransform: 'none', borderRadius: '8px' }}
                                          >
                                            Chờ nộp
                                          </Button>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  )
                                })
                              })()}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    ) : (
                      /* STUDENT DETAILED WORKSPACE & SUBMISSION ZONE */
                      <Box>
                        {(() => {
                          const casRecord = selectedAssignment.CourseAssignmentStudent?.[0]
                          const submission = casRecord?.CourseAssignmentSubmission?.[0]
                          const evaluation = casRecord?.CourseAssignmentStudentEvaluation?.[0]
                          const isSub = !!submission
                          const isGraded = !!evaluation

                          return (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                              {/* EVALUATION/FEEDBACK BLOCK IF GRADED */}
                              {isGraded && (
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2.5,
                                    borderRadius: '16px',
                                    border: '1px solid #10b981',
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(10, 150, 100, 0.02) 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                  }}
                                >
                                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Avatar sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', width: 44, height: 44 }}>
                                      <CheckCircleOutlineIcon />
                                    </Avatar>
                                    <Box>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                        Kết quả đánh giá từ giáo viên
                                      </Typography>
                                      <Typography variant="body2" sx={{ color: '#475569', mt: 0.5 }}>
                                        Nhận xét: {evaluation.Remake || 'Không có nhận xét thêm.'}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  <Box sx={{ textAlign: 'center', pr: 1 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                                      ĐIỂM SỐ
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#10b981' }}>
                                      {evaluation.Score}
                                    </Typography>
                                  </Box>
                                </Paper>
                              )}

                              {/* SUBMISSION HISTORY */}
                              {isSub && (
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2.5,
                                    borderRadius: '16px',
                                    border: '1px dashed #cbd5e1',
                                    bgcolor: '#f8fafc'
                                  }}
                                >
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#475569', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    📂 File bài làm đã nộp
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden', mr: 2 }}>
                                      <AttachFileIcon sx={{ color: '#0ea5e9' }} />
                                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {submission.FileName || 'File bài làm'}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        Nộp ngày: {submission.Created_Date ? moment(submission.Created_Date).format('DD/MM/YYYY HH:mm') : '--'}
                                        {submission.IsLate && (
                                          <Chip
                                            label="Nộp muộn"
                                            size="small"
                                            sx={{
                                              height: '20px',
                                              fontSize: '0.65rem',
                                              fontWeight: 800,
                                              color: '#ef4444',
                                              bgcolor: alpha('#ef4444', 0.08),
                                              border: `1px solid ${alpha('#ef4444', 0.2)}`
                                            }}
                                          />
                                        )}
                                      </Typography>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => window.open(resolveFileUrl(submission.FileUrl), '_blank')}
                                        sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem' }}
                                      >
                                        Tải file
                                      </Button>
                                    </Box>
                                  </Box>
                                </Paper>
                              )}

                              {/* UPLOAD FORM (SHOWN IF NOT GRADED OR IF THEY WANT TO RESUBMIT) */}
                              {!isGraded && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', borderBottom: '1px solid #f1f5f9', pb: 1 }}>
                                    📤 {isSub ? 'Nộp lại bài làm khác' : 'Nộp bài làm mới'}
                                  </Typography>

                                  {selectedAssignment?.CloseDate && new Date() > new Date(selectedAssignment.CloseDate) && (
                                    <Box
                                      sx={{
                                        p: 1.5,
                                        borderRadius: '8px',
                                        bgcolor: alpha('#ef4444', 0.05),
                                        border: `1px solid ${alpha('#ef4444', 0.2)}`,
                                        color: '#ef4444',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                      }}
                                    >
                                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                        ⚠️ Hạn nộp đã qua ({moment(selectedAssignment.CloseDate).format('DD/MM/YYYY HH:mm')}). Bài làm của bạn sẽ bị tính là Nộp muộn!
                                      </Typography>
                                    </Box>
                                  )}

                                  <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.mp3,.wav,.ogg,.m4a,.webm,.mp4,.mov,.zip,.rar"
                                    ref={studentFileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleSubmissionFileChange}
                                  />

                                  {submissionFileUrl ? (
                                    <Box
                                      sx={{
                                        p: 2.5,
                                        borderRadius: '16px',
                                        border: '1px solid #0ea5e9',
                                        bgcolor: alpha('#0ea5e9', 0.02),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                      }}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden', mr: 2 }}>
                                        <AttachFileIcon sx={{ color: '#0ea5e9' }} />
                                        <Typography variant="body2" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1e293b' }}>
                                          {submissionFileName}
                                        </Typography>
                                      </Box>
                                      <IconButton size="small" onClick={handleDeleteSubmissionFile} sx={{ color: '#ef4444' }}>
                                        <CloseIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  ) : (
                                    <Box
                                      onClick={() => studentFileInputRef.current?.click()}
                                      sx={{
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: '16px',
                                        p: 4,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        bgcolor: '#f8fafc',
                                        '&:hover': {
                                          borderColor: '#0ea5e9',
                                          bgcolor: 'rgba(14,165,233,0.02)'
                                        }
                                      }}
                                    >
                                      {uploadingSubmission ? (
                                        <CircularProgress size={24} sx={{ mb: 1 }} />
                                      ) : (
                                        <CloudUploadIcon sx={{ fontSize: 36, color: '#94a3b8', mb: 1 }} />
                                      )}
                                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>
                                        Bấm để chọn file bài làm
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Chọn tài liệu, zip, hình ảnh, tệp âm thanh (mp3, wav, m4a...) hoặc video...
                                      </Typography>
                                    </Box>
                                  )}

                                  <TextField
                                    label="Ghi chú bài làm (tùy chọn)"
                                    placeholder="Viết tin nhắn/ghi chú gửi tới giáo viên..."
                                    multiline
                                    rows={3}
                                    fullWidth
                                    value={submissionNote}
                                    onChange={(e) => setSubmissionNote(e.target.value)}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        bgcolor: '#f8fafc'
                                      }
                                    }}
                                  />

                                  <Button
                                    variant="contained"
                                    onClick={() => handleSubmitAssignment(selectedAssignment.Id)}
                                    sx={{
                                      py: 1.2,
                                      borderRadius: '12px',
                                      fontWeight: 800,
                                      textTransform: 'none',
                                      background: GRADIENTS.info,
                                      boxShadow: '0 4px 10px rgba(14, 165, 233, 0.2)',
                                      '&:hover': {
                                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                        boxShadow: '0 6px 14px rgba(14, 165, 233, 0.3)'
                                      }
                                    }}
                                  >
                                    Xác nhận nộp bài làm
                                  </Button>
                                </Box>
                              )}
                            </Box>
                          )
                        })()}
                      </Box>
                    )}
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </>
      )}

      {/* TEACHER - GRADING DIALOG MODAL */}
      <Dialog
        open={openGradeDialog}
        onClose={() => setOpenGradeDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: 0,
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            animation: 'fadeIn 0.2s ease'
          }
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: 'white',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.15)'
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 1.2, fontSize: '1.1rem' }}>
              <GradeIcon sx={{ color: 'white', fontSize: 22 }} />
              Chấm điểm bài làm học viên
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500, mt: 0.25, fontSize: '0.75rem' }}>
              Nhập điểm số và nhận xét phản hồi cho bài tập của học viên.
            </Typography>
          </Box>
          <IconButton
            onClick={() => setOpenGradeDialog(false)}
            sx={{
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: '#f8fafc', mt: 1 }}>
          {gradingCas && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Student info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <Avatar
                  src={gradingCas.Account?.LinkAvatar}
                  sx={{ width: 44, height: 44, bgcolor: '#6366f1', fontSize: '1rem', fontWeight: 800 }}
                >
                  {(gradingCas.Account?.FullName || 'S').charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b' }}>
                    {gradingCas.Account?.FullName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Email: {gradingCas.Account?.Email || 'Chưa cập nhật'} • SĐT: {gradingCas.Account?.Phone || 'Chưa cập nhật'}
                  </Typography>
                </Box>
              </Box>

              {/* Submitted file */}
              {gradingCas.CourseAssignmentSubmission?.[0] && (
                <Box sx={{ p: 2, bgcolor: '#e0f2fe', borderRadius: '16px', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden', mr: 2 }}>
                    <AttachFileIcon sx={{ color: '#0ea5e9' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0369a1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {gradingCas.CourseAssignmentSubmission[0].FileName || 'File bài nộp'}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => window.open(resolveFileUrl(gradingCas.CourseAssignmentSubmission[0].FileUrl), '_blank')}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      bgcolor: '#0ea5e9',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#0284c7', boxShadow: 'none' }
                    }}
                  >
                    Xem bài làm
                  </Button>
                </Box>
              )}

              {/* Student note */}
              {gradingCas.CourseAssignmentSubmission?.[0]?.Note && (
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    GHI CHÚ CỦA HỌC SINH
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', mt: 0.5, fontStyle: 'italic' }}>
                    &quot;{gradingCas.CourseAssignmentSubmission[0].Note}&quot;
                  </Typography>
                </Box>
              )}

              {/* Score input */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 1 }}>
                  ĐIỂM SỐ (Từ 0 đến 10)
                </Typography>
                <TextField
                  type="number"
                  placeholder="Nhập số điểm..."
                  fullWidth
                  value={gradingScore}
                  onChange={(e) => setGradingScore(e.target.value)}
                  inputProps={{ min: 0, max: 10, step: 0.1 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: 'white'
                    }
                  }}
                />
              </Box>

              {/* Feedback input */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 1 }}>
                  NHẬN XÉT & PHẢN HỒI
                </Typography>
                <TextField
                  placeholder="Viết nhận xét của bạn tại đây..."
                  multiline
                  rows={4}
                  fullWidth
                  value={gradingFeedback}
                  onChange={(e) => setGradingFeedback(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: 'white'
                    }
                  }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#f1f5f9', borderTop: '1px solid #e2e8f0' }}>
          <Button
            onClick={() => setOpenGradeDialog(false)}
            sx={{ textTransform: 'none', fontWeight: 700, color: '#64748b' }}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveGrade}
            disabled={submittingGrade}
            sx={{
              px: 3,
              borderRadius: '10px',
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: '#6366f1',
              '&:hover': { bgcolor: '#4f46e5' }
            }}
          >
            {submittingGrade ? 'Đang lưu...' : 'Lưu kết quả'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CourseAssignments
