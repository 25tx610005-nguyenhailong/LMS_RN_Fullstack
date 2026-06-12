import {
  Grid, Paper, Box, Typography, Avatar, Divider, Button,
  Stack, Chip, alpha, IconButton, Tooltip
} from '@mui/material'
import { useOutletContext, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import SchoolIcon from '@mui/icons-material/School'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { resolveFileUrl, getFrontendEnrollLink } from '~/utils/formatters'
import moment from 'moment'
import { toast } from 'react-toastify'

function SchoolClasses() {
  const { data: dashboardData } = useOutletContext()
  const { schoolId } = useParams()
  const navigate = useNavigate()
  const role = useSelector(state => state.user.currentUser?.role?.toUpperCase())
  const assignedClassIds = useSelector(state => state.user.currentUser?.assignedClassIds)
  const allowedClassIds = assignedClassIds || []

  const filteredClasses = (dashboardData.classes || []).filter(c => {
    return role === 'ADMIN' || allowedClassIds.length === 0 || allowedClassIds.includes(c.Id)
  })

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>Danh sách lớp học</Typography>
          <Typography variant="body2" color="text.secondary">Quản lý và điều phối các khóa học hiện có</Typography>
        </Box>
        {role === 'ADMIN' && (
          <Button
            variant="contained" startIcon={<AddIcon />}
            onClick={() => navigate(`/school/${schoolId}/create-class`)}
            sx={{ borderRadius: '12px', px: 3, py: 1, fontWeight: 700, textTransform: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
          Thêm lớp học mới
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {filteredClasses.map(course => (
          <Grid item xs={12} md={4} key={course.Id} sx={{ display: 'flex' }}>
            <Paper
              elevation={0}
              sx={{
                p: 3, borderRadius: '24px', border: '1px solid #e2e8f0', bgcolor: 'white',
                width: '100%', display: 'flex', flexDirection: 'column',
                transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', borderColor: '#6366f1' }
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar
                      src={resolveFileUrl(course.Thumbnail)}
                      variant="rounded"
                      sx={{ width: 60, height: 60, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Box>
                      <Chip label={course.Level?.Name} size="small" sx={{ fontWeight: 800, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>{course.Name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{course.Id}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontWeight: 600 }}>
                        Lịch: {course.StartDate ? moment(course.StartDate).format('DD/MM/YYYY') : '--'} - {course.EndDate ? moment(course.EndDate).format('DD/MM/YYYY') : '--'}
                      </Typography>
                    </Box>
                  </Box>
                  {course.IsOnline && <Chip label="Online" size="small" color="success" sx={{ fontWeight: 700 }} />}
                </Box>

                {/* Link Ghi Danh */}
                {role !== 'STUDENT' && course.LinkEnrol && (
                  <Box sx={{
                    p: 1.2,
                    mb: 1.5,
                    borderRadius: '12px',
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1
                  }}>
                    <Typography variant="caption" sx={{
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      color: '#475569',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}>
                      {getFrontendEnrollLink(course.LinkEnrol, course.Id)}
                    </Typography>
                    <Tooltip title="Sao chép Link ghi danh">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard.writeText(getFrontendEnrollLink(course.LinkEnrol, course.Id))
                          toast.success('📋 Đã sao chép liên kết ghi danh!')
                        }}
                        sx={{
                          color: '#6366f1',
                          p: 0.5,
                          '&:hover': { bgcolor: alpha('#6366f1', 0.1) }
                        }}
                      >
                        <ContentCopyIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#f1f5f9', color: '#64748b' }}><SchoolIcon fontSize="inherit" /></Avatar>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{course._count?.CourseStudent || 0} Học viên</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  {role === 'ADMIN' && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon sx={{ fontSize: '14px !important' }} />}
                      onClick={() => navigate(`/school/${schoolId}/edit-class/${course.Id}`)}
                      sx={{
                        fontWeight: 800,
                        textTransform: 'none',
                        borderRadius: '8px',
                        borderColor: '#e2e8f0',
                        color: '#64748b',
                        '&:hover': { borderColor: '#6366f1', color: '#6366f1', bgcolor: alpha('#6366f1', 0.05) }
                      }}
                    >
                      Chỉnh sửa
                    </Button>
                  )}
                  <Button
                    size="small"
                    sx={{ fontWeight: 800, textTransform: 'none' }}
                    onClick={() => window.open(`/courses/${course.Id}/schedule`, '_blank')}
                  >
                    Chi tiết →
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default SchoolClasses


