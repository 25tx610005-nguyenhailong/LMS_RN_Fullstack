import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Rating,
  Button,
  TextField,
  Divider,
  Stack,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  alpha,
  Card,
  CardContent,
  Chip,
  InputAdornment
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import StarIcon from '@mui/icons-material/Star'
import SaveIcon from '@mui/icons-material/Save'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AssignmentIcon from '@mui/icons-material/Assignment'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import RateReviewIcon from '@mui/icons-material/RateReview'
import SchoolIcon from '@mui/icons-material/School'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import RefreshIcon from '@mui/icons-material/Refresh'
import MessageIcon from '@mui/icons-material/Message'
import { fetchCourseEvaluationsAPI, saveStudentEvaluationAPI } from '~/apis/evaluationApi'
import { toast } from 'react-toastify'
import { resolveFileUrl } from '~/utils/formatters'

// Quick comment templates for teachers
const COMMENT_TEMPLATES = [
  'Học lực tốt, tiếp thu bài nhanh và hăng hái phát biểu.',
  'Có tiến bộ rõ rệt, cần rèn luyện thêm kỹ năng làm bài tập về nhà.',
  'Đi học đầy đủ, đúng giờ, thái độ học tập rất nghiêm túc.',
  'Làm bài tập đầy đủ, kết quả thi tốt, cần phát huy hơn nữa.',
  'Học tập có tư duy, làm bài xuất sắc, đạt kết quả cao.',
  'Chú ý nghe giảng, tuy nhiên đôi lúc còn chưa tập trung làm bài tập.',
  'Cần cố gắng nhiều hơn ở phần làm bài tập về nhà và ôn tập kiến thức cũ.'
]

