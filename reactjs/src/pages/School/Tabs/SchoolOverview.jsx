import { Grid, Paper, Avatar, Box, Typography, LinearProgress, Chip, Stack } from '@mui/material'
import { useOutletContext } from 'react-router-dom'
import PeopleIcon from '@mui/icons-material/People'
import ClassIcon from '@mui/icons-material/Class'
import SchoolIcon from '@mui/icons-material/School'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import LanguageIcon from '@mui/icons-material/Language'
import WorkIcon from '@mui/icons-material/Work'
import StarIcon from '@mui/icons-material/Star'
import GroupIcon from '@mui/icons-material/Group'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { resolveFileUrl } from '~/utils/formatters'

function SchoolOverview() {
  const { data } = useOutletContext()
  const classes = data?.classes || []
  const teachers = data?.teachers || []
  const statistics = data?.statistics || {}

  const totalClasses = statistics.classesCount || classes.length || 0
  const totalTeachers = statistics.teachersCount || teachers.length || 0
  const totalStudents = statistics.studentsCount || 0

  // 1. Calculate Average Class Size
  const avgClassSize = totalClasses > 0 ? (totalStudents / totalClasses).toFixed(1) : 0

  // 2. Calculate Online vs Offline Classes
  const onlineClassesCount = classes.filter(c => c.IsOnline).length
  const offlineClassesCount = Math.max(0, totalClasses - onlineClassesCount)
  const onlinePct = totalClasses > 0 ? Math.round((onlineClassesCount / totalClasses) * 100) : 0

  // 3. Group Classes and Students by Level
  const levelStatsMap = {}
  classes.forEach(cls => {
    const levelId = cls.Level?.Id || 'none'
    const levelName = cls.Level?.Name || 'Chưa xếp Level'
    if (!levelStatsMap[levelId]) {
      levelStatsMap[levelId] = {
        id: levelId,
        name: levelName,
        classCount: 0,
        studentCount: 0
      }
    }
    levelStatsMap[levelId].classCount += 1
    levelStatsMap[levelId].studentCount += cls._count?.CourseStudent || 0
  })

  const levelStatsList = Object.values(levelStatsMap)
    .sort((a, b) => b.classCount - a.classCount)

  // 4. Calculate Teacher Contract Types (Fixed vs Hourly Salary)
  let fixedSalaryCount = 0
  let hourlySalaryCount = 0
  teachers.forEach(t => {
    const salary = t.AccountSalary?.[0]
    if (salary) {
      if (salary.TypeSalary === 1) fixedSalaryCount += 1
      else if (salary.TypeSalary === 2) hourlySalaryCount += 1
    }
  })

  // 5. Featured Classes (Top 4 by Student Count)
  const featuredClasses = [...classes]
    .sort((a, b) => (b._count?.CourseStudent || 0) - (a._count?.CourseStudent || 0))
    .slice(0, 4)

  const stats = [
    {
      label: 'Học viên',
      value: totalStudents,
      subtext: `Quy mô TB: ${avgClassSize} học viên / lớp`,
      icon: <SchoolIcon sx={{ fontSize: 32 }} />,
      color: '#6366f1',
      bgGlow: 'rgba(99, 102, 241, 0.15)'
    },
    {
      label: 'Lớp học',
      value: totalClasses,
      subtext: `${onlineClassesCount} Trực tuyến | ${offlineClassesCount} Trực tiếp`,
      icon: <ClassIcon sx={{ fontSize: 32 }} />,
      color: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.15)'
    },
    {
      label: 'Giáo viên',
      value: totalTeachers,
      subtext: `${fixedSalaryCount} Cố định | ${hourlySalaryCount} Theo giờ`,
      icon: <PeopleIcon sx={{ fontSize: 32 }} />,
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.15)'
    }
  ]

  const LEVEL_COLORS = [
    '#6366f1', // Indigo
    '#0ea5e9', // Sky Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#8b5cf6' // Purple
  ]

  return (
    <Box sx={{ p: 1, animation: 'fadeIn 0.3s ease' }}>
      {/* 3 Stat Cards at top */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Paper sx={{
              p: 3,
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              bgcolor: 'white',
              '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: `0 20px 40px ${stat.bgGlow}`
              }
            }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: `${stat.color}12`, color: stat.color, border: `1.5px solid ${stat.color}25` }}>
                {stat.icon}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-1px', mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b', mb: 0.5 }}>
                  {stat.label}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#94a3b8', display: 'block' }}>
                  {stat.subtext}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Level Distribution & Statistics Breakdown */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Left: Classes per Level distribution */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3.5, borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.01)', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3.5 }}>
              <TrendingUpIcon color="primary" sx={{ fontSize: 24 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 850, color: '#1e293b' }}>
                  Phân bố Lớp học theo Cấp độ (Level)
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Thống kê số lượng lớp học hoạt động thực tế trên từng trình độ level của trường học.
                </Typography>
              </Box>
            </Box>

            {levelStatsList.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>Chưa có dữ liệu lớp học nào được chỉ định Level.</Typography>
              </Box>
            ) : (
              <Stack spacing={3.5}>
                {levelStatsList.map((level, idx) => {
                  const pct = totalClasses > 0 ? Math.round((level.classCount / totalClasses) * 100) : 0
                  const color = LEVEL_COLORS[idx % LEVEL_COLORS.length]
                  return (
                    <Box key={level.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                            Trình độ {level.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 850, color: '#475569' }}>
                          {level.classCount} lớp ({level.studentCount} học viên)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 10,
                          borderRadius: '5px',
                          bgcolor: '#f1f5f9',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: '5px',
                            background: `linear-gradient(90deg, ${color} 0%, ${color}aa 100%)`
                          }
                        }}
                      />
                    </Box>
                  )
                })}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Right: Operational breakdown details */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3.5, borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.01)', height: '100%', display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 850, color: '#1e293b', mb: 0.5 }}>
                Hình thức & Nhân sự
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Chi tiết tỷ lệ vận hành hình thức giảng dạy và phân bổ cơ chế hợp đồng của cơ sở.
              </Typography>
            </Box>

            {/* Delivery mode split */}
            <Box sx={{ p: 2.5, borderRadius: '20px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LanguageIcon sx={{ fontSize: 18, color: '#6366f1' }} /> Hình thức giảng dạy
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 850, color: '#1e293b' }}>
                  {onlinePct}% Online
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={onlinePct}
                sx={{
                  height: 10,
                  borderRadius: '5px',
                  bgcolor: '#f1f5f9',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: '5px',
                    background: 'linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)'
                  }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#94a3b8' }}>
                  {onlineClassesCount} lớp học trực tuyến
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#94a3b8' }}>
                  {offlineClassesCount} lớp tại trung tâm
                </Typography>
              </Box>
            </Box>

            {/* Teacher contract split */}
            <Box sx={{ p: 2.5, borderRadius: '20px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkIcon sx={{ fontSize: 18, color: '#10b981' }} /> Cơ cấu hợp đồng giảng dạy
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 850, color: '#1e293b' }}>
                  {totalTeachers > 0 ? Math.round((fixedSalaryCount / totalTeachers) * 100) : 0}% Cố định
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={totalTeachers > 0 ? (fixedSalaryCount / totalTeachers) * 100 : 0}
                sx={{
                  height: 10,
                  borderRadius: '5px',
                  bgcolor: '#f1f5f9',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: '5px',
                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                  }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#94a3b8' }}>
                  {fixedSalaryCount} giáo viên cố định (Full-time)
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#94a3b8' }}>
                  {hourlySalaryCount} giáo viên theo giờ (Part-time)
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Featured classes section */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <StarIcon sx={{ color: '#f59e0b', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 850, color: '#1e293b' }}>
              Lớp học nổi bật quy mô học viên lớn
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              Top các lớp học đang thu hút đông học sinh tham gia học tập nhất trong cơ sở.
            </Typography>
          </Box>
        </Box>

        {featuredClasses.length === 0 ? (
          <Paper sx={{ py: 8, textAlign: 'center', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>Cơ sở dữ liệu hiện tại chưa có thông tin lớp học nào.</Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {featuredClasses.map((cls) => {
              const studentCount = cls._count?.CourseStudent || 0
              const isOnline = cls.IsOnline
              const levelName = cls.Level?.Name || 'Chưa phân cấp'
              const bgGradientClass = isOnline
                ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                : 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)'

              return (
                <Grid item xs={12} sm={6} md={3} key={cls.Id}>
                  <Paper sx={{
                    borderRadius: '24px',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    height: '100%',
                    bgcolor: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.08)'
                    }
                  }}>
                    {/* Class image or gradient */}
                    <Box sx={{ height: 130, position: 'relative', background: cls.Thumbnail ? 'none' : bgGradientClass, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {cls.Thumbnail ? (
                        <img
                          src={resolveFileUrl(cls.Thumbnail)}
                          alt={cls.Name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Typography sx={{ fontWeight: 900, color: 'white', fontSize: '2rem', letterSpacing: '2px', opacity: 0.85 }}>
                          {cls.Name.substring(0, 2).toUpperCase()}
                        </Typography>
                      )}

                      {/* Floating Level & Online badges */}
                      <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 0.75 }}>
                        <Chip
                          label={levelName}
                          size="small"
                          sx={{
                            height: 20,
                            bgcolor: 'rgba(255,255,255,0.95)',
                            color: '#1e293b',
                            fontWeight: 800,
                            fontSize: '0.65rem'
                          }}
                        />
                        {isOnline ? (
                          <Chip
                            label="ONLINE"
                            size="small"
                            sx={{
                              height: 20,
                              bgcolor: '#10b981',
                              color: 'white',
                              fontWeight: 800,
                              fontSize: '0.65rem'
                            }}
                          />
                        ) : (
                          <Chip
                            label="OFFLINE"
                            size="small"
                            sx={{
                              height: 20,
                              bgcolor: '#ef4444',
                              color: 'white',
                              fontWeight: 800,
                              fontSize: '0.65rem'
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Class details */}
                    <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', mb: 0.5 }}>
                        MÃ: {cls.Id}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 850, color: '#1e293b', fontSize: '0.925rem', lineHeight: 1.3, mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {cls.Name}
                      </Typography>

                      <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', pt: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#475569' }}>
                          <GroupIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                          <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.775rem' }}>
                            {studentCount} học viên
                          </Typography>
                        </Box>
                        <ArrowForwardIcon sx={{ fontSize: 16, color: '#cbd5e1' }} />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Box>
    </Box>
  )
}

export default SchoolOverview
