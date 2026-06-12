import { useOutletContext } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Chip,
  Divider,
  Stack,
  Card,
  CardContent
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import ContactSupportIcon from '@mui/icons-material/ContactSupport'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import SchoolIcon from '@mui/icons-material/School'

const COLORS = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  accent: '#764ba2',
  secondary: '#667eea',
  bg: '#f8fafc'
}

function CourseContact() {
  const { course } = useOutletContext()

  const teachersMap = new Map()

  course?.CourseSchedule?.forEach(schedule => {
    if (schedule.Account) {
      teachersMap.set(schedule.Account.Id, {
        ...schedule.Account,
        role: 'Giáo viên chính',
        certificates: schedule.Account.AccountCertificate || []
      })
    }

    schedule.CourseScheduleDetail?.forEach(detail => {
      if (detail.Account && detail.IdAccountTeacher !== schedule.IdAccountTeacher) {
        teachersMap.set(detail.Account.Id, {
          ...detail.Account,
          role: 'Giáo viên phụ trách',
          certificates: detail.Account.AccountCertificate || []
        })
      }
    })
  })

  const teachers = Array.from(teachersMap.values())

  const hasContacts = teachers.length > 0

  return (
    <Box sx={{ animation: 'fadeIn 0.3s ease', p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ContactSupportIcon sx={{ color: COLORS.accent, fontSize: 32 }} /> Đội ngũ giảng dạy & Hỗ trợ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thông tin liên hệ chi tiết của Giáo viên phụ trách lớp {course?.Name}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Left column: Teachers cards */}
        <Grid item xs={12} md={hasContacts ? 8 : 12}>
          {!hasContacts ? (
            <Paper
              elevation={0}
              sx={{
                p: 8,
                borderRadius: '24px',
                textAlign: 'center',
                border: '1px dashed #cbd5e1',
                bgcolor: 'white'
              }}
            >
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(118, 75, 162, 0.08)', color: COLORS.accent, mx: 'auto', mb: 2 }}>
                <PersonOutlineIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#334155', mb: 1 }}>
                Chưa gán đội ngũ giảng dạy
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto' }}>
                Lịch học chi tiết của lớp chưa có thông tin giáo viên phụ trách. Vui lòng kiểm tra lại cấu hình lịch của lớp học.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={4}>
              {/* Teachers section */}
              {teachers.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#475569', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon sx={{ color: COLORS.accent }} /> Giáo viên phụ trách
                  </Typography>
                  <Grid container spacing={3}>
                    {teachers.map((teacher) => (
                      <Grid item xs={12} sm={6} key={teacher.Id}>
                        <TeacherCard person={teacher} isTeacher={true} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}


            </Stack>
          )}
        </Grid>

        {/* Right column: School / Center Contact information */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '28px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
              position: 'sticky',
              top: 84
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SchoolIcon sx={{ color: COLORS.accent, fontSize: 28 }} />
              Đơn vị quản lý
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: COLORS.accent, mb: 1 }}>
              {course?.School?.Name || 'Trung tâm Giáo dục'}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
              Vui lòng liên hệ Văn phòng hoặc Hotline hỗ trợ của cơ sở nếu bạn cần giúp đỡ về phòng học, tài liệu giảng dạy hoặc đóng phí.
            </Typography>

            <Divider sx={{ my: 2, borderColor: '#e2e8f0' }} />

            <Stack spacing={2.5}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(102, 126, 234, 0.08)', color: COLORS.secondary, width: 42, height: 42, borderRadius: '12px' }}>
                  <LocationOnIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Địa chỉ cơ sở</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                    {course?.School?.Address || 'Chưa cập nhật'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(118, 75, 162, 0.08)', color: COLORS.accent, width: 42, height: 42, borderRadius: '12px' }}>
                  <PhoneIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Hotline hỗ trợ</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                    {course?.School?.Phone || 'Chưa cập nhật'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(102, 126, 234, 0.08)', color: COLORS.secondary, width: 42, height: 42, borderRadius: '12px' }}>
                  <MenuBookIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Chương trình lớp</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                    {course?.Level?.Name || 'Học liệu Tiêu chuẩn'}
                  </Typography>
                </Box>
              </Box>
            </Stack>

            <Box
              sx={{
                mt: 4,
                p: 2,
                borderRadius: '16px',
                bgcolor: 'rgba(102, 126, 234, 0.04)',
                border: '1px solid rgba(102, 126, 234, 0.1)',
                textAlign: 'center'
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#667eea', display: 'block', mb: 0.5 }}>Giờ làm việc văn phòng</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
                Thứ 2 - Thứ Bảy (08:00 - 21:00) <br /> Chủ Nhật (08:00 - 17:00)
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

function TeacherCard({ person, isTeacher }) {
  const genderName = person.Gender?.Name || ''
  const genderColor = genderName === 'Nam' ? '#0ea5e9' : genderName === 'Nữ' ? '#ec4899' : '#64748b'

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '24px',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        bgcolor: 'white',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
          borderColor: isTeacher ? COLORS.accent : COLORS.secondary,
          '& .avatar-frame': {
            borderColor: isTeacher ? COLORS.accent : COLORS.secondary,
            transform: 'scale(1.05)'
          },
          '& .contact-icon': {
            color: isTeacher ? COLORS.accent : COLORS.secondary
          }
        }
      }}
    >
      {/* Visual background decoration */}
      <Box
        sx={{
          height: '80px',
          background: isTeacher
            ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(13, 148, 136, 0.08) 100%)',
          width: '100%'
        }}
      />

      <CardContent sx={{ pt: 0, px: 3, pb: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', mt: '-40px', alignItems: 'flex-end', justifyContent: 'space-between', mb: 2 }}>
          <Avatar
            src={person.LinkAvatar}
            className="avatar-frame"
            sx={{
              width: 80,
              height: 80,
              border: '4px solid white',
              boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
              bgcolor: isTeacher ? COLORS.accent : COLORS.secondary,
              fontSize: '1.8rem',
              fontWeight: 800,
              transition: 'all 0.3s ease'
            }}
          >
            {person.FullName ? person.FullName.charAt(0).toUpperCase() : '?'}
          </Avatar>
          <Chip
            className="role-badge"
            label={person.role}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '0.75rem',
              height: '24px',
              bgcolor: isTeacher ? 'rgba(118, 75, 162, 0.08)' : 'rgba(102, 126, 234, 0.08)',
              color: isTeacher ? COLORS.accent : COLORS.secondary,
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
          />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', mb: 0.5, lineHeight: 1.2 }}>
          {person.FullName}
        </Typography>

        {genderName && (
          <Typography variant="caption" sx={{ color: genderColor, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
            Giới tính: {genderName}
          </Typography>
        )}

        <Stack spacing={1.5} sx={{ mt: 1, flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <EmailIcon className="contact-icon" sx={{ fontSize: 18, color: '#94a3b8', transition: 'color 0.2s' }} />
            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.85rem', wordBreak: 'break-all' }}>
              {person.Email || 'Chưa cập nhật email'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PhoneIcon className="contact-icon" sx={{ fontSize: 18, color: '#94a3b8', transition: 'color 0.2s' }} />
            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>
              {person.Phone || 'Chưa cập nhật SĐT'}
            </Typography>
          </Box>

          {person.Address && (
            <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
              <LocationOnIcon className="contact-icon" sx={{ fontSize: 18, color: '#94a3b8', mt: 0.2, transition: 'color 0.2s' }} />
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.825rem', lineHeight: 1.4 }}>
                {person.Address}
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Certificate badges inside card */}
        {person.certificates && person.certificates.length > 0 ? (
          <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #f1f5f9' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Chứng chỉ chuyên môn
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
              {person.certificates.slice(0, 3).map((cert, idx) => (
                <Chip
                  key={cert.Id || idx}
                  label={cert.CertificateName}
                  size="small"
                  icon={<WorkspacePremiumIcon sx={{ fontSize: '12px !important', color: `${isTeacher ? COLORS.accent : COLORS.secondary} !important` }} />}
                  sx={{
                    bgcolor: isTeacher ? 'rgba(118, 75, 162, 0.05)' : 'rgba(102, 126, 234, 0.05)',
                    color: isTeacher ? COLORS.accent : COLORS.secondary,
                    fontWeight: 800,
                    fontSize: '0.675rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 0, 0, 0.03)',
                    height: '22px'
                  }}
                />
              ))}
              {person.certificates.length > 3 && (
                <Chip
                  label={`+${person.certificates.length - 3}`}
                  size="small"
                  sx={{
                    bgcolor: '#f1f5f9',
                    color: '#64748b',
                    fontWeight: 800,
                    fontSize: '0.675rem',
                    borderRadius: '8px',
                    height: '22px'
                  }}
                />
              )}
            </Stack>
          </Box>
        ) : (
          <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #f1f5f9' }}>
            <Chip
              label="Giảng viên đã qua đào tạo"
              size="small"
              icon={<WorkspacePremiumIcon sx={{ fontSize: '12px !important', color: `${isTeacher ? COLORS.accent : COLORS.secondary} !important` }} />}
              sx={{
                bgcolor: '#f8fafc',
                color: '#64748b',
                fontWeight: 700,
                fontSize: '0.675rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                height: '22px'
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default CourseContact