function CourseEvaluation() {
  const { id: courseId } = useParams()
  const currentUser = useSelector(selectCurrentUser)
  const role = currentUser?.role?.toUpperCase() // ADMIN, TEACHER, STUDENT
  const isTeacher = role === 'TEACHER' || role === 'ADMIN'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [evaluations, setEvaluations] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Search state for teacher
  const [searchQuery, setSearchQuery] = useState('')

  // Form states
  const [attendanceScore, setAttendanceScore] = useState(5)
  const [academicScore, setAcademicScore] = useState(5)
  const [behaviorScore, setBehaviorScore] = useState(5)
  const [comment, setComment] = useState('')

  const loadEvaluations = useCallback(async () => {
    if (!courseId) return
    setLoading(true)
    try {
      const data = await fetchCourseEvaluationsAPI(courseId)
      setEvaluations(data || [])

      if (isTeacher && data && data.length > 0) {
        // Find existing selection or default to first student
        const currentSelectionId = selectedStudent?.studentId
        const newSelection = data.find(s => s.studentId === currentSelectionId) || data[0]
        handleSelectStudent(newSelection)
      } else if (!isTeacher && data && data.length > 0) {
        // Student view: single evaluation
        setSelectedStudent(data[0])
      }
    } catch (error) {
      toast.error('Không thể tải thông tin đánh giá học sinh!')
    } finally {
      setLoading(false)
    }
  }, [courseId, isTeacher, selectedStudent?.studentId])

  useEffect(() => {
    loadEvaluations()
  }, [courseId, loadEvaluations])

  const handleSelectStudent = (student) => {
    setSelectedStudent(student)
    if (student.evaluation) {
      setAttendanceScore(student.evaluation.attendanceScore || 5)
      setAcademicScore(student.evaluation.academicScore || 5)
      setBehaviorScore(student.evaluation.behaviorScore || 5)
      setComment(student.evaluation.comment || '')
    } else {
      setAttendanceScore(5)
      setAcademicScore(5)
      setBehaviorScore(5)
      setComment('')
    }
  }

  const handleSaveEvaluation = async () => {
    if (!selectedStudent || !courseId) return
    setSaving(true)
    try {
      await saveStudentEvaluationAPI(courseId, {
        studentId: selectedStudent.studentId,
        attendanceScore,
        academicScore,
        behaviorScore,
        comment
      })
      toast.success(`Đã cập nhật đánh giá cho học viên ${selectedStudent.fullName}`)
      await loadEvaluations()
    } catch (error) {
      toast.error('Gặp lỗi khi lưu đánh giá học sinh!')
    } finally {
      setSaving(false)
    }
  }

  const handleApplyTemplate = (templateText) => {
    setComment(prev => prev ? `${prev} ${templateText}` : templateText)
  }

  // Filter students based on search query
  const filteredEvaluations = evaluations.filter(item =>
    item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.userName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading && evaluations.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress size={40} sx={{ color: '#6366f1' }} />
      </Box>
    )
  }

  // ────────────────────────────────────────────────────────────────────────
  // TEACHER / ADMIN VIEW
  // ────────────────────────────────────────────────────────────────────────
  if (isTeacher) {
    return (
      <Box sx={{ pb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b' }}>
            Đánh giá học sinh lớp học
          </Typography>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={loadEvaluations}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
          >
            Làm mới
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {/* LEFT COLUMN: Student List */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: '20px', height: 'calc(100vh - 220px)', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
              <TextField
                placeholder="Tìm học sinh..."
                size="small"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  )
                }}
              />
              <Divider sx={{ mb: 1 }} />
              <List sx={{ flexGrow: 1, overflowY: 'auto', px: 1 }}>
                {filteredEvaluations.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                    Không tìm thấy học viên nào.
                  </Typography>
                ) : (
                  filteredEvaluations.map((item) => {
                    const isSelected = selectedStudent?.studentId === item.studentId
                    const isEvaluated = !!item.evaluation
                    return (
                      <ListItem
                        key={item.studentId}
                        button
                        onClick={() => handleSelectStudent(item)}
                        sx={{
                          mb: 1,
                          borderRadius: '12px',
                          bgcolor: isSelected ? alpha('#6366f1', 0.08) : 'transparent',
                          border: isSelected ? '1px solid #6366f1' : '1px solid #f1f5f9',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: isSelected ? alpha('#6366f1', 0.12) : '#f8fafc',
                            borderColor: isSelected ? '#6366f1' : '#e2e8f0'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={resolveFileUrl(item.avatar)}
                            alt={item.fullName}
                            sx={{
                              width: 40,
                              height: 40,
                              border: '2px solid #e2e8f0',
                              bgcolor: '#6366f1',
                              fontSize: '1rem',
                              fontWeight: 800
                            }}
                          >
                            {item.fullName?.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                              {item.fullName}
                            </Typography>
                          }
                          secondary={
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                              <Chip
                                label={`CĐ: ${item.attendanceRate}%`}
                                size="small"
                                sx={{
                                  height: '18px',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  bgcolor: item.attendanceRate >= 80 ? '#ecfdf5' : '#fef2f2',
                                  color: item.attendanceRate >= 80 ? '#059669' : '#dc2626'
                                }}
                              />
                              <Chip
                                label={`Bài: ${item.averageScore}đ`}
                                size="small"
                                sx={{
                                  height: '18px',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  bgcolor: item.averageScore >= 8 ? '#f5f3ff' : '#fffbeb',
                                  color: item.averageScore >= 8 ? '#7c3aed' : '#d97706'
                                }}
                              />
                            </Stack>
                          }
                        />
                        {isEvaluated && (
                          <Chip
                            label="Đã đánh giá"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '9px', fontWeight: 800, ml: 1 }}
                          />
                        )}
                      </ListItem>
                    )
                  })
                )}
              </List>
            </Paper>
          </Grid>

          {/* RIGHT COLUMN: Details & Edit Evaluation */}
          <Grid item xs={12} md={8}>
            {selectedStudent ? (
              <Stack spacing={3}>
                {/* Visual Statistics Dashboard of Student */}
                <Paper sx={{ p: 3, borderRadius: '24px', boxShadow: '0 4px 25px 0 rgba(0,0,0,0.05)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar
                      src={resolveFileUrl(selectedStudent.avatar)}
                      alt={selectedStudent.fullName}
                      sx={{
                        width: 50,
                        height: 50,
                        border: '2px solid #e2e8f0',
                        boxShadow: '0 4px 12px 0 rgba(0,0,0,0.08)',
                        bgcolor: '#6366f1'
                      }}
                    >
                      {selectedStudent.fullName?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
                        {selectedStudent.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                        @{selectedStudent.userName} • Báo cáo học tập & Đánh giá định kỳ
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={3} justifyContent="space-around">
                    {/* Gauge 1: Attendance */}
                    <Grid item xs={12} sm={4} align="center">
                      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1.5 }}>
                        <CircularProgress
                          variant="determinate"
                          value={100}
                          size={100}
                          thickness={5.5}
                          sx={{ color: '#e2e8f0' }}
                        />
                        <CircularProgress
                          variant="determinate"
                          value={selectedStudent.attendanceRate}
                          size={100}
                          thickness={5.5}
                          sx={{
                            color: selectedStudent.attendanceRate >= 80 ? '#10b981' : '#f59e0b',
                            position: 'absolute',
                            left: 0,
                            strokeLinecap: 'round'
                          }}
                        />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column'
                          }}
                        >
                          <Typography variant="h5" component="div" sx={{ fontWeight: 900, color: '#1e293b' }}>
                            {selectedStudent.attendanceRate}%
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                        Tỷ lệ chuyên cần
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        <CalendarMonthIcon sx={{ fontSize: 13, mr: 0.3, verticalAlign: 'text-bottom' }} />
                        Dựa trên buổi điểm danh
                      </Typography>
                    </Grid>

                    {/* Gauge 2: Homework Submitted */}
                    <Grid item xs={12} sm={4} align="center">
                      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1.5 }}>
                        <CircularProgress
                          variant="determinate"
                          value={100}
                          size={100}
                          thickness={5.5}
                          sx={{ color: '#e2e8f0' }}
                        />
                        <CircularProgress
                          variant="determinate"
                          value={selectedStudent.submissionRate}
                          size={100}
                          thickness={5.5}
                          sx={{
                            color: '#6366f1',
                            position: 'absolute',
                            left: 0,
                            strokeLinecap: 'round'
                          }}
                        />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column'
                          }}
                        >
                          <Typography variant="h5" component="div" sx={{ fontWeight: 900, color: '#1e293b' }}>
                            {selectedStudent.submissionRate}%
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                        Tỷ lệ nộp bài tập
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        <AssignmentIcon sx={{ fontSize: 13, mr: 0.3, verticalAlign: 'text-bottom' }} />
                        Số bài tập đã giao
                      </Typography>
                    </Grid>

                    {/* Gauge 3: Average Grade */}
                    <Grid item xs={12} sm={4} align="center">
                      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1.5 }}>
                        <CircularProgress
                          variant="determinate"
                          value={100}
                          size={100}
                          thickness={5.5}
                          sx={{ color: '#e2e8f0' }}
                        />
                        <CircularProgress
                          variant="determinate"
                          value={selectedStudent.averageScore * 10}
                          size={100}
                          thickness={5.5}
                          sx={{
                            color: selectedStudent.averageScore >= 8 ? '#8b5cf6' : '#d97706',
                            position: 'absolute',
                            left: 0,
                            strokeLinecap: 'round'
                          }}
                        />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column'
                          }}
                        >
                          <Typography variant="h4" component="div" sx={{ fontWeight: 950, color: '#1e293b' }}>
                            {selectedStudent.averageScore}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                        Điểm trung bình
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        <EmojiEventsIcon sx={{ fontSize: 13, mr: 0.3, verticalAlign: 'text-bottom' }} />
                        Hệ 10 (Homework/Test)
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Edit Evaluation Form */}
                <Paper sx={{ p: 3, borderRadius: '24px', boxShadow: '0 4px 25px 0 rgba(0,0,0,0.05)' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RateReviewIcon color="primary" /> Đánh giá định kỳ của giáo viên
                  </Typography>

                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                      <Card sx={{ border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: 'none', bgcolor: '#f8fafc' }}>
                        <CardContent sx={{ textAlign: 'center', p: '20px !important' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#475569' }}>
                            Chuyên cần (Attendance)
                          </Typography>
                          <Rating
                            value={attendanceScore}
                            onChange={(event, newValue) => setAttendanceScore(newValue || 5)}
                            emptyIcon={<StarIcon style={{ opacity: 0.35 }} fontSize="inherit" />}
                            sx={{ color: '#f59e0b' }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Card sx={{ border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: 'none', bgcolor: '#f8fafc' }}>
                        <CardContent sx={{ textAlign: 'center', p: '20px !important' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#475569' }}>
                            Học lực (Academic)
                          </Typography>
                          <Rating
                            value={academicScore}
                            onChange={(event, newValue) => setAcademicScore(newValue || 5)}
                            emptyIcon={<StarIcon style={{ opacity: 0.35 }} fontSize="inherit" />}
                            sx={{ color: '#8b5cf6' }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Card sx={{ border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: 'none', bgcolor: '#f8fafc' }}>
                        <CardContent sx={{ textAlign: 'center', p: '20px !important' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#475569' }}>
                            Thái độ (Behavior)
                          </Typography>
                          <Rating
                            value={behaviorScore}
                            onChange={(event, newValue) => setBehaviorScore(newValue || 5)}
                            emptyIcon={<StarIcon style={{ opacity: 0.35 }} fontSize="inherit" />}
                            sx={{ color: '#10b981' }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Comment Section */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#1e293b' }}>
                    Nhận xét / Phản hồi chi tiết
                  </Typography>
                  <TextField
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="Nhập lời nhận xét, lời khuyên và động viên học sinh tại đây..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    sx={{ mb: 3 }}
                  />

                  {/* Comment templates */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#64748b', fontSize: '12px' }}>
                    <MessageIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} /> Mẫu nhận xét nhanh
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                    {COMMENT_TEMPLATES.map((tmpl, idx) => (
                      <Chip
                        key={idx}
                        label={tmpl}
                        onClick={() => handleApplyTemplate(tmpl)}
                        variant="outlined"
                        size="small"
                        sx={{
                          fontSize: '11px',
                          color: '#475569',
                          borderColor: '#cbd5e1',
                          '&:hover': {
                            bgcolor: '#f1f5f9',
                            borderColor: '#94a3b8'
                          }
                        }}
                      />
                    ))}
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {/* Form Actions */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      {selectedStudent.evaluation && (
                        <Typography variant="caption" color="text.secondary">
                          Cập nhật cuối bởi <strong>{selectedStudent.evaluation.createdBy}</strong> lúc {new Date(selectedStudent.evaluation.updatedAt).toLocaleString('vi-VN')}
                        </Typography>
                      )}
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                      onClick={handleSaveEvaluation}
                      disabled={saving}
                      sx={{
                        borderRadius: '12px',
                        px: 4,
                        py: 1.2,
                        textTransform: 'none',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                          boxShadow: '0 6px 20px 0 rgba(79, 70, 229, 0.6)'
                        }
                      }}
                    >
                      Lưu đánh giá
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            ) : (
              <Paper sx={{ p: 6, borderRadius: '24px', textAlign: 'center', color: 'text.secondary' }}>
                Chọn một học viên bên danh sách để xem chi tiết và thực hiện đánh giá.
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    )
  }

  // ────────────────────────────────────────────────────────────────────────
  // STUDENT VIEW
  // ────────────────────────────────────────────────────────────────────────
  const studentData = selectedStudent
  return (
    <Box sx={{ pb: 6, maxWidth: '900px', mx: 'auto' }}>
      {studentData ? (
        <Stack spacing={4}>
          {/* Header Banner for Student */}
          <Paper
            sx={{
              p: 4,
              borderRadius: '28px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 30px 0 rgba(79, 70, 229, 0.3)'
            }}
          >
            {/* Background decorative circles */}
            <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <Box sx={{ position: 'absolute', bottom: -80, left: -20, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={2} align="center">
                <Avatar
                  src={resolveFileUrl(studentData.avatar)}
                  alt={studentData.fullName}
                  sx={{
                    width: 85,
                    height: 85,
                    border: '4px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 4px 15px 0 rgba(0,0,0,0.1)',
                    bgcolor: '#6366f1',
                    fontSize: '2rem',
                    fontWeight: 900
                  }}
                >
                  {studentData.fullName?.charAt(0).toUpperCase()}
                </Avatar>
              </Grid>
              <Grid item xs={12} sm={10}>
                <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: '-0.5px', mb: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                  Báo cáo Học tập lớp học
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                  <SchoolIcon sx={{ fontSize: 20 }} /> Học viên: {studentData.fullName} ({studentData.userName})
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* KPI Metrics Cards Grid */}
          <Grid container spacing={3}>
            {/* Metric 1: Attendance */}
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                    Chuyên cần (Attendance)
                  </Typography>
                  <CalendarMonthIcon sx={{ color: '#3b82f6' }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 950, color: '#1e293b', mb: 1 }}>
                  {studentData.attendanceRate}%
                </Typography>
                <Box sx={{ width: '100%', bgcolor: '#f1f5f9', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      width: `${studentData.attendanceRate}%`,
                      bgcolor: studentData.attendanceRate >= 80 ? '#10b981' : '#f59e0b',
                      height: '100%',
                      borderRadius: 3
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Dựa trên số buổi điểm danh của bạn
                </Typography>
              </Paper>
            </Grid>

            {/* Metric 2: Assignments Done */}
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.02)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                    Làm bài tập (Homework)
                  </Typography>
                  <TaskAltIcon sx={{ color: '#6366f1' }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 950, color: '#1e293b', mb: 1 }}>
                  {studentData.submissionRate}%
                </Typography>
                <Box sx={{ width: '100%', bgcolor: '#f1f5f9', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      width: `${studentData.submissionRate}%`,
                      bgcolor: '#6366f1',
                      height: '100%',
                      borderRadius: 3
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Bài tập đã hoàn thành / Bài được giao
                </Typography>
              </Paper>
            </Grid>

            {/* Metric 3: Grade Average */}
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.02)', background: 'linear-gradient(to right bottom, #ffffff, #faf5ff)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                    Điểm trung bình (Average)
                  </Typography>
                  <EmojiEventsIcon sx={{ color: '#8b5cf6' }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 950, color: '#8b5cf6', mb: 1 }}>
                  {studentData.averageScore}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Điểm trung bình các bài tập và bài kiểm tra
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Teacher Review Report */}
          <Paper sx={{ p: 4, borderRadius: '28px', boxShadow: '0 10px 35px 0 rgba(0,0,0,0.05)' }}>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <RateReviewIcon color="primary" /> Đánh giá từ Giáo viên
            </Typography>

            {studentData.evaluation ? (
              <Stack spacing={4}>
                {/* 3 Categories rating list */}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 800, mb: 1 }}>
                        Chuyên cần (Attendance)
                      </Typography>
                      <Rating value={studentData.evaluation.attendanceScore} readOnly sx={{ color: '#f59e0b' }} />
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 800, mb: 1 }}>
                        Học lực (Academic)
                      </Typography>
                      <Rating value={studentData.evaluation.academicScore} readOnly sx={{ color: '#8b5cf6' }} />
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 800, mb: 1 }}>
                        Thái độ học (Behavior)
                      </Typography>
                      <Rating value={studentData.evaluation.behaviorScore} readOnly sx={{ color: '#10b981' }} />
                    </Box>
                  </Grid>
                </Grid>

                <Divider />

                {/* Comment box */}
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1.5, color: '#475569' }}>
                    Nhận xét chi tiết của giáo viên:
                  </Typography>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: '20px',
                      bgcolor: '#f5f3ff',
                      borderLeft: '5px solid #7c3aed',
                      fontStyle: 'italic',
                      color: '#4c1d95',
                      fontSize: '16px',
                      lineHeight: '1.6',
                      boxShadow: 'none'
                    }}
                  >
                    &ldquo;{studentData.evaluation.comment || 'Học viên học tập nghiêm túc, phát huy tốt.'}&rdquo;
                  </Paper>
                </Box>

                <Box align="right">
                  <Typography variant="caption" color="text.secondary">
                    Được đánh giá bởi giáo viên <strong>{studentData.evaluation.createdBy}</strong> lúc {new Date(studentData.evaluation.updatedAt).toLocaleString('vi-VN')}
                  </Typography>
                </Box>
              </Stack>
            ) : (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Giáo viên chưa cập nhật đánh giá định kỳ cho bạn trong khóa học này. Hãy hoàn thành tốt các bài tập để có số liệu đẹp nhé!
                </Typography>
              </Box>
            )}
          </Paper>
        </Stack>
      ) : (
        <Paper sx={{ p: 6, borderRadius: '24px', textAlign: 'center', color: 'text.secondary' }}>
          Không tìm thấy dữ liệu báo cáo học tập của bạn.
        </Paper>
      )}
    </Box>
  )
}

export default CourseEvaluation
